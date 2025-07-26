import React, { Fragment, useState, useCallback, useMemo, useContext, useEffect, SetStateAction, Dispatch } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar';
//import events from './events'
import { AppContext } from "../context/AppContext";
import AddSchedTherapist from './AddSchedTherapist';

// Define the props for the CalendarSchedule component
interface CalendarScheduleProps {
  localizer: DateLocalizer;
}

interface Event {
  id: string;
  start: Date;
  end: Date;
  state: string;
  huddId: string;
  roomId: string;
  profileId: string;
}

interface handleSelectSlotInterface {
  start: Date;
  end: Date;
}

export default function CalendarSchedule({ localizer }: CalendarScheduleProps) {
  const [myEvents, setEvents] = useState<Event[]>([]);
  const [modalAddScheduleisOpen, setModalAddScheduleisOpen] = useState(false);
  const [modalAddScheduleisEdit, setModalAddScheduleisEdit] = useState(false);
  const [modalAddScheduleHuddId, setModalAddScheduleHuddId] = useState("");
  const [modalAddScheduleRoomId, setModalAddScheduleRoomId] = useState("");
  const [modalAddScheduleID, setModalAddScheduleID] = useState("");
  const [modalAddScheduleDisplayName, setModalAddScheduleDisplayName] = useState("");
  const [modalAddScheduleRoomName, setModalAddScheduleRoomName] = useState("");
  const [modalAddScheduleDateInit, setModalAddScheduleDateInit] = useState(new Date());
  const [modalAddScheduleDateFinish, setModalAddScheduleDateFinish] = useState(new Date());
  const [dateInit, setDateInit] = useState<Date>(new Date());
  const [dateFinish, setDateFinish] = useState<Date>(new Date());

  
  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  const { innerProfile, isConComposeDB, getInnerProfile, executeQuery } = context;

  useEffect(() => {
    if(innerProfile) { 
      if(innerProfile.hudds != undefined){
        if(innerProfile.hudds.edges != undefined) {
          let events = [];
          for(const hudd of innerProfile.hudds.edges) {
            if(hudd.node != undefined){
              if(hudd.node.schedules != undefined){
                if(hudd.node.schedules.edges != undefined) {
                  for(const sched of hudd.node.schedules.edges) {
                    if(sched.node != undefined){
                      console.log('sched.node.date_init:');
                      console.log(sched.node.date_init);
                      const init = new Date(sched.node.date_init);
                      const finish = new Date(sched.node.date_finish);
                      const roomId = "";
                      const obj = { 
                        id: sched.node.id,
                        start: init,
                        end: finish,
                        state: sched.node.state,
                        huddId: hudd.node.id,
                        roomId: hudd.node.roomId,
                        profileId: sched.node.profileId,
                        displayName: sched.node.profile.displayName,
                        roomName:hudd.node.name
                      }
                      events.push(obj);
                    }
                  }
                }
              }
            }
          }
          console.log('events:');
          console.log(events);
          setEvents(events);
        }
      }
    }
  },[innerProfile]);
  
  const handleSelectSlot = useCallback(    
    async ({ start, end}:handleSelectSlotInterface) => {
      setDateInit(start);
      setDateFinish(end);
    },
    [setEvents]
  )

  const handleSelectEvent = useCallback(
    (event:any) => {
      console.log("event:");
      console.log(event);
      if(!event.isBackgroundEvent){
        openModalAddScheduleEdit(event.id,event.start,event.end,event.huddId,event.roomId,event.displayName,event.roomName);
      }
    },  
    []
  );

  const { defaultDate, scrollToTime/*, minTime, maxTime*/ } = useMemo(
    () => {
      /*const min = new Date();
      min.setHours(6, 0, 0, 0);
      
      const max = new Date();
      max.setHours(20, 0, 0, 0);*/

      return {
        defaultDate: new Date(),
        scrollToTime: new Date(1970, 1, 1, 6),
        /*minTime: min,
        maxTime: max*/
      }
    },
    []
  )
  
  const openModalAddScheduleCreate = (dateInit:Date,dateFinish:Date) => {
    
    setModalAddScheduleisEdit(false);
    setModalAddScheduleID("");
    setModalAddScheduleDateInit(dateInit);
    setModalAddScheduleDateFinish(dateFinish);
    setModalAddScheduleisOpen(true);
  };

  const openModalAddScheduleEdit = (id:string,dateInit:Date,dateFinish:Date,huddId:string,roomId:string,displayName:string,roomName:string) => {
    setModalAddScheduleisEdit(true);
    setModalAddScheduleHuddId(huddId);
    setModalAddScheduleRoomId(roomId);
    setModalAddScheduleID(id);
    setModalAddScheduleDisplayName(displayName);
    setModalAddScheduleRoomName(roomName);
    setModalAddScheduleDateInit(dateInit);
    setModalAddScheduleDateFinish(dateFinish);
    setModalAddScheduleisOpen(true);
  };

  useEffect(() => {
    if(!modalAddScheduleisOpen){
      setModalAddScheduleID("");
      setModalAddScheduleDateInit(new Date());
      setModalAddScheduleDateFinish(new Date());
      setModalAddScheduleHuddId("");
      setModalAddScheduleisEdit(false);
    } else {
      console.log("openModalAddScheduleCreate therapist:");
    }
  },[modalAddScheduleisOpen]);
  
  return (
    <Fragment>
      <AddSchedTherapist show={modalAddScheduleisOpen} close={() => setModalAddScheduleisOpen(false)} isedit={modalAddScheduleisEdit} huddId={modalAddScheduleHuddId} roomId={modalAddScheduleRoomId} id={modalAddScheduleID} dateInit={modalAddScheduleDateInit} dateFinish={modalAddScheduleDateFinish} displayName={modalAddScheduleDisplayName} roomName={modalAddScheduleRoomName} />
      <div style={{height:600}}>
        <Calendar
          defaultDate={defaultDate}
          defaultView={Views.MONTH}
          events={myEvents} // use filteredEvents instead of myEvents
          //backgroundEvents={availTEvents}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          //selectable={!!therapist} // solo permitir selección si hay un terapeuta seleccionado
          scrollToTime={scrollToTime}
          /*min={minTime}
          max={maxTime}*/
        />
      </div>
    </Fragment>
  )
}

CalendarSchedule.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
