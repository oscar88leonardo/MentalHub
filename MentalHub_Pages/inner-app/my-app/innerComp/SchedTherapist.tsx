import ReactModal from 'react-modal';
import React, { useState, useEffect, useContext,useRef } from 'react';
import {
  NavLink, 
} from "reactstrap";
import { AppContext } from "../context/AppContext";
import moment from 'moment'
import { momentLocalizer } from 'react-big-calendar'
import "../node_modules/react-big-calendar/lib/css/react-big-calendar.css";
import CalendarSchedTherap from './CalendarSchedTherap';

const localizer = momentLocalizer(moment)

const SchedTherapist=()=> {
  const [modalisOpen, setIsOpen] = useState(false);

  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }  
  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = context;
  
  useEffect(() => {
    if(innerProfile != undefined && innerProfile != null){
      if(modalisOpen){
        setTimeout(() => {
          // Código a ejecutar cuando el modal se abre
          renderButton();
        }, 0);
      }
    }
  },[modalisOpen,innerProfile]);

  const renderButton = () => {
    if(innerProfile != undefined && innerProfile != null){
      if(innerProfile.rol == 'Terapeuta') {
        return(
          <NavLink
          href="#"
          className="btn btn-light font-14"
          onClick={()=>setIsOpen(true)}
        >
          Schedule Therapist
        </NavLink>
        );
      }
    }
    return("");
  }

  return (
    <div>
      {renderButton()}
      
      <ReactModal 
        isOpen={modalisOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Schedule Therapist"
        style={{
        overlay: {
          position: 'fixed',
          top: 100,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.75)'
        },
        content: {
          position: 'absolute',
          top: '40px',
          left: '10px',
          right: '10px',
          bottom: '5%',
          border: '1px solid #ccc',
          background: '#fff',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '4px',
          outline: 'none',
          padding: '20px'
        }
      }}
      >
        <div className="contact-box p-r-40">
          <h4 className="title">Schedule Therapist</h4>
          <CalendarSchedTherap localizer={localizer} />
        </div>
      </ReactModal>
    </div>
  );
};
 
export default SchedTherapist;
