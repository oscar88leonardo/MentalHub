"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { useCeramic } from "@/context/CeramicContext";
import ScheduleDetailsModal from "./ScheduleDetailsModal";
import { getContract, readContract} from "thirdweb";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";
import { abi } from "@/abicontracts/MembersAirdrop";
import { watchSessionState } from "@/lib/sessionEvents";
const locales: Record<string, any> = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface EventItem {
  id: string;
  start: Date;
  end: Date;
  state: string;
  roomId: string;
  displayName: string;
  profileRole?: string;
  tokenId?: number;
  nftContract?: string;
  profileId?: string;
}

// mapstate para estados de la consulta
const mapState = (x: number) =>
  x === 0 ? 'Pending' :
  x === 1 ? 'Confirmed' :
  x === 2 ? 'Active' :
  x === 3 ? 'Finished' : 'Pending';

const SessionsTherapist: React.FC = () => {
  const { profile, executeQuery } = useCeramic();
  const executeQueryRef = useRef(executeQuery);
  useEffect(() => { executeQueryRef.current = executeQuery; }, [executeQuery]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [availEvents, setAvailEvents] = useState<Array<{ id: string; start: Date; end: Date; state: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<typeof Views[keyof typeof Views]>(Views.WEEK);
  const onChainSigRef = useRef<string>("");
  const lastOnchainCheckRef = useRef<number>(0);
  const resolvedPendingRef = useRef<Set<string>>(new Set());
  const [stateFilters, setStateFilters] = useState<{ Pending: boolean; Confirmed: boolean; Active: boolean; Finished: boolean }>({ Pending: true, Confirmed: true, Active: true, Finished: true });

   // instancia del contrato con useMemo para evitar re-ejecución por cambios de referencia
  const contract = useMemo(() => getContract(
    { client: client!, 
      chain: myChain, 
      address: contracts.membersAirdrop, 
      abi: abi as [] }), []);

  const { defaultDate, scrollToTime } = useMemo(() => ({
    defaultDate: new Date(),
    scrollToTime: new Date(1970, 1, 1, 6),
  }), []);

  useEffect(() => {
    const run = async () => {
      if (!profile?.id) return;
      setIsLoading(true);
      try {
        const q = `
          query {
            node(id: "${profile.id}") {
              ... on InnerverProfile {
                id
                sched_therap(last: 200) {
                  edges { node { id date_init date_finish state } }
                }
                therapist_sched(last: 200) {
                  edges {
                    node {
                      id
                      date_init
                      date_finish
                      state
                      roomId
                      profileId
                      profile { displayName rol }
                      NFTContract
                      TokenID
                    }
                  }
                }
              }
            }
          }
        `;
        const res: any = await executeQueryRef.current(q);
        const node = res?.data?.node;
        const schedTherap = node?.sched_therap?.edges || [];
        const sEdges = node?.therapist_sched?.edges || [];
        const mapped: EventItem[] = sEdges.map((e: any) => {
          const sn = e?.node;
          return {
            id: sn.id,
            start: new Date(sn.date_init),
            end: new Date(sn.date_finish),
            // Usar el estado del Schedule en ComposeDB como base
            state: (sn?.state as any) ?? 'Pending',
            roomId: sn.roomId,
            displayName: sn.profile?.displayName || "",
            profileRole: sn.profile?.rol || undefined,
            tokenId: typeof sn.TokenID === 'number' ? sn.TokenID : (sn.TokenID ? Number(sn.TokenID) : undefined),
            nftContract: sn.NFTContract || undefined,
            profileId: sn.profileId || undefined,
          };
        });
        setEvents(prev => {
          const prevById = new Map(prev.map(e => [e.id, e.state]));
          return mapped.map(m => {
            const prevState = prevById.get(m.id);
            if (prevState && (prevState === 'Active' || prevState === 'Finished') && m.state === 'Pending') {
              return { ...m, state: prevState };
            }
            return m;
          });
        });
        const avail = schedTherap.map((e: any) => ({ id: e?.node?.id, start: new Date(e?.node?.date_init), end: new Date(e?.node?.date_finish), state: e?.node?.state }));
        setAvailEvents(avail);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [profile?.id]);

  // Leer estado on-chain y reflejarlo en UI (sólo para eventos visibles)
  useEffect(() => {
    if (!events.length || !contract) return;
    
    // Calcular rango visible según la vista
    const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
    let rangeStart = startWeek;
    let rangeEnd = addDays(startWeek, 7);
    if (currentView === Views.DAY) {
      rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);
    } else if (currentView === Views.MONTH) {
      rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    const visible = events.filter(
      (e) => typeof e.tokenId === 'number' && 
                    e.tokenId > 0 && 
                    e.start < rangeEnd && 
                    e.end > rangeStart  // no leer estados pendientes
      );
    if (!visible.length) return;
    
    const key = `${rangeStart.toISOString()}|${rangeEnd.toISOString()}|${visible.map(e => `${e.id}:${e.tokenId}`).join(',')}`;
    if (onChainSigRef.current === key) return;
    
    // Marcar como "en progreso" inmediatamente para evitar ejecuciones duplicadas
    onChainSigRef.current = key;
    
    (async () => {
      try {
        const updates = await Promise.all(visible.map(async (e) => {
          if (resolvedPendingRef.current.has(e.id)) {
            return { id: e.id, state: e.state };
          }
          try {
            const stateNum = await readContract({
              contract,
              method: "function getSessionState(uint256 tokenId, string scheduleId) view returns (uint8)",
              params: [BigInt(e.tokenId as number), e.id]
            });
            const n = Number(stateNum as any);
            return { id: e.id, state: mapState(n) };
          } catch (err: any) {
            const msg = String(err?.message ?? err);
            //console.warn(`Failed to read state for event ${e.id}:`, msg);
            if (msg.includes('Session not found')) {
              resolvedPendingRef.current.add(e.id);
            }
            return { id: e.id, state: e.state }; // Mantener estado actual si falla
          }
        }));
        
        // Verificar que la key no haya cambiado mientras leíamos
        if (onChainSigRef.current !== key) {
          console.log('Skipping update: key changed during read');
          lastOnchainCheckRef.current = Date.now();
          return;
        }
        
        const byId = new Map<string, string>();
        for (const u of updates) {
          byId.set(u.id, u.state);
        }
        
        // Actualizar todos los eventos que tienen actualizaciones
        setEvents(prev => {
          const updated = prev.map(ev => {
            if (byId.has(ev.id)) {
              return { ...ev, state: byId.get(ev.id)! };
            }
            return ev;
          });
          return updated;
        });
      } catch (err: any) {
        console.error('Error reading on-chain states:', err?.message ?? err);
        // Aplicar cooldown sin reiniciar la firma para evitar bucles
      } finally {
        lastOnchainCheckRef.current = Date.now();
      }
    })();
  }, [events, contract, currentDate, currentView]); 
  // watchContractEvents para estados de la consulta
 useEffect(() => {
  const unwatch = watchSessionState(contract,(scheduleId, newState) => {
    resolvedPendingRef.current.delete(scheduleId);
    setEvents(prev => prev.map(e => e.id === scheduleId ? { ...e, state: mapState(newState) } : e));
  });
  return () => { try { unwatch?.(); } catch {} };  
}, [contract]);

  const messages = useMemo(() => ({
    date: 'Fecha', time: 'Hora', event: 'Consulta', allDay: 'Todo el día',
    week: 'Semana', day: 'Día', month: 'Mes', previous: 'Anterior', next: 'Siguiente', today: 'Hoy', agenda: 'Agenda',
    noEventsInRange: 'No hay eventos en este rango', showMore: (t: number) => `+${t} más`,
  }), []);

  const displayedEvents = useMemo(() => {
    return events.filter(e => (stateFilters as any)[e.state] ?? true);
  }, [events, stateFilters]);

  const eventPropGetter = useCallback((event: EventItem | any) => {
    // No alterar estilo de background events (disponibilidad)
    if ((event as any)?.isBackgroundEvent) {
      return {};
    }
    // También considerar como disponibilidad si no tiene roomId (estructura de availEvents)
    if (!(event as any)?.roomId) {
      return {};
    }
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

  const onSelectEvent = useCallback((e: any) => {
    // Ignorar eventos de fondo (disponibilidad)
    if ((e as any)?.isBackgroundEvent) return;
    setSelected(e as EventItem);
    setDetailOpen(true);
  }, []);

  // Render personalizado para eventos en la vista Agenda
  const AgendaEvent: React.FC<{ event: any }> = ({ event }) => {
    return (
      <div>
        <div>{event?.displayName || 'Consulta'}</div>
        {event?.roomId && (
          <div className="text-gray-600 text-xs">Sala: {event.roomId}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 text-white" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <h3 className="text-lg font-semibold mb-2">Consultas Agendadas</h3>
        <p className="text-white/80 text-sm">Haz clic en una sesión para ver detalles.</p>
        <div className="mt-3 flex flex-wrap items-center gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4" checked={stateFilters.Pending} onChange={(e) => setStateFilters(prev => ({ ...prev, Pending: e.target.checked }))} />
            <span className="inline-block w-4 h-4 rounded"
                  style={{ background: 'linear-gradient(135deg, rgba(255,165,0,0.9) 0%, rgba(255,140,0,0.9) 100%)', border: '1px solid rgba(255,255,255,0.22)' }} />
            <span className="text-white/90">Pendiente</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4" checked={stateFilters.Confirmed} onChange={(e) => setStateFilters(prev => ({ ...prev, Confirmed: e.target.checked }))} />
            <span className="inline-block w-4 h-4 rounded"
                  style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.9) 0%, rgba(59,130,246,0.9) 100%)', border: '1px solid rgba(255,255,255,0.22)' }} />
            <span className="text-white/90">Confirmada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4" checked={stateFilters.Active} onChange={(e) => setStateFilters(prev => ({ ...prev, Active: e.target.checked }))} />
            <span className="inline-block w-4 h-4 rounded"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.9) 100%)', border: '1px solid rgba(255,255,255,0.22)' }} />
            <span className="text-white/90">Activa</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4" checked={stateFilters.Finished} onChange={(e) => setStateFilters(prev => ({ ...prev, Finished: e.target.checked }))} />
            <span className="inline-block w-4 h-4 rounded"
                  style={{ background: 'linear-gradient(135deg, rgba(107,114,128,0.85) 0%, rgba(55,65,81,0.85) 100%)', border: '1px solid rgba(255,255,255,0.22)' }} />
            <span className="text-white/90">Finalizada</span>
          </label>
        </div>
      </div>

      <div style={{ height: 600, background: 'rgba(255,255,255,0.98)', borderRadius: 12, padding: 8, position: 'relative' }}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3"></div>
              <p className="text-gray-800 font-medium">Cargando...</p>
            </div>
          </div>
        )}
        <Calendar
          defaultDate={defaultDate}
          defaultView={Views.WEEK}
          culture="es"
          date={currentDate}
          view={currentView}
          events={displayedEvents as any}
          localizer={localizer}
          messages={messages}
          titleAccessor={(e: any) => (e?.isBackgroundEvent ? '' : (e?.displayName ? e.displayName : 'Consulta'))}
          components={{ agenda: { event: AgendaEvent } } as any}
          eventPropGetter={eventPropGetter as any}
          onSelectEvent={onSelectEvent}
          onNavigate={(d) => { onChainSigRef.current = ''; resolvedPendingRef.current.clear(); setCurrentDate(d); }}
          onView={(v) => { onChainSigRef.current = ''; resolvedPendingRef.current.clear(); setCurrentView(v); }}
          backgroundEvents={availEvents}
          scrollToTime={scrollToTime}
        />
      </div>

      {detailOpen && selected && (
        <ScheduleDetailsModal
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
          event={selected}
          onUpdated={() => {
            setDetailOpen(false);
            // 1) Actualización inmediata del evento seleccionado vía on-chain (sin esperar GraphQL)
            (async () => {
              try {
                if (selected?.tokenId != null) {
                  const stateNum = await readContract({
                    contract,
                    method: "function getSessionState(uint256 tokenId, string scheduleId) view returns (uint8)",
                    params: [BigInt(selected.tokenId), selected.id]
                  });
                  const n = Number(stateNum as any);
                  const newState = mapState(n);
                  setEvents(prev => prev.map(ev => ev.id === selected.id ? { ...ev, state: newState } : ev));
                }
              } catch {}
            })();
          }}
        />
      )}
    </div>
  );
};

export default SessionsTherapist;


