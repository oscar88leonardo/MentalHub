import ReactModal from 'react-modal';
import React, { useState, useEffect, useContext,useRef } from 'react';
import {
  Row,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Button,
  Alert,
  NavLink, 
  Table
} from "reactstrap";
import { AppContext } from "../context/AppContext";
import { CLIENT_PUBLIC_FILES_PATH } from 'next/dist/shared/lib/constants';
import AddTherapistRoom from '../innerComp/AddTherapistRoom';
import { useRouter } from 'next/navigation';
import moment from 'moment'
import { momentLocalizer } from 'react-big-calendar'
import CalendarTheraAvalSched from './CalendarTheraAvalSched'
import "../node_modules/react-big-calendar/lib/css/react-big-calendar.css";
 
const localizer = momentLocalizer(moment)

const TherapistAvalSched=()=> {
  const [modalisOpen, setIsOpen] = useState(false);

  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = useContext(AppContext);

  useEffect(() => {
    if(innerProfile != undefined && innerProfile != null){
      if(modalisOpen){
        setTimeout(() => {
          // Código a ejecutar cuando el modal se abre
          
        }, 0);
      }
    }
  },[modalisOpen,innerProfile]);

  return (
    <div>
      <NavLink
        href="#"
        className="btn btn-light font-14"
        onClick={()=>setIsOpen(true)}
      >
        Available Schedule
      </NavLink>
      
      <ReactModal 
        isOpen={modalisOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Edit Profile"
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
          <h4 className="title">Available Therapist Schedule</h4>
          <CalendarTheraAvalSched localizer={localizer} />
        </div>
      </ReactModal>
    </div>
  );
};
 
export default TherapistAvalSched;
