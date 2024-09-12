import React, { Fragment, useState, useCallback, useMemo, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar'
//import events from './events'
import { AppContext } from "../context/AppContext";

export default function CalendarTheraAvalSched({ localizer }) {
  const [myEvents, setEvents] = useState([])

  const { innerProfile, isConComposeDB, getInnerProfile, executeQuery } = useContext(AppContext);

  useEffect(() => {
    if(innerProfile) { 
      if(innerProfile.sched_terap != undefined){
        if(innerProfile.sched_terap.edges != undefined) {
          let events = [];
          for(const sched of innerProfile.sched_terap.edges) {
            if(sched.node != undefined){
              console.log('sched.node.date_init:');
              console.log(sched.node.date_init);
              const init = new Date(sched.node.date_init);
              const finish = new Date(sched.node.date_finish);
              const obj = { 
                id: sched.node.id,
                start: init,
                end: finish,
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
    ({ start, end }) => {
      if(innerProfile) { 
        const now = new Date();
        const strMutation = `
        mutation {
          createScheduleTerapist(
            input: {content: {date_init: "${start.toISOString()}", date_finish: "${end.toISOString()}", profileId: "${innerProfile.id}", created: "${now.toISOString()}"}}
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
          const update = executeQuery(strMutation);
          if (!update.errors) {
            console.log('update:');
            console.log(update);
            if(update.data) {
              if(update.data.createScheduleTerapist){
                if(update.data.createScheduleTerapist.document){
                  if(update.data.createScheduleTerapist.document.id){
                    setEvents((prev) => [...prev, { update.data.createScheduleTerapist.document.id, start, end }])
                  }
                }
              }
            }
          }
          console.log("Profile update: ", innerProfile);
        }
      }
    },
    [setEvents]
  )

  /*const handleSelectEvent = useCallback(
    (event) => window.alert(event.title),
    []
  )*/

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(2024, 9, 5),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  )

  return (
    <Fragment>
      <div className="height600">
        <Calendar
          defaultDate={defaultDate}
          defaultView={Views.MONTH}
          events={myEvents}
          localizer={localizer}
          //onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
        />
      </div>
    </Fragment>
  )
}

CalendarTheraAvalSched.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
