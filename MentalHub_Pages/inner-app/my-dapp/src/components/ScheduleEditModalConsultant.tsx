"use client"
import React, { useEffect, useMemo, useState } from "react";
import { openMeet } from "@/lib/meet";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCeramic } from "@/context/CeramicContext";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { myChain } from "@/lib/chain";
import { abi, NFT_CONTRACT_ADDRESS } from "@/constants/MembersAirdrop";

interface ScheduleItem {
  id: string;
  start: Date;
  end: Date;
  huddId: string;
  roomId: string;
  roomName: string;
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
}

const ScheduleEditModalConsultant: React.FC<Props> = ({ isOpen, onClose, schedule, onSaved }) => {
  const { profile, account, executeQuery, authenticateForWrite } = useCeramic();
  const [busy, setBusy] = useState<"none" | "open">("none");
  const [toast, setToast] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);

  // Editable fields
  const [start, setStart] = useState<Date>(schedule.start);
  const [end, setEnd] = useState<Date>(schedule.end);
  const [tokenId, setTokenId] = useState<string>(schedule.tokenId != null ? String(schedule.tokenId) : "");
  const [isSaving, setIsSaving] = useState(false);
  const [rooms, setRooms] = useState<Array<{ id: string; name: string; roomId: string }>>([]);
  const [room, setRoom] = useState<string>(schedule.huddId);
  const [status, setStatus] = useState<string>('Pending');
  const isEditable = status === 'Pending';

  // NFTs del usuario y sesiones disponibles
  const contract = useMemo(() => getContract({ client: client!, chain: myChain, address: NFT_CONTRACT_ADDRESS, abi: abi as [] }), []);
  const [userNFTs, setUserNFTs] = useState<Array<{ tokenId: number; availableSessions: number }>>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  useEffect(() => {
    const run = async () => {
      setIsLoadingNFTs(true);
      try {
        const addr = account?.address;
        if (!addr) { setUserNFTs([]); return; }
        const tokenIds = await readContract({
          contract,
          method: "function walletOfOwner(address _owner) view returns (uint256[])",
          params: [addr],
        });
        const list: Array<{ tokenId: number; availableSessions: number }> = [];
        if (Array.isArray(tokenIds)) {
          for (const t of tokenIds) {
            const idNum = Number(t);
            try {
              const avail = await readContract({ contract, method: "function getAvailableSessions(uint256 _tokenId) public view returns (uint256)", params: [BigInt(idNum)] });
              list.push({ tokenId: idNum, availableSessions: Number(avail as any) });
            } catch {}
          }
        }
        setUserNFTs(list);
      } catch {
        setUserNFTs([]);
      } finally {
        setIsLoadingNFTs(false);
      }
    };
    run();
  }, [account?.address, contract]);

  // Leer estado on-chain de la consulta para controlar editabilidad y mostrar estado
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (schedule?.tokenId == null) return;
        const stateNum = await readContract({ contract, method: "function getSessionState(uint256 tokenId, string scheduleId) view returns (uint8)", params: [BigInt(schedule.tokenId), schedule.id] });
        const n = Number(stateNum as any);
        const map = (x: number) => x === 0 ? 'Pending' : x === 1 ? 'Active' : x === 2 ? 'Active' : x === 3 ? 'Finished' : 'Pending';
        if (!cancelled) setStatus(map(n));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [schedule?.id, schedule?.tokenId, contract]);

  // Cargar salas del terapeuta (si therapistId disponible)
  useEffect(() => {
    const loadRooms = async () => {
      if (!schedule?.therapistId) return;
      const q = `
        query {
          node(id: "${schedule.therapistId}") {
            ... on InnerverProfile {
              hudds(last: 100, filters: { where: { state: { in: Active } } }) {
                edges { node { id name roomId } }
              }
            }
          }
        }
      `;
      try {
        const res: any = await executeQuery(q);
        const edges = res?.data?.node?.hudds?.edges || [];
        const mapped = edges.map((e: any) => ({ id: e.node.id, name: e.node.name, roomId: e.node.roomId }));
        setRooms(mapped);
      } catch {}
    };
    loadRooms();
  }, [schedule?.therapistId, executeQuery]);

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
      // Validar que la sala seleccionada pertenezca al mismo terapeuta
      if (room && !rooms.find(r => r.id === room)) {
        showToast('La sala seleccionada no pertenece al terapeuta de esta consulta.', 'error');
        setIsSaving(false);
        return;
      }
      try { await authenticateForWrite(); } catch (e) {
        showToast('Se requiere autenticación para guardar cambios.', 'error');
        setIsSaving(false);
        return;
      }

      const now = new Date();
      const mutation = `
        mutation {
          updateSchedule(
            input: { id: "${schedule.id}", content: { date_init: "${start.toISOString()}", date_finish: "${end.toISOString()}", edited: "${now.toISOString()}", huddId: "${room}", NFTContract: "${NFT_CONTRACT_ADDRESS}", TokenID: ${tokenId || 0} } }
          ) {
            document { id }
          }
        }
      `;
      const res: any = await executeQuery(mutation);
      if (!res?.errors) {
        showToast('Cambios guardados', 'success');
        try { onSaved && onSaved(); } catch {}
        onClose();
      } else {
        showToast('No se pudo guardar la consulta', 'error');
      }
    } catch (e) {
      showToast('Error al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openRoom = async () => {
    if (!schedule) return;
    const now = new Date();
    if (!(now >= start && now <= end)) {
      showToast("La sala solo está disponible en la franja horaria programada.", "error");
      return;
    }
    if ((tokenId == null || tokenId === "")) {
      showToast("No se encontró una Inner Key asociada a esta consulta.", "error");
      return;
    }

    try {
      setBusy("open");
      try {
        await fetch('/api/callsetsession', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId: String(tokenId), scheduleId: schedule.id, state: 2 })
        });
      } catch (apiError) {
        showToast('Error al activar la sesión en el contrato.', 'error');
        setBusy('none');
        return;
      }
      // Validar sala y abrir con la sala seleccionada si corresponde
      let roomIdToOpen = schedule.roomId;
      if (room) {
        const selected = rooms.find(r => r.id === room);
        if (!selected) {
          showToast('La sala seleccionada no pertenece al terapeuta de esta consulta.', 'error');
          setBusy('none');
          return;
        }
        roomIdToOpen = selected.roomId;
      }
      openMeet(roomIdToOpen);
    } catch (e) {
      showToast('Error al abrir la sala', 'error');
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
              <p className="text-white/80 text-sm">Sala</p>
              <select value={room} onChange={(e) => setRoom(e.target.value)} disabled={!isEditable} className="w-full px-3 py-2 rounded border bg-white text-black disabled:opacity-60">
                <option value="">Selecciona sala</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <p className="text-white/70 text-xs mt-1">Sala actual: <span className="font-semibold text-white">{schedule.roomName || '—'}</span></p>
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
            <div>
              <p className="text-white/80 text-sm">Inner Key</p>
              {isLoadingNFTs ? (
                <div className="flex items-center gap-3 p-2 rounded bg-white/10 border border-white/20">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-white/80 text-sm">Cargando Inner Key…</span>
                </div>
              ) : (
                <select value={tokenId} onChange={(e) => setTokenId(e.target.value)} disabled={!isEditable} className="w-full px-3 py-2 rounded border bg-white text-black disabled:opacity-60">
                  <option value="">Selecciona Inner Key</option>
                  {userNFTs.map((n) => (
                    <option key={n.tokenId} value={n.tokenId}>
                      Id: {n.tokenId} - # sesiones: {n.availableSessions}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleSave} disabled={isSaving || !isEditable} className="px-4 py-2 rounded border text-white border-white/40 hover:bg-white/10 disabled:opacity-60">{isSaving ? 'Guardando…' : 'Guardar'}</button>
            <button onClick={openRoom} disabled={busy !== 'none'} className="px-4 py-2 rounded text-white shadow-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 100%)', border: '1px solid rgba(255,255,255,0.25)' }}>
              {busy === 'open' ? 'Abriendo…' : 'Abrir Sala'}
            </button>
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


