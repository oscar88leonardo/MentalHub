"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useCeramic } from "@/context/CeramicContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { openRoomFlowNoCheck } from "@/lib/openRoom";
import { openMeet } from "@/lib/meet";

type NextSched = {
  id: string;
  start: Date;
  end: Date;
  roomId: string;
  tokenId?: number;
  counterpartName?: string; // terapeuta (para consultante) o consultante (para terapeuta)
};

const NextAppointment: React.FC = () => {
  const { executeQuery, profile } = useCeramic();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextSched, setNextSched] = useState<NextSched | null>(null);

  const isTherapist = profile?.rol === "Terapeuta";

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        let edges: any[] = [];

        if (isTherapist && profile?.id) {
          // Terapeuta: ver próxima consulta como host -> therapist_sched
          const q = `
            query {
              node(id: "${profile.id}") {
                ... on InnerverProfile {
                  therapist_sched(last: 200) {
                    edges {
                      node {
                        id
                        date_init
                        date_finish
                        roomId
                        profile { displayName name }  # consultante
                        NFTContract
                        TokenID
                      }
                    }
                  }
                }
              }
            }
          `;
          const res: any = await executeQuery(q);
          edges = res?.data?.node?.therapist_sched?.edges || [];
          const mapped: NextSched[] = edges.map((e: any) => ({
            id: e.node.id,
            start: new Date(e.node.date_init),
            end: new Date(e.node.date_finish),
            roomId: e.node.roomId,
            tokenId: typeof e.node.TokenID === "number" ? e.node.TokenID : (e.node.TokenID ? Number(e.node.TokenID) : undefined),
            counterpartName: e.node.profile?.displayName || e.node.profile?.name || undefined, // consultante
          }));

          const now = Date.now();
          const upcoming = mapped
            .filter((s) => s.end.getTime() > now)
            .sort((a, b) => a.start.getTime() - b.start.getTime())[0] || null;
          setNextSched(upcoming);
        } else {
          // Consultante: ver próxima consulta como cliente -> schedules
          const q = `
            query {
              viewer { innerverProfile {
                schedules(last: 200) {
                  edges {
                    node {
                      id
                      date_init
                      date_finish
                      roomId
                      therapist { id name displayName }
                      NFTContract
                      TokenID
                    }
                  }
                }
              } }
            }
          `;
          const res: any = await executeQuery(q);
          edges = res?.data?.viewer?.innerverProfile?.schedules?.edges || [];
          const mapped: NextSched[] = edges.map((e: any) => ({
            id: e.node.id,
            start: new Date(e.node.date_init),
            end: new Date(e.node.date_finish),
            roomId: e.node.roomId,
            tokenId: typeof e.node.TokenID === "number" ? e.node.TokenID : (e.node.TokenID ? Number(e.node.TokenID) : undefined),
            counterpartName: e.node.therapist?.displayName || e.node.therapist?.name || undefined, // terapeuta
          }));

          const now = Date.now();
          const upcoming = mapped
            .filter((s) => s.end.getTime() > now)
            .sort((a, b) => a.start.getTime() - b.start.getTime())[0] || null;
          setNextSched(upcoming);
        }
      } catch (e: any) {
        setError("No se pudo cargar tu próxima consulta.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [executeQuery, isTherapist, profile?.id]);

  const withinWindow = useMemo(() => {
    if (!nextSched) return false;
    const now = Date.now();
    return now >= nextSched.start.getTime() && now <= nextSched.end.getTime();
  }, [nextSched]);

  const onOpen = async () => {
    if (!nextSched) return;
    try {
      await openRoomFlowNoCheck({
        tokenId: nextSched.tokenId,
        scheduleId: nextSched.id,
        start: nextSched.start,
        end: nextSched.end,
        defaultRoomId: nextSched.roomId,
        openMeet,
        optimistic: true,
      });
    } catch (e: any) {
      alert("No se pudo abrir la sala. Verifica el horario y tu Inner Key.");
    }
  };

  const label = isTherapist ? "Consultante" : "Terapeuta";

  return (
    <div className="rounded-2xl p-6 text-white mb-8"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
      }}
    >
      <h3 className="text-xl font-semibold mb-3" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        Tu próxima consulta
      </h3>

      {loading && <p className="text-white/80">Cargando…</p>}
      {!loading && error && <p className="text-red-200">{error}</p>}

      {!loading && !error && !nextSched && (
        <p className="text-white/80">Aún no tienes una próxima consulta.</p>
      )}

      {!loading && !error && nextSched && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <p className="text-white/90 font-medium truncate">
              {label}: {nextSched.counterpartName || "—"}
            </p>
            <p className="text-white/70 text-sm">
              {format(nextSched.start, "EEEE d 'de' MMM, HH:mm", { locale: es })} — {format(nextSched.end, "HH:mm", { locale: es })}
            </p>
          </div>
          <button
            onClick={onOpen}
            disabled={!withinWindow || !nextSched.tokenId}
            className="px-4 py-2 rounded-xl text-white font-medium shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            title={!withinWindow ? "La sala se habilita dentro del horario de la consulta" : undefined}
          >
            Abrir sala
          </button>
        </div>
      )}
    </div>
  );
};

export default NextAppointment;