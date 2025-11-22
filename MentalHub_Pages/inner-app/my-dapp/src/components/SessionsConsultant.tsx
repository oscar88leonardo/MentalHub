"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import dynamic from "next/dynamic";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { useCeramic } from "@/context/CeramicContext";
import ScheduleCreateModal from "./ScheduleCreateModal";
import ScheduleEditModalConsultant from "./ScheduleEditModalConsultant";

const locales: Record<string, any> = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface SessionsConsultantProps { onLoadingKeysChange?: (loading: boolean) => void }

const SessionsConsultant: React.FC<SessionsConsultantProps> = ({ onLoadingKeysChange }) => {
  const { profile, executeQuery, refreshProfile } = useCeramic();
  const executeQueryRef = useRef(executeQuery);
  useEffect(() => { executeQueryRef.current = executeQuery; }, [executeQuery]);
  const [therapist, setTherapist] = useState<string>("");
  const [therapistName, setTherapistName] = useState<string>("");
  const [therapistRoomId, setTherapistRoomId] = useState<string>("");
  const [therapists, setTherapists] = useState<Array<{ node: { id: string; name: string } }>>([]);
  const [events, setEvents] = useState<Array<{ id: string; start: Date; end: Date; state: string }>>([]);
  const [busyTherapEvents, setBusyTherapEvents] = useState<Array<{ id: string; start: Date; end: Date }>>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [mySchedOpen, setMySchedOpen] = useState(false);
  const [mySchedDate, setMySchedDate] = useState<Date>(new Date());
  const [mySchedView, setMySchedView] = useState<any>(Views.WEEK);
  const [mySchedLoading, setMySchedLoading] = useState(false);
  const [selStart, setSelStart] = useState(new Date());
  const [selEnd, setSelEnd] = useState(new Date());
  const [isLoadingAvail, setIsLoadingAvail] = useState(false);
  const [mySchedEvents, setMySchedEvents] = useState<Array<{ id: string; start: Date; end: Date; state: string; roomId: string; therapistName?: string; therapistId?: string }>>([]);
  const [selectedSched, setSelectedSched] = useState<{ id: string; start: Date; end: Date; state?: string; roomId: string; therapistName?: string; therapistId?: string } | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const { defaultDate, scrollToTime } = useMemo(() => ({
    defaultDate: new Date(),
    scrollToTime: new Date(1970, 1, 1, 6),
  }), []);

  // (sin validaciones on-chain; todo desde Ceramic)

  // Cargar lista de terapeutas (una vez; evita re-ejecución por cambios de referencia)
  useEffect(() => {
    const run = async () => {
      const q = `
        query {
          innerverProfileIndex(filters: { where: { rol: { in: Terapeuta } } }, last: 100) {
            edges { node { id name } }
          }
        }
      `;
      const res: any = await executeQueryRef.current(q);
      const list = res?.data?.innerverProfileIndex?.edges || [];
      setTherapists(list);
    };
    run();
  }, []);

  // Función reutilizable: cargar disponibilidad y franjas ocupadas del terapeuta
  const loadPlannerData = useCallback(async () => {
    if (!therapist) return;
    setIsLoadingAvail(true);
    let cancelled = false;
    const q = `
      query {
        node(id: "${therapist}") {
          ... on InnerverProfile {
            id
            name
            sched_therap(last: 200) {
              edges { node { id date_init date_finish } }
            }
            therapist(last: 1) { edges { node { roomId } } }
            therapist_sched(last: 200) {
              edges { node { id date_init date_finish roomId state } }
            }
          }
        }
      }
    `;
    try {
      const res: any = await executeQueryRef.current(q);
      if (cancelled) return;
      const node = res?.data?.node;
      setTherapistName(node?.name || "");
      const availEdges = node?.sched_therap?.edges || [];
      const mappedAvail = availEdges.map((e: any) => ({ id: e.node.id, start: new Date(e.node.date_init), end: new Date(e.node.date_finish), state: 'Pending' }));
      setEvents(mappedAvail);
      const roomId = node?.therapist?.edges?.[0]?.node?.roomId || "";
      setTherapistRoomId(roomId);
    const sEdges = node?.therapist_sched?.edges || [];
    const cleaned: Array<{ id: string; start: Date; end: Date }> =
      sEdges
        .map((e: any) => ({ id: e.node.id as string, start: new Date(e.node.date_init), end: new Date(e.node.date_finish), state: e.node.state as string }))
        .filter(b => b.state !== 'Cancelled')
        .map(b => ({ id: b.id, start: b.start, end: b.end }));
      // Deduplicar y filtrar por solapamiento con disponibilidad
        const byKey = new Set<string>();
      const validBusy = cleaned
        .filter((b) => b.start instanceof Date && !isNaN(b.start.getTime()) && b.end instanceof Date && !isNaN(b.end.getTime()))
        .filter((b) => b.end > b.start)
        .filter((b) => mappedAvail.some((av: { start: Date; end: Date }) => b.end > av.start && b.start < av.end))
        .filter((b) => {
            const k = `${b.id}:${b.start.toISOString()}:${b.end.toISOString()}`;
            if (byKey.has(k)) return false;
            byKey.add(k);
            return true;
          });
      setBusyTherapEvents(validBusy);
    } finally {
      if (!cancelled) setIsLoadingAvail(false);
    }
    return () => { cancelled = true; };
  }, [therapist]);

  // Recargar solo franjas ocupadas (sin tocar disponibilidad)
  const loadBusySlots = useCallback(async () => {
    if (!therapist) return;
    const q = `
      query {
        node(id: "${therapist}") {
          ... on InnerverProfile {
            therapist_sched(last: 200) {
                    edges { node { id date_init date_finish state } }
            }
          }
        }
      }
    `;
    const res: any = await executeQueryRef.current(q);
    const sEdges = res?.data?.node?.therapist_sched?.edges || [];
    const cleaned: Array<{ id: string; start: Date; end: Date }> =
      sEdges
        .map((e: any) => ({ id: e.node.id as string, start: new Date(e.node.date_init), end: new Date(e.node.date_finish), state: e.node.state as string }))
        .filter(b => b.state !== 'Cancelled')
        .map(b => ({ id: b.id, start: b.start, end: b.end }));
      const byKey = new Set<string>();
    const validBusy = cleaned
      .filter((b) => b.start instanceof Date && !isNaN(b.start.getTime()) && b.end instanceof Date && !isNaN(b.end.getTime()))
      .filter((b) => b.end > b.start)
      .filter((b) => events.some((av: any) => b.end > av.start && b.start < av.end))
      .filter((b) => {
          const k = `${b.id}:${b.start.toISOString()}:${b.end.toISOString()}`;
          if (byKey.has(k)) return false;
          byKey.add(k);
          return true;
        });
    setBusyTherapEvents(validBusy);
  }, [therapist, events]);

  // Cargar disponibilidad al cambiar terapeuta
  useEffect(() => {
    loadPlannerData();
  }, [therapist, loadPlannerData]);

  // (sin validaciones on-chain)

  const eventPropGetter = useCallback((event: any) => {
    const isActive = event.state === 'Active';
    const isPending = event.state === 'Pending';
    const isConfirmed = event.state === 'Confirmed';
    const style: React.CSSProperties = {
      background: isActive
        ? 'linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.9) 100%)'
        : isConfirmed
          ? 'linear-gradient(135deg, rgba(96,165,250,0.9) 0%, rgba(59,130,246,0.9) 100%)'
        : isPending
          ? 'linear-gradient(135deg, rgba(255,165,0,0.9) 0%, rgba(255,140,0,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(107,114,128,0.85) 0%, rgba(55,65,81,0.85) 100%)',
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
    };
    return { style };
  }, []);

  const onSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    // 1) Validar que el rango esté completamente dentro de una disponibilidad (sin tolerancia)
    const withinAvail = events.some(av => start >= av.start && end <= av.end);
    if (!withinAvail) {
      showToast('Selecciona una franja dentro de la disponibilidad del terapeuta.', 'error');
      return;
    }

    // 2) Si el inicio coincide exactamente con el fin de una consulta previa, ajustar +5 minutos
    let adjustedStart = start;
    const matchesPrevEnd = busyTherapEvents.some(ev => start.getTime() === ev.end.getTime());
    if (matchesPrevEnd) {
      adjustedStart = new Date(start.getTime() + 5 * 60 * 1000);
      // Revalidar disponibilidad con el inicio ajustado
      const withinAvailAfterAdjust = events.some(av => adjustedStart >= av.start && end <= av.end);
      if (!withinAvailAfterAdjust) {
        showToast('El horario ajustado queda fuera de la disponibilidad.', 'error');
        return;
      }
    }

    // 3) Verificar superposición con agendas existentes usando el inicio (posiblemente) ajustado
    const overlapsBusy = busyTherapEvents.some(ev => adjustedStart < ev.end && end > ev.start);
    if (overlapsBusy) {
      showToast('La franja seleccionada ya está ocupada por otra consulta.', 'error');
      return;
    }

    setSelStart(adjustedStart);
    setSelEnd(end);
    setModalOpen(true);
    // Mantener el planner abierto
  }, [events, busyTherapEvents]);

  const openMyConsults = async () => {
    setMySchedLoading(true);
    if (!profile?.id) {
      try { await refreshProfile(); } catch {}
    }
    const pid = profile?.id;
    // 1) Intento con viewer
    const qViewer = `
      query {
        viewer { innerverProfile {
          schedules(last: 200) {
            edges { node { id date_init date_finish roomId therapist { id name displayName } therapistId state } }
          }
        } }
      }
    `;
    let res: any = await executeQuery(qViewer);
    let edges = res?.data?.viewer?.innerverProfile?.schedules?.edges || [];
    // 2) Fallback con node(id)
    if ((!edges || edges.length === 0) && pid) {
      const qNode = `
        query {
          node(id: "${pid}") {
            ... on InnerverProfile {
              schedules(last: 200) {
                edges { node { id date_init date_finish roomId therapist { id name displayName } therapistId state } }
              }
            }
          }
        }
      `;
      res = await executeQuery(qNode);
      edges = res?.data?.node?.schedules?.edges || [];
    }
    const mapped = edges.map((e: any) => ({
      id: e.node.id,
      start: new Date(e.node.date_init),
      end: new Date(e.node.date_finish),
      state: e.node.state || 'Pending',
      roomId: e.node.roomId,
      therapistName: e.node.therapist?.displayName || e.node.therapist?.name || undefined,
      therapistId: e.node.therapistId || undefined,
    }));
    setMySchedEvents(mapped.filter((e: any) => e.state !== 'Cancelled') as any[]);
    // Siempre navegar a la semana de la fecha actual al abrir el modal
    setMySchedDate(new Date());
    setMySchedView(Views.WEEK);
    setMySchedOpen(true);
    setMySchedLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 text-white" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <h3 className="text-lg font-semibold mb-2">Agendar una sesión</h3>
        <p className="text-white/80 text-sm">Haz clic en &quot;Agendar&quot; para seleccionar terapeuta y agendar una consulta usando tus Inner Keys.</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setPlannerOpen(true)}
            className="px-4 py-2 rounded-xl text-white font-medium shadow-lg flex items-center gap-2"
            style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
          >
            <span>Agendar</span>
          </button>
          <button
            onClick={openMyConsults}
            className="px-4 py-2 rounded-xl text-white font-medium shadow-lg"
            style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
          >
            Mis consultas
          </button>
        </div>
      </div>

      {plannerOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}>
          <div className="w-full max-w-6xl rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #6666ff 0%, #7a7aff 50%, #339999 100%)', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
              <h4 className="text-lg font-semibold text-white">Seleccionar terapeuta y horario</h4>
              <button onClick={() => setPlannerOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Terapeuta</label>
                <select
                  value={therapist}
                  onChange={(e) => { setTherapist(e.target.value); setEvents([]); setBusyTherapEvents([]); setTherapistRoomId(""); }}
                  className="w-full px-3 py-2 rounded border bg-white text-black"
                >
                  <option value="">Selecciona terapeuta</option>
                  {therapists.map((t) => (
                    <option key={t.node.id} value={t.node.id}>{t.node.name}</option>
                  ))}
                </select>
              </div>

              {!therapist && (
                <div className="rounded-2xl p-4 text-white" style={{ background: 'rgba(255, 193, 7, 0.15)', border: '1px solid rgba(255, 193, 7, 0.35)' }}>
                  <p className="text-sm">Selecciona un terapeuta para ver el calendario de disponibilidad.</p>
                </div>
              )}

              {therapist && (
                <>
                  <div style={{ height: 600, background: 'rgba(255,255,255,0.98)', borderRadius: 12, padding: 8, position: 'relative' }}>
                    {isLoadingAvail ? (
                      <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                          <p className="text-gray-800 font-medium">Cargando...</p>
                        </div>
                      </div>
                    ) : (
                      <Calendar
                        defaultDate={defaultDate}
                        defaultView={Views.WEEK}
                        culture="es"
                        date={defaultDate}
                        view={Views.WEEK}
                        events={busyTherapEvents}
                        backgroundEvents={events}
                        localizer={localizer}
                        onSelectSlot={(slot) => { onSelectSlot(slot); }}
                        selectable={!isLoadingAvail}
                        scrollToTime={scrollToTime}
                      />
                    )}
                  </div>
                  {toast && (
                    <div
                      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg shadow"
                      style={{
                        background: toast.type === 'error'
                          ? 'rgba(220,38,38,0.95)'
                          : (toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(55,65,81,0.95)'),
                        color: '#fff'
                      }}
                    >
                      {toast.text}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {mySchedOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}>
          <div className="w-full max-w-6xl rounded-2xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #6666ff 0%, #7a7aff 50%, #339999 100%)', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
              <h4 className="text-lg font-semibold text-white">Mis consultas agendadas</h4>
              <button onClick={() => setMySchedOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div style={{ height: 600, background: 'rgba(255,255,255,0.98)', borderRadius: 12, padding: 8, position: 'relative' }}>
                {mySchedLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                  </div>
                )}
                <Calendar
                  culture="es"
                  date={mySchedDate}
                  view={mySchedView}
                  events={mySchedEvents}
                  titleAccessor={(e: any) => (e?.therapistName ? `Terapeuta: ${e.therapistName}` : 'Consulta')}
                  localizer={localizer}
                  messages={{
                    date: 'Fecha', time: 'Hora', event: 'Consulta', allDay: 'Todo el día', week: 'Semana', work_week: 'Semana Laboral', day: 'Día', month: 'Mes', previous: 'Anterior', next: 'Siguiente', today: 'Hoy', agenda: 'Agenda', noEventsInRange: 'No hay eventos en este rango', showMore: (total: number) => `+${total} más`,
                  } as any}
                  components={{
                    agenda: {
                      event: ({ event }: { event: any }) => (
                        <div className="text-sm">
                          <p className="font-semibold">{event.therapistName ? `Terapeuta: ${event.therapistName}` : 'Consulta'}</p>
                          <p className="text-xs text-gray-600">Sala: {event.roomId || '—'}</p>
                        </div>
                      ),
                    },
                  } as any}
                  eventPropGetter={eventPropGetter as any}
                  onSelectEvent={(e: any) => {
                    setSelectedSched({ id: e.id, start: e.start, end: e.end, roomId: e.roomId, tokenId: e.tokenId, therapistName: e.therapistName, nftContract: e.nftContract, therapistId: e.therapistId, state: e.state });
                  }}
                  onNavigate={(d) => { onChainSigRef.current = ''; setMySchedDate(d); }}
                  onView={(v) => { onChainSigRef.current = ''; setMySchedView(v); }}
                  scrollToTime={scrollToTime}
                />
              </div>
              {selectedSched && (
                <ScheduleEditModalConsultant
                  isOpen={!!selectedSched}
                  onClose={() => setSelectedSched(null)}
                  schedule={selectedSched}
                  onUpdated={async (expected) => {
                    const cur = selectedSched;
                    if (!cur) return;
                    // Actualización inmediata optimista a Active
                    setMySchedEvents(prev => prev.map(ev => ev.id === cur.id ? { ...ev, state: 'Active' } : ev));
                    // Confirmación on-chain sin recarga completa
                    try {
                      if (cur.tokenId != null) {
                        const stateNum = await readContract({
                          contract,
                          method: "function getSessionState(uint256 tokenId, string scheduleId) view returns (uint8)",
                          params: [BigInt(cur.tokenId), cur.id]
                        });
                        const n = Number(stateNum as any);
                        const newMapped = mapState(n);
                        setMySchedEvents(prev => prev.map(ev => ev.id === cur.id ? { ...ev, state: newMapped } : ev));
                        // Relectura diferida solo si no coincide con lo esperado
                        if (expected && newMapped !== expected) {
                          setTimeout(async () => {
                            try {
                              const stateNum2 = await readContract({
                                contract,
                                method: "function getSessionState(uint256 tokenId, string scheduleId) view returns (uint8)",
                                params: [BigInt(cur.tokenId!), cur.id]
                              });
                              const n2 = Number(stateNum2 as any);
                              const newMapped2 = mapState(n2);
                              setMySchedEvents(prev => prev.map(ev => ev.id === cur.id ? { ...ev, state: newMapped2 } : ev));
                            } catch {}
                          }, 1200);
                        }
                      }
                    } catch {}
                  }}
                  onSaved={async () => {
                    // Refrescar lista tras guardar
                    setMySchedLoading(true);
                    await openMyConsults();
                    setMySchedLoading(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <ScheduleCreateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={async () => { await loadBusySlots(); await refreshKeyAvailability(); }}
        therapistName={therapistName}
        therapistId={therapist}
        roomIdString={therapistRoomId}
        dateInit={selStart}
        dateFinish={selEnd}
      />
    </div>
  );
};

export default SessionsConsultant;


