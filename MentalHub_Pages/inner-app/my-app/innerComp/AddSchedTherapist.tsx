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
import { openMeet } from './myMeet';
import { abi, NFT_CONTRACT_ADDRESS } from "../constants/MembersAirdrop";
import { 
  getContract, 
  readContract } from "thirdweb";
import {client as clientThridweb} from "../innerComp/client";
import { myChain } from "../innerComp/myChain";

/// Component interface and type definitions
//
interface AddScheduleProps {
  show: boolean;
  close: () => void;
  isedit: boolean;
  huddId: string;
  roomId: string;
  id: string;
  dateInit: Date;
  dateFinish: Date;
  displayName: string;
  roomName: string;
}

///interface for roomList
// enum for room state
enum State {
  Pending = 0, 
  Confirmed = 1, 
  Active = 2, 
  Finished = 3
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
  const [state, setState] = useState(null);
  const [room, setRoom] = useState("");
  const [roomId, setRoomId] = useState<string>("");
  const [nft, setNft] = useState(0);
  const [idSchedule, setIdSchedule] = useState("");

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
      //setState(props.state);
      setRoom(props.huddId);
      setRoomId(props.roomId);
    }
  },[props.show]);

  useEffect(() => {
    if(innerProfile) { 
      if(innerProfile.hudds != undefined){
        if(innerProfile.hudds.edges != undefined) {
          for(const hudd of innerProfile.hudds.edges) {
            if(hudd.node != undefined){
              if(hudd.node.schedules != undefined){
                if(hudd.node.schedules.edges != undefined) {
                  for(const sched of hudd.node.schedules.edges) {
                    if(sched.node != undefined){
                      if(sched.node.id === props.id){
                        setNft(sched.node.TokenID);
                        setIdSchedule(sched.node.id);
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },[innerProfile]);

  // incializacion del contrato
  const contract =   getContract({
    client: clientThridweb!,
    chain: myChain,
    address: NFT_CONTRACT_ADDRESS,
    // The ABI for the contract is defined here
    abi: abi as [],
  });

  useEffect(() => {
    if(nft) { 
      readContract({
        contract: contract,
        method: "function getSessionState(uint256 tokenId, string scheduleId) view returns (uint256)",
        params: [nft ? BigInt(nft) : BigInt(0), idSchedule],
      }).then((returnState) => {
        
        console.log("returnState:", returnState);
        /*if (typeof returnState === "string" && returnState) {
          
        }*/
      });
    }
  },[nft]);

  const updateRecordState = async () => {
      const now = new Date();
  
      if(dateFinish > now) {
        window.alert("You can not change the state of a schedule that is not finished yet.");
        return;
      }
      if(state !== "Active") {
        window.alert("You can only change the state to Active.");
        return;
      }
  
      //console.log(now.toISOString());
      console.log("room:");
      console.log(room);
      //let strMutation = '';
      if (room != "")
      {
        if(props.isedit ) {
          
          /*strMutation = `
          mutation {
            updateSchedule(
              input: {id: "${props.id}", content: {date_init: "${dateInit.toISOString()}", date_finish: "${dateFinish.toISOString()}", profileId: "${profileId}", created: "${created}", edited: "${now.toISOString()}", state: Finished, huddId: "${room}", NFTContract: "${NFT_CONTRACT_ADDRESS}", TokenID: ${nft}}}
            ) {
              document {
                id
              }
            }
          }
          `;
          console.log("strMutation:");
          console.log(strMutation)
          if(strMutation){*/
            try {
        
              //window.alert("You scheduled a session!");
              //const response = await executeQuery(strMutation);
                //if(response && response.data && response.data.updateSchedule && response.data.updateSchedule.document) {
                  /*const callSetSessionRes = await fetch("/api/callsetsession", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      tokenId: nft,
                      scheduleId: id,
                      state: 3,
                      // agrega aquí otros parámetros que necesites
                    }),
                  });
                  const callSetSessionData = await callSetSessionRes.json();
                  console.log("Respuesta de /api/callsetsession:", callSetSessionData);*/
                  
                /*} else {
                  console.error("Failed to create new schedule.");
                }*/
              await getInnerProfile();
              console.log("Profile update: ", innerProfile);
            } catch (err) {
              console.error(err);
              window.alert(err);
            }
          //}    
          props.close();
        }
      }  
    };

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
              { props.isedit && state == 'Active' ? 
                <Col lg="12">
                  <Button
                    className="btn btn-light m-t-20 btn-arrow"
                    onClick={() => {
                      updateRecordState();
                      props.close();
                    }}
                  >
                    <span>
                      Finished
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
 
export default AddSchedTherapist;
