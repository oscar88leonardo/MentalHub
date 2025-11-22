"use client"
import React, { useState } from "react";
import { openMeet } from "@/lib/meet";
import { useCeramic } from "@/context/CeramicContext";
import { didPkhFromAddress } from "@/lib/did";
import { updateScheduleStateWithSession } from "@/lib/therapistSession";
import { Cacao } from "@didtools/cacao";

interface EventItem {
  id: string;
  start: Date;
  end: Date;
  state: string;
  roomId: string;
  displayName: string;
  tokenId?: number;
  nftContract?: string;
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
  const { executeQuery, composeClient, adminWallet, adminAccount, providerThirdweb } = useCeramic() as any;
  // Sin gestión de múltiples salas
  // (sin edición): no se carga disponibilidad on-chain

  // Se elimina la carga de salas

  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resolveAdminAddress = () => (adminAccount?.address || adminWallet?.getAccount?.()?.address || "").toLowerCase();

  // Helper: obtener el grant por scheduleId y validar en cliente audDid y expiración (con reintentos y fallback por audDid)
  async function fetchGrantForSchedule(sid: string, aud: string, retries = 5, waitMs = 800) {
    const runOnce = async () => {
      const q = `
        query($sid: StreamID!) {
          scheduleGrantIndex(
            filters: { where: { scheduleId: { equalTo: $sid } } },
            last: 20
          ) { edges { node { id scheduleId audDid cacao created expires } } }
        }
      `;
      const r: any = await executeQuery(q, { sid });
      const nodes = (r?.data?.scheduleGrantIndex?.edges || []).map((e: any) => e.node);
      nodes.sort((a: any, b: any) => new Date(b?.created || 0).getTime() - new Date(a?.created || 0).getTime());
      const now = Date.now();
      const selected = nodes.find((n: any) => n?.audDid === aud && new Date(n?.expires || 0).getTime() > now) || null;
      return { nodes, selected };
    };
    for (let i = 0; i < retries; i++) {
      const { nodes, selected } = await runOnce();
      console.log("[CACAO][FetchGrant][ByScheduleOnly]", { sid, aud, attempt: i + 1, total: nodes.length, selected });
      if (selected) return selected;
      await new Promise((r) => setTimeout(r, Math.round(waitMs * Math.pow(1.5, i))));
    }
    // Fallback: buscar por audDid y filtrar por scheduleId en cliente
    try {
      const q2 = `
        query($aud: String!) {
          scheduleGrantIndex(
            filters: { where: { audDid: { equalTo: $aud } } },
            last: 20
          ) { edges { node { id scheduleId audDid cacao created expires } } }
        }
      `;
      const r2: any = await executeQuery(q2, { aud });
      const nodes2 = (r2?.data?.scheduleGrantIndex?.edges || []).map((e: any) => e.node);
      nodes2.sort((a: any, b: any) => new Date(b?.created || 0).getTime() - new Date(a?.created || 0).getTime());
      const now2 = Date.now();
      const picked = nodes2.find((n: any) => n?.scheduleId === sid && n?.audDid === aud && new Date(n?.expires || 0).getTime() > now2) || null;
      console.log("[CACAO][FetchGrant][FallbackByAud]", { sid, aud, total: nodes2.length, picked });
      return picked;
    } catch (e) {
      console.warn("[CACAO][FetchGrant][FallbackByAud] failed:", e);
      return null;
    }
  }

  const openRoom = async () => {
    try {
      setBusy('open');
      // Validar ventana de tiempo
      const now = new Date();
      if (!(now >= event.start && now <= event.end)) {
        showToast('La sala solo está disponible en la franja horaria programada.', 'error');
        setBusy('none');
        return;
      }
      // Lectura previa: si ya está Active, solo abrir sala
      try {
        const rState: any = await executeQuery(`query($id: ID!){ node(id:$id){ ... on Schedule { state } } }`, { id: event.id });
        const curState = rState?.data?.node?.state as string | undefined;
        if (curState === 'Active') {
          openMeet(event.roomId);
          setBusy('none');
          return;
        }
      } catch {}
      // Buscar CACAO de delegación para este terapeuta (aud = did:pkh de su AdminAccount)
      const adminAddr = resolveAdminAddress();
      const aud = adminAddr ? didPkhFromAddress(adminAddr) : "";
      if (!aud || !providerThirdweb) {
        showToast('No hay AdminAccount o provider disponible para firmar.', 'error');
        setBusy('none');
        return;
      }
      const node = await fetchGrantForSchedule(event.id, aud);
      console.log("[CACAO][GrantNode][OpenRoom]", { sid: event.id, adminAddr, aud, node });
      const cacaoStr = node?.cacao;
      const audDidGrant = node?.audDid;
      if (!cacaoStr) {
        showToast('No tienes delegación vigente para activar esta sesión.', 'error');
        setBusy('none');
        return;
      }
      if (audDidGrant && audDidGrant !== aud) {
        console.warn("[CACAO][Mismatch][OpenRoom] audDid in grant != aud from wallet", { audDidGrant, aud });
      }
      const cacao = JSON.parse(cacaoStr) as unknown as Cacao;
      const newState = await updateScheduleStateWithSession({
        compose: composeClient!,
        cacao,
        scheduleId: event.id,
        newState: 'Active',
        provider: providerThirdweb,
        adminAddress: adminAddr,
      });
      if (newState === 'Active') {
        onUpdated?.('Active');
        openMeet(event.roomId);
      }
    } catch (e: any) {
      showToast(e?.message || 'Error al abrir la sala', 'error');
    } finally {
      setBusy('none');
    }
  };

  const confirmSession = async () => {
    try {
      setBusy('confirm');
      // Buscar CACAO para este terapeuta (AdminAccount)
      const adminAddr = resolveAdminAddress();
      const aud = adminAddr ? didPkhFromAddress(adminAddr) : "";
      if (!aud || !providerThirdweb) throw new Error('No hay AdminAccount o provider disponible para firmar.');
      const node = await fetchGrantForSchedule(event.id, aud);
      console.log("[CACAO][GrantNode][Confirm]", { sid: event.id, adminAddr, aud, node });
      const cacaoStr = node?.cacao;
      const audDidGrant = node?.audDid;
      if (!cacaoStr) throw new Error('No tienes delegación vigente para confirmar esta sesión.');
      if (audDidGrant && audDidGrant !== aud) {
        console.warn("[CACAO][Mismatch][Confirm] audDid in grant != aud from wallet", { audDidGrant, aud });
      }
      const cacao = JSON.parse(cacaoStr) as unknown as Cacao;
      const s = await updateScheduleStateWithSession({
        compose: composeClient!,
        cacao,
        scheduleId: event.id,
        newState: 'Confirmed',
        provider: providerThirdweb,
        adminAddress: adminAddr,
      });
      if (s === 'Confirmed') {
        onUpdated?.('Confirmed');
        showToast('Consulta confirmada', 'success');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error al confirmar la consulta.', 'error');
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
      // CACAO para finalizar (terapeuta)
      const adminAddr = resolveAdminAddress();
      const aud = adminAddr ? didPkhFromAddress(adminAddr) : "";
      if (!aud || !providerThirdweb) throw new Error('No hay AdminAccount o provider disponible para firmar.');
      const node = await fetchGrantForSchedule(event.id, aud);
      console.log("[CACAO][GrantNode][Finish]", { sid: event.id, adminAddr, aud, node });
      const cacaoStr = node?.cacao;
      const audDidGrant = node?.audDid;
      if (!cacaoStr) throw new Error('No tienes delegación vigente para finalizar esta sesión.');
      if (audDidGrant && audDidGrant !== aud) {
        console.warn("[CACAO][Mismatch][Finish] audDid in grant != aud from wallet", { audDidGrant, aud });
      }
      const cacao = JSON.parse(cacaoStr) as unknown as Cacao;
      const s = await updateScheduleStateWithSession({
        compose: composeClient!,
        cacao,
        scheduleId: event.id,
        newState: 'Finished',
        provider: providerThirdweb,
        adminAddress: adminAddr,
      });
      if (s === 'Finished') {
        onUpdated?.('Finished');
        showToast('Consulta finalizada', 'success');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error al finalizar la consulta.', 'error');
    } finally {
      setBusy('none');
    }
  };

  const cancelSession = async () => {
    try {
      setBusy('confirm');
      // CACAO obligatorio (terapeuta) - sin fallback
      const adminAddr = resolveAdminAddress();
      const aud = adminAddr ? didPkhFromAddress(adminAddr) : "";
      if (!aud || !providerThirdweb) throw new Error('No hay AdminAccount o provider disponible para firmar.');
      const node = await fetchGrantForSchedule(event.id, aud);
      console.log("[CACAO][GrantNode][Cancel]", { sid: event.id, adminAddr, aud, node });
      const cacaoStr = node?.cacao;
      const audDidGrant = node?.audDid;
      if (!cacaoStr) throw new Error('No tienes delegación vigente para cancelar esta sesión.');
      if (audDidGrant && audDidGrant !== aud) {
        console.warn("[CACAO][Mismatch][Cancel] audDid in grant != aud from wallet", { audDidGrant, aud });
      }
      const cacao = JSON.parse(cacaoStr) as unknown as Cacao;
      const s = await updateScheduleStateWithSession({
        compose: composeClient!,
        cacao,
        scheduleId: event.id,
        newState: 'Cancelled',
        provider: providerThirdweb,
        adminAddress: adminAddr,
      });
      if (s === 'Cancelled') {
        onUpdated?.('Cancelled');
        showToast('Consulta cancelada', 'success');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error al cancelar la consulta.', 'error');
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
          {/* Sin selección de sala */}
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
          {event.state === 'Pending' && event.profileId && event.profileRole === 'Consultante' && (
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


