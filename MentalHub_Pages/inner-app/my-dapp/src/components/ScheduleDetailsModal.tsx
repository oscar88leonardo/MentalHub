"use client"
import React, { useEffect, useMemo, useState } from "react";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { openMeet } from "@/lib/meet";
import { useCeramic } from "@/context/CeramicContext";
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
  profileId?: string;
  profileRole?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (expected?: 'Pending' | 'Confirmed' | 'Active' | 'Finished' | 'Cancelled') => void;
  event: EventItem;
}

const ScheduleDetailsModal: React.FC<Props> = ({ isOpen, onClose, onUpdated, event }) => {
  const [busy, setBusy] = useState<'none' | 'open' | 'finalize' | 'confirm'>('none');
  const [toast, setToast] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const { profile, executeQuery, authenticateForWrite, account } = useCeramic();
  
  const contract = useMemo(() => getContract({ client: client!, chain: myChain, address: contracts.membersAirdrop, abi: abi as [] }), []);

  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openRoom = async () => {
    try {
      setBusy('open');
      const now = new Date();
      const start = event.start instanceof Date ? event.start : new Date(event.start);
      const end = event.end instanceof Date ? event.end : new Date(event.end);

      // 1. Validar ventana de tiempo (opcionalmente con tolerancia de 10 mins antes)
      const bufferMs = 10 * 60 * 1000; 
      if (now.getTime() < (start.getTime() - bufferMs) || now.getTime() > end.getTime()) {
         showToast('La sala solo está disponible en la franja horaria programada.', 'error');
         setBusy('none');
         return;
      }

      // 2. Validar tenencia de NFT (Gatekeeping genérico)
      if (!account?.address) {
        showToast('Conecta tu wallet para verificar acceso.', 'error');
        setBusy('none');
        return;
      }
      
      try {
        const tokenIds = await readContract({
          contract,
          method: "function walletOfOwner(address _owner) view returns (uint256[])",
          params: [account.address],
        });
        
        if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
          showToast('Necesitas poseer una Inner Key (NFT) para acceder a la sala.', 'error');
          setBusy('none');
          return;
        }
      } catch (e) {
        console.error(e);
        showToast('Error verificando NFT en blockchain.', 'error');
        setBusy('none');
        return;
      }

      if (!event.roomId) {
        showToast('No se encontró una sala asignada.', 'error');
        setBusy('none');
        return;
      }

      // 3. Abrir sala
      openMeet(event.roomId);

      // No es necesario cambiar estado en Ceramic (Active es derivado de Confirmed + Hora)
      onUpdated?.('Active'); 
    } catch (e: any) {
      showToast('Error al abrir la sala', 'error');
    } finally {
      setBusy('none');
    }
  };

  const confirmSession = async () => {
    try {
      setBusy('confirm');
      try { await authenticateForWrite(); } catch {
        showToast('Se requiere autenticación para confirmar.', 'error');
        setBusy('none');
        return;
      }

      const now = new Date().toISOString();
      const mutation = `
        mutation {
          createSessionResponse(input: {
            content: {
              scheduleId: "${event.id}",
              status: CONFIRMED,
              created: "${now}",
              note: "Confirmado por terapeuta"
            }
          }) {
            document { id }
          }
        }
      `;
      
      const res: any = await executeQuery(mutation);
      if (res?.errors) throw new Error(res.errors[0].message);

      onUpdated?.('Confirmed');
      showToast('Consulta confirmada', 'success');
    } catch {
      showToast('Error al confirmar la consulta.', 'error');
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
      
      try { await authenticateForWrite(); } catch {
        showToast('Se requiere autenticación para finalizar.', 'error');
        setBusy('none');
        return;
      }

      const nowIso = now.toISOString();
      const mutation = `
        mutation {
          createSessionResponse(input: {
            content: {
              scheduleId: "${event.id}",
              status: COMPLETED,
              created: "${nowIso}",
              note: "Sesión finalizada"
            }
          }) {
            document { id }
          }
        }
      `;

      const res: any = await executeQuery(mutation);
      if (res?.errors) throw new Error(res.errors[0].message);

      onUpdated?.('Finished');
      showToast('Consulta finalizada', 'success');
    } catch {
      showToast('Error al finalizar la consulta.', 'error');
    } finally {
      setBusy('none');
    }
  };

  const cancelSession = async () => {
    try {
      setBusy('confirm'); 
      try { await authenticateForWrite(); } catch {
        showToast('Se requiere autenticación para cancelar.', 'error');
        setBusy('none');
        return;
      }

      const now = new Date().toISOString();
      const mutation = `
        mutation {
          createSessionResponse(input: {
            content: {
              scheduleId: "${event.id}",
              status: CANCELLED,
              created: "${now}",
              note: "Sesión cancelada"
            }
          }) {
            document { id }
          }
        }
      `;

      const res: any = await executeQuery(mutation);
      if (res?.errors) throw new Error(res.errors[0].message);
      
      onUpdated?.('Cancelled');
      showToast('Consulta cancelada', 'success');
    } catch {
      showToast('Error al cancelar la consulta.', 'error');
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
        </div>
        <div className="p-4 flex justify-end gap-3">
          {event.state === 'Pending' && (
            <button
              disabled={busy!=='none'}
              onClick={cancelSession}
              className="px-4 py-2 rounded text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              {busy==='confirm' ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
          {event.state === 'Pending' && (
            <button
              disabled={busy!=='none'}
              onClick={confirmSession}
              className="px-4 py-2 rounded text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              {busy==='confirm' ? 'Confirmando...' : 'Confirmar'}
            </button>
          )}
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
          {/* renderizado condicional del boton de abrir sala para estados Confirmed y active*/}
          { (event.state === 'Confirmed' || event.state === 'Active') && (
          <button 
          disabled={busy!=='none'} 
          onClick={openRoom} 
          className="px-4 py-2 rounded text-white disabled:opacity-50" 
          style={{ background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 100%)', border: '1px solid rgba(255,255,255,0.25)' }}>
            {busy==='open'?'Abriendo...':'Abrir Sala'}
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsModal;
