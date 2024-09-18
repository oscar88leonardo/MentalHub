import React, { Fragment, useState, useCallback, useMemo, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar'
//import events from './events'
import { AppContext } from "../context/AppContext";
import AddSchedule from '../innerComp/AddSchedule';

export default function CalendarSchedule({ therapist, localizer }) {
  const [myEvents, setEvents] = useState([]);
  const [availTEvents, setAvailTEvents] = useState([]);
  const [therapistInfo, setTherapistInfo] = useState({});
  const [modalAddScheduleisOpen, setModalAddScheduleisOpen] = useState(false);
  const [modalAddScheduleisEdit, setModalAddScheduleisEdit] = useState(false);
  const [modalAddScheduleState, setModalAddScheduleState] = useState("");
  const [modalAddScheduleHuddId, setModalAddScheduleHuddId] = useState("");
  const [modalAddScheduleID, setModalAddScheduleID] = useState("");
  const [modalAddScheduleDateInit, setModalAddScheduleDateInit] = useState(new Date());
  const [modalAddScheduleDateFinish, setModalAddScheduleDateFinish] = useState(new Date());

  const { innerProfile, isConComposeDB, getInnerProfile, executeQuery } = useContext(AppContext);

  useEffect(() => {
    if(therapist){
      console.log(therapist);
      getTherapistInfo();
    }
  },[therapist]);

  useEffect(() => {
    if(therapistInfo){
      if(therapistInfo.data){
        if(therapistInfo.data.nodes){
          let Bgevents = [];
          console.log('therapistInfo.data.nodes:');
          console.log(therapistInfo.data.nodes);
          for(const node of therapistInfo.data.nodes) {
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
  },[therapistInfo]);

  const getTherapistInfo = async () => {
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
              hudds(last: 100, filters: {where: {state: {in: Active}}}) {
                edges {
                  node {
                    id
                    name
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
        setTherapistInfo(query);
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
                huddId: sched.node.huddId,
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
  
  const handleSelectSlot = useCallback(
    async ({ start, end }) => {
      console.log(start);
      console.log(end);
      openModalAddScheduleCreate(start,end);
    },
    [setEvents]
  )

  const handleSelectEvent = useCallback(
    (event) => {
      console.log("event:");
      console.log(event);
      openModalAddScheduleEdit(event.state,event.id,event.start,event.end,event.huddId);
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

  const openModalAddScheduleCreate = (dateInit,dateFinish) => {
    setModalAddScheduleisEdit(false);
    setModalAddScheduleState(null);
    setModalAddScheduleID(null);
    setModalAddScheduleDateInit(dateInit);
    setModalAddScheduleDateFinish(dateFinish);
    setModalAddScheduleisOpen(true);
  };

  const openModalAddScheduleEdit = (state,id,dateInit,dateFinish,huddId) => {
    setModalAddScheduleisEdit(true);
    setModalAddScheduleState(state);
    setModalAddScheduleHuddId(huddId);
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
      setModalAddScheduleHuddId("");
      setModalAddScheduleisEdit(false);
    }
  },[modalAddScheduleisOpen]);
  
  return (
    <Fragment>
      <AddSchedule show={modalAddScheduleisOpen} close={() => setModalAddScheduleisOpen(false)} isedit={modalAddScheduleisEdit} huddId={modalAddScheduleHuddId} state={modalAddScheduleState} id={modalAddScheduleID} dateInit={modalAddScheduleDateInit} dateFinish={modalAddScheduleDateFinish} therapistInfo={therapistInfo}/>
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
          min={minTime}
          max={maxTime}
        />
      </div>
    </Fragment>
  )
}

CalendarSchedule.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
