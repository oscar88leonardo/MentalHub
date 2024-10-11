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
import { CLIENT_PUBLIC_FILES_PATH } from 'next/dist/shared/lib/constants';
import { createRoom } from '../app/meet/components/createRoom';

// Component interface and type definitions
interface AddTherapistRoomProps {
  show: boolean;
  close: () => void;
  isedit: boolean;
  state: string;
  name: string;
  id: string;
}

const AddTherapistRoom: React.FC<AddTherapistRoomProps> =(props)=> {
  const [name, setName] = useState("");
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
      let roomId = '';
      for(const hudd of innerProfile.hudds.edges) {
        //console.log(hudd.node.id+" "+props.id);
        if(hudd.node.id === props.id){
          created = hudd.node.created;
          roomId = hudd.node.roomId;
        }
      }
      
      strMutation = `
      mutation {
        updateHuddle01(
          input: {id: "${props.id}", content: {name: "${name}", roomId: "${roomId}", profileId: "${innerProfile.id}", created: "${created}", edited: "${now.toISOString()}", state: ${state}}}
        ) {
          document {
            id
            name
          }
        }
      }
      `;
    } else {
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
 
  /*useEffect(() => {
    console.log("innerProfile DATA");
    console.log(innerProfile);   
    if (innerProfile!=undefined){
      console.log("innerProfile defined");
      if (innerProfile.name != undefined)
        setName(innerProfile.name);
    }
  },[innerProfile]);*/
  
  useEffect(() => {
    if(props.show) { 
      setName(props.name);
      setState(props.state);
    }
  },[props.show]);

  return (
    <div>
      
      <ReactModal 
        isOpen={props.show}
        onRequestClose={props.close}
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
          right: '60%',
          bottom: '60%',
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
          <h4 className="title">Edit room</h4>
          <Form>
            <Row>
              <Col lg="6">
                <FormGroup className="m-t-15">
                  <Input type="text" placeholder="name" 
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    />
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
 
export default AddTherapistRoom;
