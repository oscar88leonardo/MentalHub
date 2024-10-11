import React, { Fragment, useState, useCallback, useMemo, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar'
//import events from './events'
import { AppContext } from "../context/AppContext";
import AddScheduTherapist from '../innerComp/AddScheduTherapist';

export default function CalendarTheraAvalSched({ localizer }) {
  const [myEvents, setEvents] = useState([]);
  const [modalAddSchedTheraisOpen, setModalAddSchedTheraisOpen] = useState(false);
  const [modalAddSchedTheraisEdit, setModalAddSchedTheraisEdit] = useState(false);
  const [modalAddSchedTheraState, setModalAddSchedTheraState] = useState("");
  const [modalAddSchedTheraID, setModalAddSchedTheraID] = useState("");
  const [modalAddSchedTheraDateInit, setModalAddSchedTheraDateInit] = useState(new Date());
  const [modalAddSchedTheraDateFinish, setModalAddSchedTheraDateFinish] = useState(new Date());
  const [dateInit, setDateInit] = useState(new Date());
  const [dateFinish, setDateFinish] = useState(new Date());
  const [flagValidateDate, setFlagValidateDate] = useState(false);

  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }  
  const { innerProfile, isConComposeDB, getInnerProfile, executeQuery } = context;

  useEffect(() => {
    if(innerProfile) { 
      if(innerProfile.sched_therap != undefined){
        if(innerProfile.sched_therap.edges != undefined) {
          let events = [];
          for(const sched of innerProfile.sched_therap.edges) {
            if(sched.node != undefined){
              console.log('sched.node.date_init:');
              console.log(sched.node.date_init);
              const init = new Date(sched.node.date_init);
              const finish = new Date(sched.node.date_finish);
              const obj = { 
                id: sched.node.id,
                start: init,
                end: finish,
                state: sched.node.state,
              }
              events.push(obj);
            }
          }
          console.log('events:');
          console.log(events);
          setEvents(events);
        }
      }
    }
  },[innerProfile]);

  const updateRecord = async (dateInit,dateFinish) => {
    if(innerProfile) { 
      const now = new Date();
      const strMutation = `
      mutation {
        createScheduleTherapist(
          input: {content: {date_init: "${dateInit.toISOString()}", date_finish: "${dateFinish.toISOString()}", profileId: "${innerProfile.id}", created: "${now.toISOString()}", state: Active }}
        ) {
          document {
            id
          }
        }
      }
      `;
      console.log("strMutation:");
      console.log(strMutation)
      if(strMutation){
        const update = await executeQuery(strMutation);
        if (!update.errors) {
          console.log('update:');
          console.log(update);
          //setEvents((prev) => [...prev, { id, start, end }]);
          getInnerProfile();
        }
        console.log("Profile update: ", innerProfile);
      }
    }
  }

  useEffect(() => {
    if(flagValidateDate){
      let validMyEvent = myEvents.some(({start, end}) => {
        return (dateInit >= start && dateInit <= end) || (dateFinish >= start && dateFinish <= end);
      });
      if(!validMyEvent) {
        updateRecord(dateInit,dateFinish);
      } else {
        alert('Please, Select an available date.');
      }
      setFlagValidateDate(false);
    }
  },[flagValidateDate]);

  const handleSelectSlot = useCallback(
    async ({ start, end }) => {
      setDateInit(start);
      setDateFinish(end);
      setFlagValidateDate(true);
    },
    [setEvents]
  )

  const handleSelectEvent = useCallback(
    (event) => {
      console.log("event:");
      console.log(event);
      openModalAddSchedThera(event.state,event.id,event.start,event.end);
    }/*window.alert(event.title)*/,
    []
  );

  const { defaultDate, scrollToTime, minTime, maxTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
      minTime: new Date().setHours(6),
      maxTime: new Date().setHours(20)
    }),
    []
  )

  const openModalAddSchedThera = (state,id,dateInit,dateFinish) => {
    setModalAddSchedTheraisEdit(true);
    setModalAddSchedTheraState(state);
    setModalAddSchedTheraID(id);
    setModalAddSchedTheraDateInit(dateInit);
    setModalAddSchedTheraDateFinish(dateFinish);
    setModalAddSchedTheraisOpen(true)
  };

  useEffect(() => {
    if(!modalAddSchedTheraisOpen){
      setModalAddSchedTheraID("");
      setModalAddSchedTheraDateInit(new Date());
      setModalAddSchedTheraDateFinish(new Date());
      setModalAddSchedTheraState("");
      setModalAddSchedTheraisEdit(false);
    }
  },[modalAddSchedTheraisOpen]);

  return (
    <Fragment>
      <AddScheduTherapist show={modalAddSchedTheraisOpen} close={() => setModalAddSchedTheraisOpen(false)} isedit={modalAddSchedTheraisEdit}  state={modalAddSchedTheraState} id={modalAddSchedTheraID} dateInit={modalAddSchedTheraDateInit} dateFinish={modalAddSchedTheraDateFinish}/>
      <div style={{height:600}}>
        <Calendar
          defaultDate={defaultDate}
          defaultView={Views.MONTH}
          events={myEvents}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
          min={minTime}
          max={maxTime}
        />
      </div>
    </Fragment>
  )
}

CalendarTheraAvalSched.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
