"use client"
import React, { useEffect, useMemo, useState } from "react";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { openMeet } from "@/lib/meet";
import { useCeramic } from "@/context/CeramicContext";
import { openRoomFlowNoCheck } from "@/lib/openRoom";
import { getContract, readContract } from "thirdweb";
import { contracts } from "@/config/contracts";
import { abi } from "@/abicontracts/MembersAirdrop";

interface EventItem {
  id: string;
  start: Date;
  end: Date;
  state: string;
  roomId: string;
  displayName: string;
  tokenId?: number;
  nftContract?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  event: EventItem;
}

const ScheduleDetailsModal: React.FC<Props> = ({ isOpen, onClose, onUpdated, event }) => {
  const [busy, setBusy] = useState<'none' | 'open' | 'finalize'>('none');
  const [toast, setToast] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [availableSessions, setAvailableSessions] = useState<number | null>(null);
  const { profile, executeQuery } = useCeramic();
  // Sin gestión de múltiples salas

  const contract = useMemo(() => getContract({ client: client!, chain: myChain, address: contracts.membersAirdrop, abi: abi as [] }), []);

  // (sin edición): no se cargan salas ni se manejan estados locales de sala/fechas

  // Sesiones disponibles del NFT asociado (Inner Key)
  useEffect(() => {
    const run = async () => {
      try {
        if (event.tokenId == null) { setAvailableSessions(null); return; }
        const avail = await readContract({ contract, method: "function getAvailableSessions(uint256 _tokenId) public view returns (uint256)", params: [BigInt(event.tokenId)] });
        setAvailableSessions(Number(avail as any));
      } catch {
        setAvailableSessions(null);
      }
    };
    run();
  }, [event.tokenId, contract]);

  // Se elimina la carga de salas

  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openRoom = async () => {
    try {
      setBusy('open');
      await openRoomFlowNoCheck({
        tokenId: event.tokenId,
        scheduleId: event.id,
        start: event.start,
        end: event.end,
        defaultRoomId: event.roomId,
        openMeet,
        optimistic: true,
      });
      onUpdated?.();
    } catch (e: any) {
      const msg = e?.message === 'TIME_WINDOW'
        ? 'La sala solo está disponible en la franja horaria programada.'
        : e?.message === 'NO_TOKEN'
          ? 'No se encontró una Inner Key asociada a esta consulta.'
          : e?.message === 'INVALID_ROOM'
            ? 'La sala seleccionada no pertenece al terapeuta.'
            : 'Error al abrir la sala';
      showToast(msg, 'error');
    } finally {
      setBusy('none');
    }
  };

  const finalizeSession = async () => {
    try {
      setBusy('finalize');
      const now = new Date();
      const endMs = (event.end instanceof Date ? event.end : new Date(event.end)).getTime();
      if (now.getTime() < endMs) {
        showToast('Solo puedes finalizar después del horario programado.', 'error');
        setBusy('none');
        return;
      }
      if (event.tokenId == null) {
        showToast('No se encontró una Inner Key asociada a esta consulta.', 'error');
        setBusy('none');
        return;
      }
      try {
        await fetch('/api/callsetsession', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId: String(event.tokenId), scheduleId: event.id, state: 3 })
        });
        showToast('Consulta finalizada', 'success');
        onUpdated?.();
      } catch {
        showToast('Error al finalizar la consulta.', 'error');
      }
    } catch {
      showToast('Error al finalizar la consulta.', 'error');
    } finally {
      setBusy('none');
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}>
      <div className="w-full max-w-xl rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #6666ff 0%, #7a7aff 50%, #339999 100%)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
          <h4 className="text-lg font-semibold text-white">Detalle de sesión</h4>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {toast && (
          <div className="mx-4 mt-4 p-3 rounded-xl border"
            style={{
              background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59,130,246,0.15)',
              borderColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(59,130,246,0.35)'
            }}
          >
            <p className="text-white/90 text-sm">{toast.text}</p>
          </div>
        )}
        <div className="p-4 space-y-2 text-white/90">
          <p><span className="font-semibold">Consultante:</span> {event.displayName || 'N/A'}</p>
          <p><span className="font-semibold">Sala:</span> {event.roomId}</p>
          <p><span className="font-semibold">Inicio:</span> {event.start.toLocaleString('es-ES')}</p>
          <p><span className="font-semibold">Fin:</span> {event.end.toLocaleString('es-ES')}</p>
          <p><span className="font-semibold">Estado:</span> {event.state}</p>
          <p><span className="font-semibold">Inner Key:</span> Id: {event.tokenId ?? '—'} {availableSessions != null && (<span className="text-white/80">- # sesiones: {availableSessions}</span>)}</p>
          {/* Sin selección de sala */}
        </div>
        <div className="p-4 flex justify-end gap-3">
          {event.state === 'Active' && (
            <button
              disabled={busy!=='none'}
              onClick={finalizeSession}
              className="px-4 py-2 rounded text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ff6666 0%, #cc4d4d 100%)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              {busy==='finalize' ? 'Finalizando...' : 'Finalizar'}
            </button>
          )}
          <button disabled={busy!=='none'} onClick={openRoom} className="px-4 py-2 rounded text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 100%)', border: '1px solid rgba(255,255,255,0.25)' }}>{busy==='open'?'Abriendo...':'Abrir Sala'}</button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsModal;


