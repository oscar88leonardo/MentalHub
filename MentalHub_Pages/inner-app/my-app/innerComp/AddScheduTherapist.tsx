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

// Component interface and type definitions
interface AddScheduTherapistProps {
  show: boolean;
  close: () => void;
  isedit: boolean;
  state: string;
  id: string;
  dateInit: Date;
  dateFinish: Date;
}

const AddScheduTherapist: React.FC<AddScheduTherapistProps> =(props)=> {
  const [dateInit, setDateInit] = useState(new Date());
  const [dateFinish, setDateFinish] = useState(new Date());
  const [state, setState] = useState("");

  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }  
  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = context;

  const updateRecord = async () => {
    const now = new Date();
    //console.log(now.toISOString());
    let strMutation = '';
    if(props.isedit) {
      let created = '';
      for(const sched of innerProfile.sched_therap.edges) {
        
        if(sched.node.id === props.id){
          created = sched.node.created;
        }
      }
      
      strMutation = `
      mutation {
        updateScheduleTherapist(
          input: {id: "${props.id}", content: {date_init: "${dateInit.toISOString()}", date_finish: "${dateFinish.toISOString()}", profileId: "${innerProfile.id}", created: "${created}", edited: "${now.toISOString()}", state: ${state}}}
        ) {
          document {
            id
          }
        }
      }
      `;
    } /*else {
      const roomId = await createRoom();
      if (roomId){      
        strMutation = `
          mutation {
            createHuddle01(
              input: {content: {name: "${name}", roomId: "${roomId}", profileId: "${innerProfile.id}", created: "${now.toISOString()}", state: Active}}
            ) {
              document {
                id
                name
              }
            }
          }
          `;
      }
    }*/
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
    }
  },[props.show]);

  return (
    <div>
      
      <ReactModal 
        isOpen={props.show}
        onRequestClose={props.close}
        contentLabel="Edit Schedule"
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
          <h4 className="title">Edit Schedule</h4>
          <Form>
            <Row>
              <Col lg="6">
                <FormGroup className="m-t-15">
                  <Label for="dateInit">
                    Start Date
                  </Label>
                  <DatePicker 
                    name="dateInit"
                    selected={dateInit}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setDateInit(date)
                      } 
                    }}
                    timeInputLabel="Time:"
                    dateFormat="MM/dd/yyyy h:mm aa"
                    showTimeInput 
                     />
                  <Label for="dateFinish">
                    End Date
                  </Label>
                  <DatePicker 
                    name="dateFinish" 
                    selected={dateFinish} 
                    onChange={(date: Date | null) => {
                      if (date) {
                        setDateFinish(date) 
                      } 
                    }} 
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
            </Row>
          </Form>
        </div>
      </ReactModal>
    </div>
  );
};
 
export default AddScheduTherapist;
