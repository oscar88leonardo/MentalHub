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

 
const FormConsultante=()=> {
  const [modalisOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [rol, setRol] = useState("");
  const [pfp, setPfp] = useState("");
  const [imageProfile, setImageProfile] = useState(null);
  const [updateFlag,setupdateFlag] = useState(false);
  //const record = useViewerRecord("basicProfile");
  

  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = useContext(AppContext);

  /*const updateRecordEmail = async (email) => {
    await record.merge({
      email: email,
    });
  };*/


  /*const updateRecordImageProfile = async (imageProfile) => {
    console.log('imageProfile:');
    console.log(imageProfile);
    if(imageProfile.length > 0) {
      const uploadedFile = await orbis.uploadMedia(imageProfile[0]);
      console.log('uploadedFile:');
      console.log(uploadedFile);    
      if (uploadedFile.status == 200){
        if(uploadedFile.result.url != undefined){
          console.log("uploaded file");
          console.log(uploadedFile.result.url);  
          let urlImage = 'https://ipfs.io/ipfs/' + uploadedFile.result.url.replace('ipfs://','');
          setPfp(urlImage);          
        }
      }         
        
    } 
  };*/

  const updateRecord = async () => {
    setupdateFlag(true);  
    /*console.log("PFP pre update:");
    console.log(pfp);*/
    /*await updateRecordImageProfile(imageProfile);
    console.log("PFP post update:");
    console.log(pfp);*/
    /*const res = await orbis.updateProfile({username:name, pfp:pfp});
    console.log("res status:");
    console.log(res);
    if (res.status == 200) {
      console.log("Status to get OrbisProfile:");
      setTimeout(() => getOrbisProfile(), 250);
      console.log(orbisProfile);
    } */
   updateProfile(name,rol);
    setIsOpen(false);
  };
 
  useEffect(() => {
    console.log("innerProfile DATA");
    console.log(innerProfile);   
    if (innerProfile!=undefined){
      console.log("innerProfile defined");
      if (innerProfile.name != undefined)
        setName(innerProfile.name);
      if (innerProfile.rol != undefined)
        setRol(innerProfile.rol);
      /*if (orbisProfile.details.profile!= undefined){
        if (orbisProfile.details.profile!= undefined){
          if (orbisProfile.details.profile.pfp!= undefined)
            setPfp(orbisProfile.details.profile.pfp);  
        }
      }*/
    }
  },[innerProfile])

  /*useEffect(() => {
    // action on update of pfp
    // update orbis profile
    //getOrbisProfile();
    if(ceramic.did != undefined && innerProfile != undefined && updateFlag!=false) {
      updateProfile(name,rol);
      console.log("innerProfile Updated");
      setupdateFlag(false);
    }
  }, [pfp, name]);*/

  const updateProfile = async (username,rol) => {
    /*const res = await orbis.updateProfile({
      username:username,
      pfp:pfp
    });*/

    const strMutation = `
    mutation {
      createInnerverProfile(input: {
        content: {
          name: "${username}"
          displayName: "${username}"
          rol: ${rol}
        }
      }) 
      {
        document {
          name
          displayName
          rol
        }
      }
    }
    `;
    console.log("strMutation:");
    console.log(strMutation)
    await executeQuery(strMutation);
    await getInnerProfile();
    console.log("Profile update: ", innerProfile);
  }
  /*<Col lg="6">
                <FormGroup className="m-t-15">
                  <Input type="file" placeholder="image" 
                  onChange={(e) => setImageProfile(e.target.files)}/>
                </FormGroup>
              </Col>*/
  return (
    <div>
      <NavLink
        href="#"
        className="btn btn-light font-14"
        onClick={()=>setIsOpen(true)}
      >
        Edit Profile
      </NavLink>
      
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
          <h4 className="title">Edita tu perfil</h4>
          <Form>
            <Row>
              <Col lg="6">
                <FormGroup className="m-t-15">
                  <Input type="text" placeholder="name" 
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    />
                  <Input type="text" placeholder="rol" 
                    onChange={(e) => setRol(e.target.value)}
                    value={rol}
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
 
export default FormConsultante;
