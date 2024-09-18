import React, { Fragment, useState, useCallback, useMemo, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar'
//import events from './events'
import { AppContext } from "../context/AppContext";
//import AddScheduTherapist from '../innerComp/AddScheduTherapist';

export default function CalendarSchedule({ therapist, localizer }) {
  const [myEvents, setEvents] = useState([]);
  const [availTEvents, setAvailTEvents] = useState([]);
  const [modalAddScheduleisOpen, setModalAddScheduleisOpen] = useState(false);
  const [modalAddScheduleisEdit, setModalAddScheduleisEdit] = useState(false);
  const [modalAddScheduleState, setModalAddScheduleState] = useState("");
  const [modalAddScheduleID, setModalAddScheduleID] = useState("");
  const [modalAddScheduleDateInit, setModalAddScheduleDateInit] = useState(new Date());
  const [modalAddScheduleDateFinish, setModalAddScheduleDateFinish] = useState(new Date());

  const { innerProfile, isConComposeDB, getInnerProfile, executeQuery } = useContext(AppContext);

  useEffect(() => {
    if(therapist){
      console.log(therapist);
      getAvailTSche();
    }
  },[therapist]);

  const getAvailTSche = async () => {
    const strQuery = `
      query {
          nodes(ids: "` + therapist + `") {
            ... on InnerverProfile {
              id
              sched_therap(filters: {where: {state: {in: Active}}}, last: 100) {
                edges {
                  node {
                    date_finish
                    date_init
                    id
                    state
                  }
                }
              }
            }
          }
        }
    `;
    if(strQuery){
      const query = await executeQuery(strQuery);
      if (!query.errors) {
        console.log('query:');
        console.log(query);
        if(query.data){
          if(query.data.nodes){
            let Bgevents = [];
            console.log('query.data.nodes:');
            console.log(query.data.nodes);
            for(const node of query.data.nodes) {
              if(node.sched_therap){
                if(node.sched_therap.edges){
                  for(const sched of node.sched_therap.edges) {
                    const init = new Date(sched.node.date_init);
                    const finish = new Date(sched.node.date_finish);
                    const obj = { 
                      id: sched.node.id,
                      start: init,
                      end: finish,
                      state: sched.node.state,
                    }
                    Bgevents.push(obj);
                  }
                }
              }
            }
            console.log('Bgevents:');
            console.log(Bgevents);
            setAvailTEvents(Bgevents);
          }
        }
      }
    }
  }

  useEffect(() => {
    if(innerProfile) { 
      if(innerProfile.schedules != undefined){
        if(innerProfile.schedules.edges != undefined) {
          let events = [];
          for(const sched of innerProfile.schedules.edges) {
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

  /*useEffect(() => {
    if(innerProfile) { 
      getInnerProfile();
    }
  },[myEvents]);*/
  
  const handleSelectSlot = useCallback(
    async ({ start, end }) => {
      console.log(start);
      console.log(end);
      /*if(innerProfile) { 
        const now = new Date();
        const strMutation = `
        mutation {
          createScheduleTherapist(
            input: {content: {date_init: "${start.toISOString()}", date_finish: "${end.toISOString()}", profileId: "${innerProfile.id}", created: "${now.toISOString()}", state: Active }}
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
      }*/
    },
    [setEvents]
  )

  const handleSelectEvent = useCallback(
    (event) => {
      console.log("event:");
      console.log(event);
      //openModalAddSchedule(event.state,event.id,event.start,event.end);
    },  
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

  /*const openModalAddSchedule = (state,id,dateInit,dateFinish) => {
    setModalAddScheduleisEdit(true);
    setModalAddScheduleState(state);
    setModalAddScheduleID(id);
    setModalAddScheduleDateInit(dateInit);
    setModalAddScheduleDateFinish(dateFinish);
    setModalAddScheduleisOpen(true)
  };

  useEffect(() => {
    if(!modalAddScheduleisOpen){
      setModalAddScheduleID("");
      setModalAddScheduleDateInit(new Date());
      setModalAddScheduleDateFinish(new Date());
      setModalAddScheduleState("");
      setModalAddScheduleisEdit(false);
    }
  },[modalAddScheduleisOpen]);*/
  //<AddScheduTherapist show={modalAddSchedTheraisOpen} close={() => setModalAddSchedTheraisOpen(false)} isedit={modalAddSchedTheraisEdit}  state={modalAddSchedTheraState} id={modalAddSchedTheraID} dateInit={modalAddSchedTheraDateInit} dateFinish={modalAddSchedTheraDateFinish}/>
  return (
    <Fragment>
      
      <div style={{height:600}}>
        <Calendar
          defaultDate={defaultDate}
          defaultView={Views.MONTH}
          events={myEvents}
          backgroundEvents={availTEvents}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
          minTime={minTime}
          maxTime={maxTime}
        />
      </div>
    </Fragment>
  )
}

CalendarSchedule.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
