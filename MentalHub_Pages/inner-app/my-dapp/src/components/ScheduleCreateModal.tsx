"use client"
import React, { useEffect, useMemo, useState } from "react";
import { useCeramic } from "@/context/CeramicContext";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";
import { abi } from "@/abicontracts/MembersAirdrop";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void | Promise<void>;
  therapistName?: string;
  therapistId?: string;
  roomIdString?: string;
  dateInit: Date;
  dateFinish: Date;
}

const ScheduleCreateModal: React.FC<Props> = ({ isOpen, onClose, onSaved, therapistName, therapistId, roomIdString, dateInit, dateFinish }) => {
  const { profile, account, executeQuery, refreshProfile, authenticateForWrite } = useCeramic();
  const [tokenId, setTokenId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [userNFTs, setUserNFTs] = useState<Array<{ tokenId: number; availableSessions: number }>>([]);
  const [start, setStart] = useState<Date>(dateInit);
  const [end, setEnd] = useState<Date>(dateFinish);

  const contract = useMemo(() => getContract({ client: client!, chain: myChain, address: contracts.membersAirdrop, abi: abi as [] }), []);

  useEffect(() => {
    // Cargar NFTs y sus sesiones disponibles (on-chain)
    const run = async () => {
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
      } catch {}
    };
    run();
  }, [account?.address, contract]);

  // Sincronizar fechas si vienen nuevas del slot seleccionado
  useEffect(() => {
    setStart(dateInit);
    setEnd(dateFinish);
  }, [dateInit, dateFinish]);

  const canSave = useMemo(() => !!roomIdString && !!tokenId && !isSaving && end > start, [roomIdString, tokenId, isSaving, start, end]);

  const handleSave = async () => {
    if (!profile?.id) return;
    if (!therapistId || !roomIdString || !tokenId) return;
    setIsSaving(true);
    try {
      // Asegurar autenticación de escritura en Ceramic
      try {
        await authenticateForWrite();
      } catch (e) {
        console.error('Auth error:', e);
        alert('Se requiere autenticación para escribir en Ceramic. Por favor, firma con tu wallet.');
        setIsSaving(false);
        return;
      }

      const now = new Date();
      const mutation = `
        mutation {
          createSchedule(
            input: {content: {date_init: "${start.toISOString()}", date_finish: "${end.toISOString()}", profileId: "${profile.id}", therapistId: "${therapistId}", roomId: "${roomIdString}", created: "${now.toISOString()}", state: Pending, NFTContract: "${contracts.membersAirdrop}", TokenID: ${tokenId}}}
          ) {
            document { id }
          }
        }
      `;
      const res: any = await executeQuery(mutation);
      if (!res?.errors) {
        // Vincular on-chain en Pending (igual a my-app): consume slot inmediatamente
        try {
          const schedId = res?.data?.createSchedule?.document?.id;
          if (schedId && tokenId) {
            await fetch('/api/callsetsession', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tokenId: String(tokenId), scheduleId: String(schedId), state: 0 })
            });
          }
        } catch (e) {
          // No bloquear el flujo si falla la llamada; se reflejará en reintentos manuales
          console.error('callsetsession Pending error:', e);
        }
        await refreshProfile();
        try { await onSaved?.(); } catch {}
        onClose();
      } else {
        console.error(res.errors);
        alert("No se pudo crear la sesión");
      }
    } catch (e) {
      console.error(e);
      alert("Error al crear la sesión");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}>
      <div className="w-full max-w-xl rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #6666ff 0%, #7a7aff 50%, #339999 100%)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
          <h4 className="text-lg font-semibold text-white">Agendar Sesión</h4>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {therapistName && (
            <p className="text-white/90 text-sm">Terapeuta: <span className="font-semibold">{therapistName}</span></p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Inicio</p>
              <DatePicker
                selected={start}
                onChange={(d) => d && setStart(d)}
                showTimeInput
                dateFormat="MM/dd/yyyy h:mm aa"
                className="w-full px-3 py-2 rounded border bg-white text-black"
              />
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Fin</p>
              <DatePicker
                selected={end}
                onChange={(d) => d && setEnd(d)}
                showTimeInput
                dateFormat="MM/dd/yyyy h:mm aa"
                className="w-full px-3 py-2 rounded border bg-white text-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Sala del terapeuta</label>
            <div className="w-full px-3 py-2 rounded border bg-white text-black">
              {roomIdString || '—'}
            </div>
            {!roomIdString && (
              <p className="text-red-200 text-xs mt-1">
                No se encontró la sala del terapeuta. Pídele que configure su sala en su perfil.
              </p>
            )}
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Inner Key</label>
            <select value={tokenId} onChange={(e) => setTokenId(e.target.value)} className="w-full px-3 py-2 rounded border bg-white text-black">
              <option value="">Selecciona Inner Key</option>
              {userNFTs.map((n) => (
                <option key={n.tokenId} value={n.tokenId} disabled={n.availableSessions === 0}>
                  Id: {n.tokenId} - # sesiones: {n.availableSessions}{n.availableSessions === 0 ? " (No disponible)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded border text-white border-white/40 hover:bg-white/10">Cancelar</button>
            <button onClick={handleSave} disabled={!canSave} className="px-4 py-2 rounded text-white shadow-lg disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #6666ff 0%, #4d4dcc 100%)', border: '1px solid rgba(255,255,255,0.25)' }}>
              {isSaving ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCreateModal;


