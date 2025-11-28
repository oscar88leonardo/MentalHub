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
  // tokenId y nftContract eliminados
  profileId?: string;
}

// mapstate para estados de la consulta
const mapState = (x: number) =>
  x === 0 ? 'Pending' :
  x === 1 ? 'Confirmed' :
  x === 2 ? 'Active' :
  x === 3 ? 'Finished' :
  x === 4 ? 'Cancelled' : 'Pending';

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
                  edges { node { id date_init date_finish } }
                }
                therapist_sched(last: 200) {
                  edges {
                    node {
                      id
                      date_init
                      date_finish
                      roomId
                      profileId
                      profile { displayName rol }
                      therapistResponse(first: 1) {
                        edges { node { status } }
                      }
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
          const statusEdge = sn.therapistResponse?.edges?.[0]?.node;
          const ceramicStatus = statusEdge ? statusEdge.status : 'Pending';

          let uiState = 'Pending';
          const now = new Date();
          const start = new Date(sn.date_init);
          const end = new Date(sn.date_finish);
          
          if (ceramicStatus === 'CONFIRMED') {
             if (now >= start && now <= end) uiState = 'Active';
             else if (now > end) uiState = 'Finished'; // Opcional, si no se marcó completed
             else uiState = 'Confirmed';
          } else if (ceramicStatus === 'COMPLETED') {
             uiState = 'Finished';
          } else if (ceramicStatus === 'CANCELLED' || ceramicStatus === 'REJECTED') {
             uiState = 'Cancelled';
          }

          return {
            id: sn.id,
            start: start,
            end: end,
            state: uiState,
            roomId: sn.roomId,
            displayName: sn.profile?.displayName || "",
            profileRole: sn.profile?.rol || undefined,
            profileId: sn.profileId || undefined,
          };
        });
        
        setEvents(mapped);

        const avail = schedTherap.map((e: any) => ({
          id: e?.node?.id,
          start: new Date(e?.node?.date_init),
          end: new Date(e?.node?.date_finish),
          state: 'Pending'
        }));
        setAvailEvents(avail);
        
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [profile?.id]);
  
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
          onNavigate={(d) => { setCurrentDate(d); }}
          onView={(v) => { setCurrentView(v); }}
          backgroundEvents={availEvents}
          scrollToTime={scrollToTime}
        />
      </div>

      {detailOpen && selected && (
        <ScheduleDetailsModal
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
          event={selected}
          onUpdated={(expected) => {
            setDetailOpen(false);
            if (expected === 'Cancelled' && selected?.id) {
              setEvents(prev => prev.filter(ev => ev.id !== selected.id));
              return;
            }
            // Actualización inmediata del evento seleccionado (solo cambio de estado en UI)
            setEvents(prev => prev.map(ev => ev.id === selected.id ? { ...ev, state: expected || 'Pending' } : ev));
          }}
        />
      )}
    </div>
  );
};

export default SessionsTherapist;
