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
 
const TherapistRooms=()=> {
  const [modalisOpen, setIsOpen] = useState(false);
  const [modalAddRoomisOpen, setModalAddRoomIsOpen] = useState(false);
  const [modalAddRoomIsEdit, setModalAddRoomIsEdit] = useState(false);
  const [modalAddRoomState, setModalAddRoomState] = useState("");
  const [modalAddRoomName, setModalAddRoomName] = useState("");
  const [modalAddRoomID, setModalAddRoomID] = useState("");
  //const [hudds,setHudds] = useState(null);
  //const [hasMounted, setHasMounted] = useState(false);

  const myRef = useRef<HTMLTableSectionElement | null>(null);  
  const router = useRouter();

  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }  
  const { innerProfile,isConComposeDB, getInnerProfile, executeQuery } = context;

  /*const getRooms = async () => {
    const strQuery = `
    query {
        node (id: "${innerProfile.id}") {
          ... on InnerverProfile {
            id
            name
            hudds (last:300) {
              edges {
                node {
                  id
                  name
                  created
                }
              }
            }
          }
        }
      }
    `;
    console.log("strQuery:");
    console.log(strQuery)
    const hudds = await executeQuery(strQuery);
    console.log("update:");
    console.log(hudds);
    setHudds(hudds);
  };*/

  const openModalAddRoom = (name:string,state:string,id:string) => {
    setModalAddRoomIsEdit(true);
    setModalAddRoomState(state);
    setModalAddRoomName(name);
    setModalAddRoomID(id);
    setModalAddRoomIsOpen(true)
  };

  const openMeet = (roomId:string) => {
    /*const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '';
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    window.open(origin + "/meet/" + roomId, "_blank");*/
    //router.push(`/meet/${roomId}/1`);
    console.log("OPENING ROOM" )
    //router.push(`/meet/${roomId}/0`);
    window.open(`https://innerverse.huddle01.app/room/${roomId}`, "_blank", 'noopener,noreferrer');
  };

  const renderHuddsTable = () => {
    if(innerProfile.hudds != undefined){
      if(innerProfile.hudds.edges != undefined) {
        //const row = document.getElementById('huddsTableID');
        //console.log(myRef.current);
        if(myRef.current != null && myRef.current != undefined){
          
          myRef.current.innerHTML = "";
          
          for(const hudd of innerProfile.hudds.edges) {
            if(hudd.node != undefined){
              
              var tr = document.createElement("tr");
              var tdName = document.createElement("th");
              tdName.textContent = hudd.node.name;
              var tdBut = document.createElement("td");
              var Butt = document.createElement("button");
              Butt.textContent = 'Edit Room';
              Butt.onclick = () => openModalAddRoom(hudd.node.name,hudd.node.state,hudd.node.id);
              tdBut.appendChild(Butt);
              var tdOpn = document.createElement("td");
              var ButtOpn = document.createElement("button");
              ButtOpn.textContent = 'Open Room';
              ButtOpn.onclick = () => openMeet(hudd.node.roomId);
              tdOpn.appendChild(ButtOpn);
              tr.appendChild(tdName);
              tr.appendChild(tdBut);
              tr.appendChild(tdOpn);
              
              myRef.current.appendChild(tr);
            }
          }
        }
      }
    }
  };

  /*useEffect(() => {
    setHasMounted(true);
  }, []);*/

  /*useEffect(() => {
    console.log("modalisOpen:");
    console.log(modalisOpen);
    console.log("hudds:");
    console.log(hudds);
    console.log("myRef.current:");
    console.log(myRef.current);
    if(modalisOpen){
      setTimeout(() => {
        // Código a ejecutar cuando el modal se abre
        if(hudds != undefined && hudds != null && myRef.current != null && myRef.current != undefined) {
          renderHuddsTable();
        }
      }, 0);
    }
  },[modalisOpen]);*/

  /*useEffect(() => {
    if (modalisOpen) {
      setTimeout(() => {
        // Código a ejecutar cuando el modal se abre
        console.log('Modal abierto');
      }, 0);
    }
  }, [modalisOpen]);*/

  useEffect(() => {
    if(innerProfile != undefined && innerProfile != null){
      if(modalisOpen){
        setTimeout(() => {
          // Código a ejecutar cuando el modal se abre
          if(innerProfile.hudds != undefined && innerProfile.hudds != null && myRef.current != null && myRef.current != undefined) {
            renderHuddsTable();
            renderButton();
          }
        }, 0);
      }
    }
  },[modalisOpen,innerProfile]);
  
  useEffect(() => {
    if(!modalAddRoomisOpen){
      setModalAddRoomID("");
      setModalAddRoomName("");
      setModalAddRoomState("");
      setModalAddRoomIsEdit(false);
    }
  },[modalAddRoomisOpen]);

  const renderButton = () => {
    if(innerProfile != undefined && innerProfile != null){
      if(innerProfile.rol == 'Terapeuta') {
        return(
          <NavLink
            href="#"
            className="btn btn-light font-14"
            onClick={()=>setIsOpen(true)}
          >
            Rooms
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
          <h4 className="title">Therapist Rooms</h4>
          <NavLink
            href="#"
            className="btn btn-light font-14"
            onClick={() => setModalAddRoomIsOpen(true)}
          >
            Add Room
          </NavLink>
          <AddTherapistRoom show={modalAddRoomisOpen} close={() => setModalAddRoomIsOpen(false)} isedit={modalAddRoomIsEdit} state={modalAddRoomState} name={modalAddRoomName} id={modalAddRoomID}/>
          <Table 
        >
          <thead>
            <tr>
              <th>
                Name
              </th>
              <th>
                Edit
              </th>
              <th>
                Open
              </th>
            </tr>
          </thead>
          <tbody ref={myRef}>
            
          </tbody>
        </Table>
        </div>
      </ReactModal>
    </div>
  );
};
 
export default TherapistRooms;
