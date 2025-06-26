import ReactModal from 'react-modal';
import React, { useState, useEffect, useContext } from 'react';
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
  Label
} from "reactstrap";
/*import { useViewerRecord } from "@self.id/react";
import { uploadImage, uploadFile } from '@self.id/image-utils';*/
import { AppContext } from "../context/AppContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/navigation';
import { StreamID } from '@ceramicnetwork/streamid';
import { validateOpenMeet } from './validOpenRoom';

/// Component interface and type definitions
//
interface AddScheduleProps {
  show: boolean;
  close: () => void;
  isedit: boolean;
  huddId: string;
  roomId: string;
  state: string;
  id: string;
  dateInit: Date;
  dateFinish: Date;
  displayName: string;
  roomName: string;
}

///interface for roomList
// enum for room state
enum State {
  Archived = 'Archived',
  Active = 'Active'
}

// Enum for Rol
enum Rol {
  Terapeuta = 'Terapeuta',
  Consultante = 'Consultante'
}

// Interface for InnerverProfile
interface InnerverProfile {
  id: string; // ComposeDB typically adds an id field
  displayName: string;
  name: string;
  rol: Rol;
  pfp?: string; // Optional because it doesn't have a '!' in the schema
}
// interface for elements in roomList array
interface Huddle01 {
  id: string;
  state: State;
  name: string;
  roomId: string;
  edited: Date;
  created: Date;
  profileId: StreamID;
  profile: InnerverProfile;
}

// Interface for the node structure in the GraphQL response
interface HuddleNode {
  node: Huddle01;
}
/////////////

const AddSchedTherapist: React.FC<AddScheduleProps> =(props)=> {
  const [dateInit, setDateInit] = useState(new Date());
  const [dateFinish, setDateFinish] = useState(new Date());
  const [state, setState] = useState("");
  const [room, setRoom] = useState("");
  const [roomId, setRoomId] = useState<string>("");

  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  } 
  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = context;

  const router = useRouter();
   
  useEffect(() => {
    if(props.show) { 
      setDateInit(props.dateInit);
      setDateFinish(props.dateFinish);
      setState(props.state);
      setRoom(props.huddId);
      setRoomId(props.roomId);
    }
  },[props.show]);


  return (
    <div>
      
      <ReactModal 
        isOpen={props.show}
        onRequestClose={props.close}
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
          right: '60%',
          bottom: '50%',
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
          <Form>
            <Row>
              <Col lg="6">
                <FormGroup className="m-t-15">
                  <Label for="roomName">
                     Room Name
                  </Label>
                  <Input
                    id="roomName"
                    name="roomName"
                    type="text"
                    value={props.roomName}
                  ></Input>
                </FormGroup>
                <FormGroup className="m-t-15">
                  <Label for="displayName">
                     Consultant Name
                  </Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={props.displayName}
                  ></Input>
                </FormGroup>
                <FormGroup className="m-t-15">
                  <Label for="dateInit">
                    Start Date
                  </Label>
                  <DatePicker 
                    name="dateInit"
                    selected={dateInit}
                    onChange={(date:Date | null) =>{
                      if (date){
                        setDateInit(date) 
                      }
                    } }
                    timeInputLabel="Time:"
                    dateFormat="MM/dd/yyyy h:mm aa"
                    showTimeInput 
                     />
                </FormGroup>
                <FormGroup className="m-t-15">
                  <Label for="dateFinish">
                    End Date
                  </Label>
                  <DatePicker 
                    name="dateFinish" 
                    selected={dateFinish} 
                    onChange={(date:Date | null) => {
                      if (date) {
                        setDateFinish(date) 
                      }
                    } } 
                    timeInputLabel="Time:"
                    dateFormat="MM/dd/yyyy h:mm aa"
                    showTimeInput />
                </FormGroup>
              </Col>
              { props.isedit ? 
                <Col lg="6">
                <FormGroup className="m-t-15">
                  <Label for="stateSelect">
                    State
                  </Label>
                  <Input
                    id="stateSelect"
                    name="stateSelect"
                    type="select"
                    onChange={(e) => setState(e.target.value)}
                    value={state}
                  >
                    <option>
                      Active
                    </option>
                    <option>
                      Archived
                    </option>
                    <option>
                      Pending
                    </option>
                  </Input>
                </FormGroup>
              </Col>
              : ""}
              <Col lg="12">
                <Button
                  className="btn btn-light m-t-20 btn-arrow"
                  
                  onClick={() => validateOpenMeet(roomId,dateInit,dateFinish)}
                >
                  <span>
                    Open Room
                  </span>
                </Button>              
              </Col>
            </Row>
          </Form>
        </div>
      </ReactModal>
    </div>
  );
};
 
export default AddSchedTherapist;
