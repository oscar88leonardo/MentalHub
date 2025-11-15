"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import DebugWallet from "./DebugWallet";
import { useCeramic } from "@/context/CeramicContext";
import { resolveIpfsUrl } from "@/lib/ipfs";
import Image from "next/image";
// import { myChain } from "@/config/chain";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import type { View, Messages } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import dynamic from "next/dynamic";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Cargar react-datepicker sólo en cliente
const EditTherapistAvailabilityModal = dynamic(() => import("./EditTherapistAvailabilityModal"), { ssr: false });

type ScheduleState = "Active" | "Archived";

interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  state: ScheduleState;
  created?: string;
}

const locales: Record<string, any> = { es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface AvailabilityProps {
  onLogout: () => void;
}

const Availability: React.FC<AvailabilityProps> = ({ onLogout }) => {
  const { profile, account, /*adminAccount,*/ executeQuery, authenticateForWrite, refreshProfile } = useCeramic();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<{ id: string; state: ScheduleState; start: Date; end: Date; created?: string } | null>(null);
  const fetchedOnceRef = useRef(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [showArchived, setShowArchived] = useState(false);

  // Persistencia de preferencia "Mostrar archivados"
  useEffect(() => {
    try {
      const saved = localStorage.getItem("availability:showArchived");
      if (saved !== null) {
        setShowArchived(saved === "1" || saved === "true");
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("availability:showArchived", showArchived ? "1" : "0");
    } catch {}
  }, [showArchived]);

  const fetchAvailability = useCallback(async () => {
    if (!profile?.id) return;
    try {
      setIsLoading(true);
      // Intento 1: consultar por node(id: profile.id) con filtros en arrays (no requiere viewer)
      const queryNode1 = `
        query {
          node(id: "${profile.id}") {
            ... on InnerverProfile {
              id
              active: sched_therap(last: 200, filters: { where: { state: { in: [Active] } } }) { edges { node { id date_init date_finish created state } } }
              archived: sched_therap(last: 200, filters: { where: { state: { in: [Archived] } } }) { edges { node { id date_init date_finish created state } } }
            }
          }
        }
      `;
      const res: any = await executeQuery(queryNode1);
      const activeEdges = res?.data?.node?.active?.edges || [];
      const archivedEdges = res?.data?.node?.archived?.edges || [];

      const toEvents = (arr: any[]) => arr
        .map((e: any) => e?.node)
        .filter(Boolean)
        .map((n: any) => ({ id: n.id, start: new Date(n.date_init), end: new Date(n.date_finish), state: n.state as ScheduleState, created: n.created }));
      const mapped: CalendarEvent[] = [...toEvents(activeEdges), ...toEvents(archivedEdges)];
      setEvents(mapped);
    } catch (e) {
      console.error("Error fetching availability:", e);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, executeQuery]);

  useEffect(() => {
    // Asegurar que el perfil esté cargado antes de validar rol/mostrar contenido
    if (!profile) {
      (async () => {
        try {
          await refreshProfile();
        } catch (e) {
          console.warn("No se pudo cargar el perfil antes de montar Disponibilidad", e);
        }
      })();
    }
  }, [profile, refreshProfile]);

  useEffect(() => {
    if (isCalendarOpen && profile?.id) {
      // Evitar doble fetch inmediato al abrir
      if (!fetchedOnceRef.current) {
        fetchedOnceRef.current = true;
        fetchAvailability();
      }
    } else if (!isCalendarOpen) {
      fetchedOnceRef.current = false;
    }
  }, [isCalendarOpen, profile?.id, fetchAvailability]);

  const { defaultDate, scrollToTime } = useMemo(() => ({
    defaultDate: new Date(),
    scrollToTime: new Date(1970, 1, 1, 6),
  }), []);

  const messages: Messages = useMemo(() => ({
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    allDay: 'Todo el día',
    week: 'Semana',
    work_week: 'Semana laboral',
    day: 'Día',
    month: 'Mes',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    agenda: 'Agenda',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total) => `+${total} más`,
  }), []);

  const displayedEvents = useMemo(() => (
    showArchived ? events : events.filter((e) => e.state === "Active")
  ), [events, showArchived]);

  const hasOverlap = useCallback((start: Date, end: Date) => {
    return events.some(({ start: s, end: e }) => (start >= s && start < e) || (end > s && end <= e) || (start <= s && end >= e));
  }, [events]);

  const handleSelectSlot = useCallback(async ({ start, end }: { start: Date; end: Date }) => {
    if (!profile?.id) return;
    if (hasOverlap(start, end)) {
      alert("Por favor, selecciona un bloque libre (sin superposición)");
      return;
    }
    try {
      await authenticateForWrite();
      const now = new Date();
      const mutation = `
        mutation {
          createScheduleTherapist(
            input: {content: {date_init: "${start.toISOString()}", date_finish: "${end.toISOString()}", profileId: "${profile.id}", created: "${now.toISOString()}", state: Active }}
          ) {
            document { id }
          }
        }
      `;
      const res: any = await executeQuery(mutation);
      if (!res?.errors) {
        await refreshProfile();
        await fetchAvailability();
      } else {
        console.error(res.errors);
        alert("No se pudo crear la disponibilidad");
      }
    } catch (e) {
      console.error(e);
      alert("Error al crear disponibilidad. Revisa la consola.");
    }
  }, [profile?.id, authenticateForWrite, executeQuery, refreshProfile, fetchAvailability, hasOverlap]);

  const handleSelectEvent = useCallback((evt: any) => {
    setEditData({ id: evt.id, state: evt.state, start: evt.start, end: evt.end, created: evt.created });
    setEditOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async (data: { id: string; state: ScheduleState; start: Date; end: Date; created?: string }) => {
    if (!profile?.id) return;
    try {
      await authenticateForWrite();
      const now = new Date();
      const created = data.created || now.toISOString();
      const mutation = `
        mutation {
          updateScheduleTherapist(
            input: {id: "${data.id}", content: {date_init: "${data.start.toISOString()}", date_finish: "${data.end.toISOString()}", profileId: "${profile.id}", created: "${created}", edited: "${now.toISOString()}", state: ${data.state}}}
          ) {
            document { id }
          }
        }
      `;
      const res: any = await executeQuery(mutation);
      if (!res?.errors) {
        setEditOpen(false);
        setEditData(null);
        await refreshProfile();
        await fetchAvailability();
      } else {
        console.error(res.errors);
        alert("No se pudo actualizar la disponibilidad");
      }
    } catch (e) {
      console.error(e);
      alert("Error al actualizar disponibilidad");
    }
  }, [profile?.id, authenticateForWrite, executeQuery, refreshProfile, fetchAvailability]);

  const renderWelcomeCard = () => {
    if (!account) return null;
    return (
      <div 
        className="rounded-2xl p-8 text-white mb-8 shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="flex items-center space-x-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {profile?.pfp ? (
              <Image 
                src={resolveIpfsUrl(profile.pfp)} 
                alt="pfp"
                width={80}
                height={80}
                className="w-20 h-20 object-cover"
              />
            ) : (
              <span className="text-3xl font-bold">
                {account?.address ? account.address.slice(2, 3).toUpperCase() : ""}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              ¡Hola de nuevo! 👋
            </h2>
            <p className="text-white/90 text-lg mb-3" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              Para agregar tu disponibilidad, abre el calendario y selecciona los bloques de tiempo libres. Para editar o archivar un bloque, haz clic sobre él.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const isActive = event.state === "Active";
    const style: React.CSSProperties = {
      background: isActive
        ? "linear-gradient(135deg, rgba(111,111,240,0.9) 0%, rgba(90,90,214,0.9) 100%)"
        : "linear-gradient(135deg, rgba(107,114,128,0.85) 0%, rgba(55,65,81,0.85) 100%)",
      color: "#ffffff",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
    };
    return { style };
  }, []);

  const dayPropGetter = useCallback((date: Date) => {
    const isToday = (() => {
      const d = new Date();
      return d.toDateString() === date.toDateString();
    })();
    if (isToday) {
      return {
        style: {
          background: "rgba(102,102,255,0.06)",
        },
      };
    }
    return {};
  }, []);

  if (!profile || profile.rol !== "Terapeuta") {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Disponibilidad" 
          subtitle="Gestiona tus horarios disponibles"
          onLogout={onLogout}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <DebugWallet />
            <div className="rounded-2xl p-6 text-white" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h3 className="text-xl font-semibold mb-2">Acceso restringido</h3>
              <p>Esta sección está disponible sólo para usuarios con rol &quot;Terapeuta&quot;.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Disponibilidad" 
        subtitle="Gestiona tus horarios disponibles"
        onLogout={onLogout}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <DebugWallet />

          {renderWelcomeCard()}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Disponibilidad del Terapeuta</h3>
              <p className="text-white/80">Abre el calendario para gestionar tus horarios disponibles</p>
            </div>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="px-6 py-3 rounded-xl text-white font-medium transition-colors shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Abrir Calendario
            </button>
          </div>

          {/* Modal del Calendario */}
          {isCalendarOpen && (
            <div 
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}
            >
              <div 
                className="w-full max-w-6xl rounded-2xl shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #6666ff 0%, #7a7aff 50%, #339999 100%)',
                  border: '1px solid rgba(255,255,255,0.16)'
                }}
              >
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
                  <h4 className="text-lg font-semibold text-white">Calendario de Disponibilidad</h4>
                  <button onClick={() => setIsCalendarOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  {/* Leyenda de colores y filtro */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-white">
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 9999,
                          background: 'linear-gradient(135deg, rgba(111,111,240,0.9) 0%, rgba(90,90,214,0.9) 100%)',
                          border: '1px solid rgba(255,255,255,0.25)'
                        }}
                      />
                      <span className="text-sm">Activo</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 9999,
                          background: 'linear-gradient(135deg, rgba(107,114,128,0.85) 0%, rgba(55,65,81,0.85) 100%)',
                          border: '1px solid rgba(255,255,255,0.25)'
                        }}
                      />
                      <span className="text-sm">Archivado (no visible a consultantes)</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-white">
                      <input
                        id="toggle-archived"
                        type="checkbox"
                        checked={showArchived}
                        onChange={(e) => setShowArchived(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="toggle-archived" className="text-sm cursor-pointer">Mostrar archivados</label>
                    </div>
                  </div>

                  <div style={{ height: 600, background: 'rgba(255,255,255,0.98)', borderRadius: 12, padding: 8, position: 'relative' }}>
                    {isLoading && (
                      <div 
                        className="absolute inset-0 z-10 flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.6)' }}
                      >
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
                      onNavigate={(d) => setCurrentDate(d)}
                      onView={(v) => setCurrentView(v)}
                      views={{ month: true, week: true, day: true, agenda: true }}
                      messages={messages}
                      events={displayedEvents}
                      localizer={localizer}
                      eventPropGetter={eventPropGetter}
                      dayPropGetter={dayPropGetter}
                      onSelectEvent={handleSelectEvent}
                      onSelectSlot={handleSelectSlot}
                      selectable={!isLoading}
                      scrollToTime={scrollToTime}
                    />
                  </div>
                  {isLoading && (
                    <div className="mt-3 text-sm text-white/80">Cargando disponibilidad...</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal de edición */}
          {editOpen && editData && (
            <EditTherapistAvailabilityModal
              isOpen={editOpen}
              onClose={() => { setEditOpen(false); setEditData(null); }}
              initialState={editData.state}
              initialStart={editData.start}
              initialEnd={editData.end}
              onSave={(updated) => handleSaveEdit({ id: editData.id, created: editData.created, ...updated })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Availability;


