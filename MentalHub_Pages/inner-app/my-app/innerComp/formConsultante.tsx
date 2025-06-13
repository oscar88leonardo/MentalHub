import ReactModal from 'react-modal';
import React, { useState, useEffect, useContext, ChangeEvent } from 'react';
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

interface IpfsResponse {
  IpfsHash: string;
  [key: string]: any;
} 

interface FormConsultanteProps {
  isForced?: boolean;
}

const FormConsultante: React.FC<FormConsultanteProps> = ({isForced})=> {
  const [modalisOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [rol, setRol] = useState("");
  const [pfp, setPfp] = useState("");
  const [imageProfile, setImageProfile] = useState<File[]>([]);
  const [updateFlag,setupdateFlag] = useState(false);
  const [imageFlag,setimageFlag] = useState(false);
  //const record = useViewerRecord("basicProfile");
  
  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = context;

  /*const updateRecordEmail = async (email) => {
    await record.merge({
      email: email,
    });
  };*/


  const updateRecordImageProfile = async (imageProfile:any) => {
    console.log('imageProfile:');
    console.log(imageProfile);
    if(imageProfile != null) {
      if(imageProfile.length > 0) {
        //const uploadedFile = await orbis.uploadMedia(imageProfile[0]);
        const formData = new FormData();
        formData.append("file", imageProfile[0]);
        console.log('formData:');
        console.log(formData);
        const uploadedFile = await fetch("/api/uploadFile", {
          method: "POST",
          body: formData,
        });
        console.log('uploadedFile:');
        console.log(uploadedFile);   
        if (uploadedFile.status == 200){
          const response = await uploadedFile.json() as IpfsResponse;
          
          if ('IpfsHash' in response) {
            setPfp(response.IpfsHash);
          } else {
            console.error('Invalid response format - missing IpfsHash');
          }
          /*await uploadedFile.json().then((object:Object) => {
            console.log(object);
            if(object.hasOwnProperty('IpfsHash')){
              setPfp(object.IpfsHash);
            }
          });*/
          //console.log(ipfshash.IpfsHash); 
          /*if(uploadedFile.result.url != undefined){
            console.log("uploaded file");
            console.log(uploadedFile.result.url);  
            let urlImage = 'https://ipfs.io/ipfs/' + uploadedFile.result.url.replace('ipfs://','');
            setPfp(urlImage);          
          }*/
        }       
          
      } 
    }
    setimageFlag(true);
  };

  const updateRecord = async () => {
    setupdateFlag(true);  
    /*console.log("PFP pre update:");
    console.log(pfp);*/
    await updateRecordImageProfile(imageProfile);
     // No cerrar el modal aquí, se cerrará automáticamente cuando se actualice innerProfile
    //setIsOpen(false);
  };
 
  

  // Modificar el handleCloseModal
const handleCloseModal = () => {
  if (!isForced || innerProfile !== null) {
    setIsOpen(false);
  }
};


  useEffect(() => {
    console.log("FormConsultante effect:", { isForced, innerProfile });
  // Solo abrir el modal si:
  // 1. Es un usuario nuevo (innerProfile === null)
  // 2. Es forzado (isForced === true)
  // 3. Tenemos información definitiva del perfil (innerProfile !== undefined)
  if (innerProfile === null && isForced) {
    setIsOpen(true);
  } else if (innerProfile) {
    // Si hay perfil, actualizar campos y asegurarse que el modal está cerrado
    if (innerProfile.name) setName(innerProfile.name);
    if (innerProfile.rol) setRol(innerProfile.rol);
    setIsOpen(false);
  }
}, [innerProfile, isForced]);

  useEffect(() => {
    // action on update of pfp
    // update orbis profile
    //getOrbisProfile();
    /*if(ceramic.did != undefined && innerProfile != undefined && updateFlag!=false) {
      updateProfile(name,rol);
      console.log("innerProfile Updated");
      setupdateFlag(false);
    }*/
    if(updateFlag && imageFlag) {
      console.log("PFP post update:");
      console.log(pfp);
      /*const res = await orbis.updateProfile({username:name, pfp:pfp});
      console.log("res status:");
      console.log(res);
      if (res.status == 200) {
        console.log("Status to get OrbisProfile:");
        setTimeout(() => getOrbisProfile(), 250);
        console.log(orbisProfile);
      } */
      updateProfile(name,rol,pfp);
    }
  }, [imageFlag]);

  const updateProfile = async (username:string,rol:string,pfp:string) => {
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
          pfp: "${pfp}"
        }
      }) 
      {
        document {
          name
          displayName
          rol
          pfp
        }
      }
    }
    `;
    console.log("strMutation:");
    console.log(strMutation)
    await executeQuery(strMutation);
    await getInnerProfile();
    console.log("Profile update: ", innerProfile);
    setupdateFlag(false);
    setimageFlag(false);
  }
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList);
      setImageProfile(filesArray);
    } else {
      setImageProfile([]);
    }
  };

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
        onRequestClose={handleCloseModal}
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
                </FormGroup>
                <FormGroup className="m-t-15">
                  <Label for="rolSelect">
                    Rol
                  </Label>
                  <Input
                    id="rolSelect"
                    name="rolSelect"
                    type="select"
                    onChange={(e) => setRol(e.target.value)}
                    value={rol}
                  >
                    <option>
                      Terapeuta
                    </option>
                    <option>
                      Consultante
                    </option>
                  </Input>
                </FormGroup>
              </Col>
              <Col lg="6">
                <FormGroup className="m-t-15">
                  <Input type="file" placeholder="image" 
                  onChange={handleFileChange}/>
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
