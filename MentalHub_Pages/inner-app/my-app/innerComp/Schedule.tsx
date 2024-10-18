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
  Table,
  Label
} from "reactstrap";
import { AppContext } from "../context/AppContext";
import { CLIENT_PUBLIC_FILES_PATH } from 'next/dist/shared/lib/constants';
import AddTherapistRoom from '../innerComp/AddTherapistRoom';
import { useRouter } from 'next/navigation';
import moment from 'moment'
import { momentLocalizer } from 'react-big-calendar'
import CalendarSchedule from './CalendarSchedule'
import "../node_modules/react-big-calendar/lib/css/react-big-calendar.css";
 
// Add these interfaces at the top of the file
interface TherapistNode {
  id: string;
  name: string;
}

interface TherapistEdge {
  node: TherapistNode;
}

interface TherapistQueryResponse {
  data?: {
    innerverProfileIndex?: {
      edges?: TherapistEdge[];
    };
  };
}

const localizer = momentLocalizer(moment)

const Schedule=()=> {
  const [modalisOpen, setIsOpen] = useState(false);
  const [therapist, setTherapist] = useState<string>("");
  const [therapistList, setTherapistList] = useState<TherapistEdge[]>([]);

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
          getTherapists();
        }, 0);
      }
    }
  },[modalisOpen,innerProfile]);

  const getTherapists = async () => {
    const strQuery = `
      query {
          innerverProfileIndex(filters: {where: {rol: {in: Terapeuta}}}, last: 100) {
            edges {
              node {
                name
                id
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
          if(query.data.innerverProfileIndex){
            if(query.data.innerverProfileIndex.edges){
              setTherapistList(query.data.innerverProfileIndex.edges);
            }
          }
        }
      }
    }
  }

  const renderButton = () => {
    if(innerProfile != undefined && innerProfile != null){
      if(innerProfile.rol == 'Consultante') {
        return(
          <NavLink
          href="#"
          className="btn btn-light font-14"
          onClick={()=>setIsOpen(true)}
        >
          Schedule
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
        contentLabel="Schedule"
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
          <h4 className="title">Schedule</h4>
          <FormGroup className="m-t-15">
            <Label for="TheraSelect">
              Terapeuta
            </Label>
            <Input
              id="TheraSelect"
              name="TheraSelect"
              type="select"
              onChange={(e) => setTherapist(e.target.value)}
              value={therapist}
            >
              <option>Select therapist</option>
              { therapistList ? therapistList.map((item) =>(
                  <option key={item.node.id} value={item.node.id}>{item.node.name}</option>
               ))
               : ""
            }
            </Input>
          </FormGroup>
          <CalendarSchedule therapist={therapist} setTherapist={setTherapist} localizer={localizer} />
        </div>
      </ReactModal>
    </div>
  );
};
 
export default Schedule;
