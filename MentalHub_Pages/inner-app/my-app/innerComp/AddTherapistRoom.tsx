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
} from "reactstrap";
/*import { useViewerRecord } from "@self.id/react";
import { uploadImage, uploadFile } from '@self.id/image-utils';*/
import { AppContext } from "../context/AppContext";
import { CLIENT_PUBLIC_FILES_PATH } from 'next/dist/shared/lib/constants';

 
const AddTherapistRoom=()=> {
  const [modalisOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  

  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = useContext(AppContext);

  const updateRecord = async () => {
    const now = new Date();
    console.log(now.toISOString());
    const strMutation = `
    mutation {
      createHuddle01(
        input: {content: {name: "${name}", profileId: "${innerProfile.id}", created: "${now.toISOString()}"}}
      ) {
        document {
          id
          name
        }
      }
    }
    `;
    console.log("strMutation:");
    console.log(strMutation)
    await executeQuery(strMutation);
    await getInnerProfile();
    console.log("Profile update: ", innerProfile);
    setIsOpen(false);
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
  
  return (
    <div>
      <NavLink
        href="#"
        className="btn btn-light font-14"
        onClick={()=>setIsOpen(true)}
      >
        Set Room
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
          bottom: '15%',
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
