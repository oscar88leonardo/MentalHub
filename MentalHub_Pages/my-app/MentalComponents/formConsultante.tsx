import ReactModal from 'react-modal';
import React, { useState, useContext } from 'react';
import {
  Row,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Button,
  Alert,
} from "reactstrap";
/*import { useViewerRecord } from "@self.id/react";
import { uploadImage, uploadFile } from '@self.id/image-utils';*/
import { AppContext } from "../context/AppContext";
 
const FormConsultante=()=> {
  const [modalisOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [imageProfile, setImageProfile] = useState(null);
  //const record = useViewerRecord("basicProfile");

  const { orbis, orbisProfile} = useContext(AppContext);

  /*const updateRecordEmail = async (email) => {
    await record.merge({
      email: email,
    });
  };*/

  const updateRecordName = async (name) => {
    /*await record.merge({
      name: name,
    });*/
    orbis.updateProfile({username:name});
  };

  const updateRecordImageProfile = async (imageProfile) => {
    console.log('imageProfile:');
    console.log(imageProfile);
    if(imageProfile.length > 0) {
      /*const imageSources = await uploadImage(
        'https://mental-hub-my-app-p3qk.vercel.app/api/uploadimage',
        imageProfile[0],
        [{ width: 60, height: 60 }],
      )
      await record.merge({
        image: imageSources,
      });*/
    } else 
      alert('Select an image.');
  };

  const updateRecord = async () => {
    await updateRecordName(name);
    await updateRecordImageProfile(imageProfile);
    setIsOpen(false);
  };
 
  return (
    <div>
      <button onClick={()=>setIsOpen(true)}>Edit Data Profile</button>
      <ReactModal 
        isOpen={modalisOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Example Modal"
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
          <h4 className="title">Form Consultant</h4>
          <Form>
            <Row>
              <Col lg="6">
                <FormGroup className="m-t-15">
                  <Input type="text" placeholder="name" 
                    onChange={(e) => setName(e.target.value)}/>
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup className="m-t-15">
                  <Input type="file" placeholder="image" 
                  onChange={(e) => setImageProfile(e.target.files)}/>
                </FormGroup>
              </Col>
              <Col lg="12">
                <Button
                  className="btn btn-danger-gradiant m-t-20 btn-arrow"
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
 
export default FormConsultante;
