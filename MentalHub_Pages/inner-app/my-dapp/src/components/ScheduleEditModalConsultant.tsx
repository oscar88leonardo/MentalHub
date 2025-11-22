"use client"
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCeramic } from "@/context/CeramicContext";
import { openMeet } from "@/lib/meet";

interface ScheduleItem {
  id: string;
  start: Date;
  end: Date;
  roomId: string;
  tokenId?: number;
  nftContract?: string;
  therapistName?: string;
  therapistId?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem;
  onSaved?: () => void;
  onUpdated?: (expected?: 'Pending' | 'Confirmed' | 'Active' | 'Finished' | 'Cancelled') => void;
}

const ScheduleEditModalConsultant: React.FC<Props> = ({ isOpen, onClose, schedule, onSaved, onUpdated }) => {
  const { authenticateForWrite, executeQuery, updateScheduleState } = useCeramic() as any;
  const [busy, setBusy] = useState<"none" | "open">("none");
  const [toast, setToast] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);

  // Editable fields
  const [start, setStart] = useState<Date>(schedule.start);
  const [end, setEnd] = useState<Date>(schedule.end);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>('Pending');
  const isEditable = status === 'Pending';

  // Leer estado en Ceramic para controlar editabilidad y mostrar estado
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
      const q = `
        query {
            node(id: "${schedule.id}") {
              ... on Schedule {
                state
            }
          }
        }
      `;
        const res: any = await executeQuery(q);
        const st = res?.data?.node?.state as string | undefined;
        if (!cancelled && st) setStatus(st);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [schedule?.id, executeQuery]);

// (Se elimina carga de salas; se usa roomId fijo en la cita)

  const showToast = (text: string, type: "error" | "success" | "info" = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!schedule?.id) return;
    setIsSaving(true);
    try {
      if (!isEditable) {
        showToast('La consulta no es editable en su estado actual.', 'error');
        setIsSaving(false);
        return;
      }
      try { await authenticateForWrite(); } catch {
        showToast('Se requiere autenticación para guardar cambios.', 'error');
        setIsSaving(false);
        return;
      }

      const now = new Date();
      const mutation = `
        mutation {
          updateSchedule(
            input: { id: "${schedule.id}", content: { date_init: "${start.toISOString()}", date_finish: "${end.toISOString()}", edited: "${now.toISOString()}" } }
          ) {
            document { id }
          }
        }
      `;
      const res: any = await executeQuery(mutation);
      if (!res?.errors) {
        showToast('Cambios guardados', 'success');
        try { onSaved?.(); } catch {}
        onClose();
      } else {
        showToast('No se pudo guardar la consulta', 'error');
      }
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelSession = async () => {
    if (!schedule?.id) return;
    try {
      setBusy("open");
      const s = await (updateScheduleState as Function)(schedule.id, 'Cancelled');
      if (s === 'Cancelled') {
        setStatus('Cancelled');
        try { onUpdated?.('Cancelled'); } catch {}
      }
    } catch {
      showToast('Error al cancelar la consulta.', 'error');
    } finally {
      setBusy("none");
    }
  };

  const openRoom = async () => {
    if (!schedule) return;
    try {
      setBusy("open");
      // Validar ventana de tiempo
      const now = new Date();
      if (!(now >= schedule.start && now <= schedule.end)) {
        showToast('La sala solo está disponible en la franja horaria programada.', 'error');
        setBusy("none");
        return;
      }
      // Lectura previa: si ya está Active, solo abrir sala
      try {
        const rState: any = await executeQuery(`query($id: ID!){ node(id:$id){ ... on Schedule { state } } }`, { id: schedule.id });
        const curState = rState?.data?.node?.state as string | undefined;
        if (curState === 'Active') {
          openMeet(schedule.roomId);
          setStatus('Active');
          try { onUpdated?.('Active'); } catch {}
          setBusy("none");
          return;
        }
      } catch {}
      // Intentar poner en Active y abrir sala
      const s = await (updateScheduleState as Function)(schedule.id, 'Active');
      if (s === 'Active') {
        setStatus('Active');
        try { onUpdated?.('Active'); } catch {}
        openMeet(schedule.roomId);
      }
    } catch (e: any) {
      showToast(e?.message || 'Error al abrir la sala', 'error');
    } finally {
      setBusy("none");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}>
      <div className="w-full max-w-xl rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #6666ff 0%, #7a7aff 50%, #339999 100%)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
          <h4 className="text-lg font-semibold text-white">Detalle de la consulta</h4>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 space-y-4 text-white">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <p className="text-white/80 text-sm">Terapeuta: <span className="font-semibold text-white">{schedule.therapistName || '—'}</span></p>
              <p className="text-white/80 text-sm">Estado: <span className="font-semibold text-white">{status}</span></p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Sala actual: <span className="font-semibold text-white">{schedule.roomId || '—'}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/80 text-sm">Inicio</p>
                <DatePicker
                  selected={start}
                  onChange={(d) => d && setStart(d)}
                  showTimeInput
                  dateFormat="MM/dd/yyyy h:mm aa"
                  className="w-full px-3 py-2 rounded border bg-white text-black"
                  disabled={!isEditable}
                />
              </div>
              <div>
                <p className="text-white/80 text-sm">Fin</p>
                <DatePicker
                  selected={end}
                  onChange={(d) => d && setEnd(d)}
                  showTimeInput
                  dateFormat="MM/dd/yyyy h:mm aa"
                  className="w-full px-3 py-2 rounded border bg-white text-black"
                  disabled={!isEditable}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
            onClick={handleSave} 
            disabled={isSaving || !isEditable} 
            className="px-4 py-2 rounded border text-white border-white/40 hover:bg-white/10 disabled:opacity-60">
            {isSaving ? 'Guardando…' : 'Guardar'}</button>
            {status === 'Pending' && (
              <button 
              onClick={cancelSession}
              disabled={busy !== 'none'} 
              className="px-4 py-2 rounded text-white shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: '1px solid rgba(255,255,255,0.25)' }}>
              {busy === 'open' ? 'Cancelando…' : 'Cancelar'}
              </button>
            )}
            {(status === 'Confirmed' || status === 'Active') && (
              <button 
              onClick={openRoom} 
              disabled={busy !== 'none'} 
              className="px-4 py-2 rounded text-white shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 100%)', border: '1px solid rgba(255,255,255,0.25)' }}>
              {busy === 'open' ? 'Abriendo…' : 'Abrir Sala'}
            </button>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg shadow"
             style={{ background: toast.type === 'error' ? 'rgba(220,38,38,0.95)' : (toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(55,65,81,0.95)'), color: '#fff' }}>
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default ScheduleEditModalConsultant;


