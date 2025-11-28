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
  
  // Estado simplificado: ya no gestionamos lista de NFTs, solo saldo global
  const [availableSessions, setAvailableSessions] = useState<number | null>(null);
  const [hasNft, setHasNft] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [start, setStart] = useState<Date>(dateInit);
  const [end, setEnd] = useState<Date>(dateFinish);

  const contract = useMemo(() => getContract({ client: client!, chain: myChain, address: contracts.membersAirdrop, abi: abi as [] }), []);

  // Lógica principal de cálculo de saldo
  useEffect(() => {
    const loadBalance = async () => {
      if (!account?.address || !profile?.id) return;
      
      try {
        // 1. Verificar NFT (Solo lectura On-Chain)
        const tokenIds = await readContract({
          contract,
          method: "function walletOfOwner(address _owner) view returns (uint256[])",
          params: [account.address],
        });
        const userHasNft = Array.isArray(tokenIds) && tokenIds.length > 0;
        setHasNft(userHasNft);

        // 2. Consultar Último Snapshot de Crédito en Ceramic
        const creditQuery = `
          query {
            node(id: "${profile.id}") {
              ... on InnerverProfile {
                credits(last: 1) {
                  edges { node { balanceSnapshot created } }
                }
              }
            }
          }
        `;
        const creditRes: any = await executeQuery(creditQuery);
        const lastCredit = creditRes?.data?.node?.credits?.edges?.[0]?.node;

        // 3. Lógica de Bono de Bienvenida (Auto-Minteo)
        if (userHasNft && !lastCredit && !isInitializing) {
           setIsInitializing(true);
           // No hay historial pero tiene NFT -> Crear primer crédito
           try {
             // Intentamos autenticar. Si falla, el usuario verá saldo 0.
             await authenticateForWrite();
             const now = new Date().toISOString();
             const mutation = `
               mutation {
                 createSessionCredit(input: {
                   content: {
                     amount: 5,
                     reason: "NFT Welcome Bonus",
                     balanceSnapshot: 5, 
                     created: "${now}",
                     profileId: "${profile.id}"
                   }
                 }) { document { id } }
               }
             `;
             await executeQuery(mutation);
             // Recargar tras crear
             setIsInitializing(false);
             return loadBalance();
           } catch (e) {
             console.warn("Auth necesaria para activar bono NFT", e);
             setIsInitializing(false);
           }
        }

        let baseBalance = 0;
        let snapshotDate = new Date(0).toISOString(); // Inicio de los tiempos

        if (lastCredit) {
            baseBalance = lastCredit.balanceSnapshot;
            snapshotDate = lastCredit.created;
        }

        // 4. Consultar consumo POSTERIOR al snapshot
        // Usamos node(id) para mayor robustez al filtrar por ID específico
        const consumptionQuery = `
          query {
            node(id: "${profile.id}") {
              ... on InnerverProfile {
                schedules(last: 1000) { 
                  edges { 
                    node { 
                      created
                      therapistResponse(first: 1) { edges { node { status } } }
                    } 
                  } 
                }
              }
            }
          }
        `;
        const consRes: any = await executeQuery(consumptionQuery);
        const allSchedules = consRes?.data?.node?.schedules?.edges || [];

        const usedCount = allSchedules.filter((edge: any) => {
            const s = edge.node;
            // Filtrar por fecha: Solo contar las creadas DESPUÉS del snapshot
            if (new Date(s.created) <= new Date(snapshotDate)) return false;

            // Filtrar por estado: Canceladas/Rechazadas no cuentan.
            // PENDING, CONFIRMED, ACTIVE, COMPLETED, FINISHED SÍ cuentan.
            // Si status es undefined/null (no hay respuesta aún), es PENDING implícito, por tanto cuenta.
            const status = s.therapistResponse?.edges?.[0]?.node?.status || 'PENDING';
            return status !== 'CANCELLED' && status !== 'REJECTED';
        }).length;

        setAvailableSessions(Math.max(0, baseBalance - usedCount));

      } catch (e) {
        console.error("Error calculando saldo:", e);
      }
    };

    if (isOpen) {
      loadBalance();
    }
  }, [account?.address, contract, profile?.id, isOpen]); // Se agrega isOpen para recargar al abrir

  // Sincronizar fechas si vienen nuevas del slot seleccionado
  useEffect(() => {
    setStart(dateInit);
    setEnd(dateFinish);
  }, [dateInit, dateFinish]);

  const canSave = useMemo(() => 
    !!roomIdString && !isSaving && end > start && (availableSessions || 0) > 0, 
  [roomIdString, isSaving, start, end, availableSessions]);

  const handleSave = async () => {
    if (!profile?.id) return;
    if (!therapistId || !roomIdString) return;
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
            input: {content: {date_init: "${start.toISOString()}", date_finish: "${end.toISOString()}", profileId: "${profile.id}", therapistId: "${therapistId}", roomId: "${roomIdString}", created: "${now.toISOString()}"}}
          ) {
            document { id }
          }
        }
      `;
      const res: any = await executeQuery(mutation);
      if (!res?.errors) {
        const newId = res?.data?.createSchedule?.document?.id as string;
        console.log("Cita creada en Ceramic (Pending):", newId);

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
            <label className="block text-white font-medium mb-2">Disponibilidad</label>
            <div className="w-full px-3 py-2 rounded border bg-white text-black flex justify-between items-center">
                <span>
                    {hasNft 
                        ? `Sesiones Disponibles: ${availableSessions !== null ? availableSessions : 'Calculando...'}` 
                        : "No se detectó un Inner Key (NFT)"}
                </span>
                {hasNft && availableSessions !== null && availableSessions > 0 && (
                    <span className="text-green-600 font-bold text-lg">✓</span>
                )}
            </div>
            {!hasNft && (
                <p className="text-red-200 text-xs mt-1">Necesitas un NFT para agendar.</p>
            )}
             {hasNft && availableSessions === 0 && (
                <p className="text-orange-600 text-xs mt-1 bg-white/80 p-1 rounded">
                   Has usado todas tus sesiones. Adquiere más créditos (Próximamente).
                </p>
            )}
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
