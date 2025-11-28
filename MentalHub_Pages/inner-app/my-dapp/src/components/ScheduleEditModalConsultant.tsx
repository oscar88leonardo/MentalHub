"use client"
import React, { useEffect, useMemo, useState } from "react";
import { openMeet } from "@/lib/meet";
import { openRoomFlowNoCheck } from "@/lib/openRoom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCeramic } from "@/context/CeramicContext";
// import { getContract, readContract } from "thirdweb"; // Removed
// import { client } from "@/lib/client"; // Removed
// import { myChain } from "@/config/chain"; // Removed
// import { contracts } from "@/config/contracts"; // Removed
// import { abi } from "@/abicontracts/MembersAirdrop"; // Removed

interface ScheduleItem {
  id: string;
  start: Date;
  end: Date;
  roomId: string;
  tokenId?: number;
  nftContract?: string;
  therapistName?: string;
  therapistId?: string;
  state?: string; // Added state property to interface
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem;
  onSaved?: () => void;
  onUpdated?: (expected?: 'Pending' | 'Confirmed' | 'Active' | 'Finished' | 'Cancelled') => void;
}

const ScheduleEditModalConsultant: React.FC<Props> = ({ isOpen, onClose, schedule, onSaved, onUpdated }) => {
  const { account, authenticateForWrite, executeQuery } = useCeramic();
  const [busy, setBusy] = useState<"none" | "open" | "cancel">("none");
  const [toast, setToast] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);

  // Editable fields
  const [start, setStart] = useState<Date>(schedule.start);
  const [end, setEnd] = useState<Date>(schedule.end);
  const [tokenId, setTokenId] = useState<string>(schedule.tokenId != null ? String(schedule.tokenId) : "");
  const [isSaving, setIsSaving] = useState(false);
  // Usar el estado que viene de la prop o Pending por defecto
  const [status, setStatus] = useState<string>(schedule.state || 'Pending');
  const isEditable = status === 'Pending';
  
  // ELIMINADO: const [userTokenId, setUserTokenId] = useState<string>("");
  // ELIMINADO: const contract = useMemo(...)
  
  useEffect(() => {
    // Sync status if prop updates
    if (schedule.state) setStatus(schedule.state);
  }, [schedule.state]);

  // ELIMINADO: useEffect para buscar el token del usuario

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

  const openRoom = async () => {
    if (!schedule) return;
    
    // ELIMINADO: Validaciones de tokenToUse ...

    try {
      setBusy("open");
      const { txPromise } = await openRoomFlowNoCheck({
        // tokenId removido de los params
        scheduleId: schedule.id,
        start,
        end,
        defaultRoomId: schedule.roomId,
        openMeet,
        optimistic: true,
      });
      try {
        const r = await txPromise;
        const j = await r?.json();
        const newStateNum = j?.data?.newState ?? j?.newState;
        if (newStateNum === 2) {
          setStatus('Active');
          try { onUpdated?.('Active'); } catch {}
        }
      } catch {}
    } catch (e: any) {
      const msg = e?.message === 'TIME_WINDOW'
        ? 'La sala solo está disponible en la franja horaria programada.'
        : e?.message === 'NO_TOKEN'
          ? 'No se encontró una Inner Key asociada a esta consulta.'
          : e?.message === 'INVALID_ROOM'
            ? 'La sala seleccionada no pertenece al terapeuta de esta consulta.'
            : 'Error al abrir la sala';
      showToast(msg, 'error');
    } finally {
      setBusy("none");
    }
  };

  const cancelSession = async () => {
    if (!schedule?.id) return;
    
    // CONFIRMACIÓN NATIVA
    if (!window.confirm("¿Estás seguro de que deseas cancelar tu cita?")) {
        return;
    }

    try {
      setBusy("cancel"); 
      
      const now = new Date().toISOString();
      
      const mutation = `
        mutation {
          createSessionResponse(input: {
            content: {
              scheduleId: "${schedule.id}",
              status: CANCELLED,
              created: "${now}",
              note: "Cancelado por consultante"
            }
          }) {
            document { id }
          }
        }
      `;
      const res: any = await executeQuery(mutation);
      if (res?.errors) throw new Error(res.errors[0].message);

      setStatus('Cancelled');
      try { onUpdated?.('Cancelled'); } catch {}
      showToast('Consulta cancelada', 'success');
      
    } catch {
      showToast('Error al cancelar la consulta.', 'error');
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
            {/* Botón guardar solo si es editable (Pending) */}
            {isEditable && (
              <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="px-4 py-2 rounded border text-white border-white/40 hover:bg-white/10 disabled:opacity-60">
              {isSaving ? 'Guardando…' : 'Guardar'}</button>
            )}
            
            {/* Botón Cancelar: Solo visible si está Pending */}
            {status === 'Pending' && (
              <button 
              onClick={cancelSession}
              disabled={busy !== 'none'} 
              className="px-4 py-2 rounded text-white shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: '1px solid rgba(255,255,255,0.25)' }}>
              {busy === 'cancel' ? 'Cancelando…' : 'Cancelar Cita'}
              </button>
            )}
            
            {/* Botón Abrir Sala: Solo si Confirmed o Active */}
            { (status === 'Confirmed' || status === 'Active') && (
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
