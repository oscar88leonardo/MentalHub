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
 
const AddSchedule=(props)=> {
  const [dateInit, setDateInit] = useState(new Date());
  const [dateFinish, setDateFinish] = useState(new Date());
  const [state, setState] = useState("");
  const [room, setRoom] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomList, setRoomList] = useState([]);
  const [therapistName, setTherapistName] = useState("");

  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = useContext(AppContext);

  const router = useRouter();

  useEffect(() => {
    if(props.therapistInfo) { 
      if(props.therapistInfo.data){
        if(props.therapistInfo.data.nodes){
          for(const thera of props.therapistInfo.data.nodes) {
            if(thera.hudds){
              if(thera.hudds.edges){
                setRoomList(thera.hudds.edges);
              }
            }
          }
        }
      }
    }
  },[props.therapistInfo]);

  useEffect(() => {
    if(roomList) { 
      for(const hudd of roomList) {
        if(hudd.node){
          if(hudd.node.profile){
            if(hudd.node.profile.name){
              setTherapistName(hudd.node.profile.name);
            }
          }
        }
      }
    }
  },[roomList]);

  const updateRecord = async () => {
    const now = new Date();
    //console.log(now.toISOString());
    let strMutation = '';
    if(props.isedit) {
      let created = '';
      for(const sched of innerProfile.schedules.edges) {
        if(sched.node.id === props.id){
          created = sched.node.created;
        }
      }
      
      strMutation = `
      mutation {
        updateSchedule(
          input: {id: "${props.id}", content: {date_init: "${dateInit.toISOString()}", date_finish: "${dateFinish.toISOString()}", profileId: "${innerProfile.id}", created: "${created}", edited: "${now.toISOString()}", state: ${state}, huddId: "${room}"}}
        ) {
          document {
            id
          }
        }
      }
      `;
    } else {
      strMutation = `
        mutation {
          createSchedule(
            input: {content: {date_init: "${dateInit.toISOString()}", date_finish: "${dateFinish.toISOString()}", profileId: "${innerProfile.id}", created: "${now.toISOString()}", state: Pending, huddId: "${room}"}}
          ) {
            document {
              id
            }
          }
        }
        `;
    }
    console.log("strMutation:");
    console.log(strMutation)
    if(strMutation){
      await executeQuery(strMutation);
      await getInnerProfile();
      console.log("Profile update: ", innerProfile);
    }    
    props.close();
  };
   
  useEffect(() => {
    if(props.show) { 
      setDateInit(props.dateInit);
      setDateFinish(props.dateFinish);
      setState(props.state);
      setRoom(props.huddId);
      setRoomId(props.roomId);
    }
  },[props.show]);

  const openMeet = (roomId) => {
    /*const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '';
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    window.open(origin + "/meet/" + roomId, "_blank");*/
    router.push(`/meet/${roomId}`);
  };

  return (
    <div>
      
      <ReactModal 
        isOpen={props.show}
        onRequestClose={props.close}
        contentLabel="Edit Available Schedule"
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
          <h4 className="title">Edit Available Schedule</h4>
          <Form>
            <Row>
              <Col lg="6">
                <FormGroup className="m-t-15">
                <Label for="RoomTSelect">
                  {therapistName ? therapistName : 'Therapist' } Room 
                </Label>
                <Input
                  id="RoomTSelect"
                  name="RoomTSelect"
                  type="select"
                  onChange={(e) => setRoom(e.target.value)}
                  value={room}
                >
                  <option>Select therapist room</option>
                  { roomList ? roomList.map((item) =>(
                      <option key={item.node.id} value={item.node.id}>{item.node.name}</option>
                  ))
                  : ""
                }
                </Input>
                <Label for="dateInit">
                    Start Date
                  </Label>
                  <DatePicker selected={dateInit}
                    onChange={(date) => setDateInit(date)}
                    timeInputLabel="Time:"
                    dateFormat="MM/dd/yyyy h:mm aa"
                    showTimeInput 
                    name="dateInit" />
                  <Label for="dateFinish">
                    End Date
                  </Label>
                  <DatePicker name="dateFinish" 
                    selected={dateFinish} 
                    onChange={(date) => setDateFinish(date)} 
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
                  onClick={() => updateRecord()}
                >
                  <span>
                    {" "}
                    Save <i className="ti-arrow-right"></i>
                  </span>
                </Button>              
              </Col>
              { props.isedit ? 
                <Col lg="12">
                  <Button
                    className="btn btn-light m-t-20 btn-arrow"
                    onClick={() => openMeet(roomId)}
                  >
                    <span>
                      Open Room
                    </span>
                  </Button>              
                </Col>
              : ""}
            </Row>
          </Form>
        </div>
      </ReactModal>
    </div>
  );
};
 
export default AddSchedule;
