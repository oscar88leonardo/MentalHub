"use client"
import React, { useEffect, useMemo, useState } from "react";
import { useCeramic } from "@/context/CeramicContext";
import { contracts } from "@/config/contracts";
import { delegateScheduleToTherapist } from "@/lib/capabilities";
import { didPkhFromAddress } from "@/lib/did";
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
  const { profile, executeQuery, refreshProfile, authenticateForWrite, createSchedule, adminAccount } = useCeramic() as any;
  const [isSaving, setIsSaving] = useState(false);
  const [start, setStart] = useState<Date>(dateInit);
  const [end, setEnd] = useState<Date>(dateFinish);

  // Sincronizar fechas si vienen nuevas del slot seleccionado
  useEffect(() => {
    setStart(dateInit);
    setEnd(dateFinish);
  }, [dateInit, dateFinish]);

  const canSave = useMemo(() => !!roomIdString && !isSaving && end > start, [roomIdString, isSaving, start, end]);

  const handleSave = async () => {
    if (!profile?.id) return;
    if (!therapistId || !roomIdString) return;
    setIsSaving(true);
    try {
      // helper: esperar a que el índice vea el grant
      const waitForGrantIndexed = async (sid: string, aud: string, retries = 5, waitMs = 800) => {
        const run = async () => {
          const q = `
            query($sid: StreamID!) {
              scheduleGrantIndex(
                filters: { where: { scheduleId: { equalTo: $sid } } },
                last: 20
              ) { edges { node { id scheduleId audDid created expires } } }
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
          const { nodes, selected } = await run();
          console.log("[CACAO][Warmup][GrantIndex]", { sid, aud, attempt: i + 1, total: nodes.length, selected: !!selected });
          if (selected) return true;
          await new Promise((r) => setTimeout(r, Math.round(waitMs * Math.pow(1.5, i))));
        }
        // Fallback: por audDid
        try {
          const q2 = `
            query($aud: String!) {
              scheduleGrantIndex(
                filters: { where: { audDid: { equalTo: $aud } } },
                last: 20
              ) { edges { node { id scheduleId audDid created expires } } }
            }
          `;
          const r2: any = await executeQuery(q2, { aud });
          const nodes2 = (r2?.data?.scheduleGrantIndex?.edges || []).map((e: any) => e.node);
          nodes2.sort((a: any, b: any) => new Date(b?.created || 0).getTime() - new Date(a?.created || 0).getTime());
          const now2 = Date.now();
          const picked = nodes2.find((n: any) => n?.scheduleId === sid && n?.audDid === aud && new Date(n?.expires || 0).getTime() > now2) || null;
          console.log("[CACAO][Warmup][FallbackByAud]", { sid, aud, total: nodes2.length, picked: !!picked });
          return !!picked;
        } catch (e) {
          console.warn("[CACAO][Warmup][FallbackByAud] failed:", e);
          return false;
        }
      };

      // Asegurar autenticación de escritura en Ceramic
      try {
        await authenticateForWrite();
      } catch (e) {
        console.error('Auth error:', e);
        alert('Se requiere autenticación para escribir en Ceramic. Por favor, firma con tu wallet.');
        setIsSaving(false);
        return;
      }

      // Crear Schedule 100% en Ceramic con estado Pending (sin NFT)
      const newId = await (createSchedule as Function)({
        profileId: profile.id,
        therapistId,
        roomId: roomIdString,
        date_init: start.toISOString(),
        date_finish: end.toISOString(),
        NFTContract: "",
        TokenID: 0,
      });
      console.log("[CREATE][ScheduleID]", newId);

      // Delegar capability al terapeuta si existe adminAddress
      try {
        const q = `
          query {
            node(id: "${therapistId}") {
              ... on InnerverProfile {
                therapist(first:1) { edges { node { adminAddress } } }
              }
            }
          }
        `;
        const r: any = await executeQuery(q);
        const therapistEOA = (r?.data?.node?.therapist?.edges?.[0]?.node?.adminAddress || "").toLowerCase();
        const delegatorEOA = (adminAccount?.address || "").toLowerCase();
        const therapistAudDid = therapistEOA ? didPkhFromAddress(therapistEOA) : null;
        const delegatorDid = adminAccount?.address ? didPkhFromAddress(adminAccount.address) : null;
        console.log("[CACAO][Delegate] scheduleId:", newId, {
          therapistEOA,
          therapistAudDid,
          delegatorEOA,
          delegatorDid,
        });
        if (!therapistEOA) {
          alert("El terapeuta no tiene adminAddress configurado. No se puede delegar permiso.");
          return;
        }
        if (!adminAccount?.address) {
          alert("No hay AdminAccount disponible para delegar permisos.");
          return;
        }
        const { docId } = await delegateScheduleToTherapist({
          scheduleId: newId,
          therapistEOA,
          adminAccount,
          executeQuery,
        });
        console.log("[CACAO][CreateGrant] success", { docId, scheduleId: newId });
        // Warm-up: esperar a que el índice refleje el grant (mejora UX para confirmar enseguida)
        if (therapistAudDid) {
          const ok = await waitForGrantIndexed(newId, therapistAudDid);
          if (!ok) {
            console.warn("Grant aún no indexado; es normal por latencia. Podrá estar disponible en segundos.");
          }
        }
      } catch (e) {
        console.error("Delegación CACAO fallida:", e);
        alert("La delegación de permisos al terapeuta falló. Intenta nuevamente.");
        return;
      }

        await refreshProfile();
        try { await onSaved?.(); } catch {}
        onClose();
      
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


