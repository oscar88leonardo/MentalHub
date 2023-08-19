import React, { useRef, useState, useEffect, useContext} from "react";
import Head from "next/head";
import Image from "next/image";

import { AppContext } from "../context/AppContext";

import { useEventListener, useHuddle01 } from "@huddle01/react";
import { Audio, Video } from "@huddle01/react/components";
/* Uncomment to see the Xstate Inspector */
// import { Inspect } from '@huddle01/react/components';

import {
  useAudio,
  useLobby,
  useMeetingMachine,
  usePeers,
  useRoom,
  useVideo,
  useRecording,
} from "@huddle01/react/hooks";

import { useDisplayName } from "@huddle01/react/app-utils";

import Button from "../MentalComponents/Button";
import { Container, Row, Col } from "reactstrap";

import axios from 'axios';


const App = () => {
  // refs
  const videoRef = useRef<HTMLVideoElement>(null);

  const { state, send } = useMeetingMachine();

  const [roomId, setRoomId] = useState("");
  const [displayNameText, setDisplayNameText] = useState("Guest");
  const [projectId, setProjectId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  
  const { initialize } = useHuddle01();
  
  const { joinLobby,leaveLobby, isLoading, isLobbyJoined, error } = useLobby();
  

  const {
    fetchAudioStream,
    produceAudio,
    stopAudioStream,
    stopProducingAudio,
    stream: micStream,
  } = useAudio();
  const {
    fetchVideoStream,
    produceVideo,
    stopVideoStream,
    stopProducingVideo,
    stream: camStream,
  } = useVideo();
  const { joinRoom, leaveRoom } = useRoom();

  // Event Listner
  useEventListener("lobby:cam-on", () => {
    if (camStream && videoRef.current) videoRef.current.srcObject = camStream;
  });

  const { peers } = usePeers();

  const {
    startRecording,
    stopRecording,
    //error,
    data: recordingData,
  } = useRecording();

  const { setDisplayName, error: displayNameError } = useDisplayName();


  useEventListener("room:joined", () => {
    console.log("room:joined");
  });
  useEventListener("lobby:joined", () => {
    console.log("lobby:joined");
  });

  const PJID = process.env.PJID; 
  console.log('Pjid');
  console.log(PJID);

  useEffect(()=> {
    setProjectId("Kh1bnUNe70zLM69oWW5oc5d6VuVhv-HU");
    console.log('ProjectId');
    console.log(projectId);  
  })

  const fcreateRoom = async () => {
    axios.post('/api/createRoom')
                    .then((response) => {setRoomId(response.data.data.roomId);
                      console.log(roomId);})
                    .catch((error) => console.error("Error fetching data:",error)); 
  }


  return (    
    <div className="grid grid-cols-2">
      <div>
      <Head>
        <title>MentalHub | Communication</title>
        <meta name="description" content="dWebRTC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="static-slider10">
        <Container>
          <Row className="">
            <Col md="6" className="align-self-center ">
              <span className="label label-rounded label-inverse">
                dWebRTC
              </span>
              <h1 className="title">Web Communication</h1>
              <h4 className="subtitle">
                Audio/Video streaming and chat tests
              </h4>
              <Button
                disabled={!initialize.isCallable}
                onClick={() => {               
                  initialize(PJID);
                }}> INIT
              </Button>
              <Button
                onClick={() => {
                  fcreateRoom();                                           
                }}> SETUP_ROOM
              </Button>
              <Button
                disabled={!joinLobby.isCallable}
                onClick={() => {
                  joinLobby(roomId);
                }}
              >
                JOIN_LOBY
              </Button>

              <Button disabled={!leaveRoom.isCallable} onClick={leaveRoom}>
                LEAVE_LOBBY 
              </Button>

            </Col>
            <Col md="6" className="align-self-center ">
              <h4 className="subtitle">Room State</h4>
              <h6 className="subtitle break-words">{JSON.stringify(state.value)}</h6>
            </Col>
          </Row> 
      
          <Row className="">
          <Col md="6" className="align-self-center ">
            <div>
            <h6 className="subtitle op-12">
                Me Video:
              </h6>
            <video ref={videoRef} autoPlay muted></video>
            <div className="grid grid-cols-4">
              {Object.values(peers)
                .filter((peer) => peer.cam)
                .map((peer) => (
                  <>
                    role: {peer.role}
                    <Video
                      key={peer.peerId}
                      peerId={peer.peerId}
                      track={peer.cam}
                      debug
                    />
                  </>
                ))}
              {Object.values(peers)
                .filter((peer) => peer.mic)
                .map((peer) => (
                  <Audio key={peer.peerId} peerId={peer.peerId} track={peer.mic} />
                ))}
            </div>
            </div>
          </Col>
          <Col md="6" className="align-self-center">
          <div>
            <h4 className="subtitle">Me Id</h4>
            <div className="subtitle break-words">
              {JSON.stringify(state.context.peerId)}
            </div>
        
            <h4 className="subtitle">DisplayName</h4>
            <div className="subtitle break-words">
              {JSON.stringify(state.context.displayName)}
            </div>
        
            <h4 className="subtitle">Recording Data</h4>
            <div className="subtitle break-words">
              {JSON.stringify(recordingData)}
            </div>

            <h4 className="subtitle">Error</h4>
            <div className="break-words text-red-500">
              {JSON.stringify(state.context.error)}
            </div>

            <h4 className="subtitle">Peers</h4>
            <div className="subtitle break-words">
              {JSON.stringify(peers)}
            </div>

            <h4 className="subtitle">Consumers</h4>
            <div className="subtitle break-words">
              {JSON.stringify(state.context.consumers)}
            </div>  

          </div>          
          </Col>
          </Row>
        </Container>
      </div>
    </div>

      <div>       
        <br />
        <br />
        <h2 className="text-3xl text-yellow-500 font-extrabold">Lobby</h2>
        <h4 className="subtitle">Pj ID: {projectId}</h4>
        <h4 className="subtitle">Room ID: {roomId}</h4>
        <div className="flex gap-4 flex-wrap">
          <Button
            disabled={!setDisplayName.isCallable}
            onClick={() => {
              setDisplayName(displayNameText);
            }}
          >
            {`SET_DISPLAY_NAME error: ${displayNameError}`}
          </Button>
          <Button
            disabled={!fetchVideoStream.isCallable}
            onClick={fetchVideoStream}
          >
            FETCH_VIDEO_STREAM
          </Button>

          <Button
            disabled={!fetchAudioStream.isCallable}
            onClick={fetchAudioStream}
          >
            FETCH_AUDIO_STREAM
          </Button>

          <Button disabled={!joinRoom.isCallable} onClick={joinRoom}>
            JOIN_ROOM
          </Button>

          <Button
            disabled={!state.matches("Initialized.JoinedLobby")}
            onClick={() => send("LEAVE_LOBBY")}
          >
            LEAVE_LOBBY
          </Button>

          <Button
            disabled={!stopVideoStream.isCallable}
            onClick={stopVideoStream}
          >
            STOP_VIDEO_STREAM
          </Button>
          <Button
            disabled={!stopAudioStream.isCallable}
            onClick={stopAudioStream}
          >
            STOP_AUDIO_STREAM
          </Button>
        </div>
        <br />
        <h2 className="text-3xl text-green-600 font-extrabold">Room</h2>
        <div className="flex gap-4 flex-wrap">
          <Button
            disabled={!produceAudio.isCallable}
            onClick={() => produceAudio(micStream)}
          >
            PRODUCE_MIC
          </Button>

          <Button
            disabled={!produceVideo.isCallable}
            onClick={() => produceVideo(camStream)}
          >
            PRODUCE_CAM
          </Button>

          <Button
            disabled={!stopProducingAudio.isCallable}
            onClick={() => stopProducingAudio()}
          >
            STOP_PRODUCING_MIC
          </Button>

          <Button
            disabled={!stopProducingVideo.isCallable}
            onClick={() => stopProducingVideo()}
          >
            STOP_PRODUCING_CAM
          </Button>

          <Button
            disabled={!startRecording.isCallable}
            onClick={() =>
              startRecording(`${window.location.href}rec/${roomId}`)
            }
          >
            {`START_RECORDING error: ${error}`}
          </Button>
          <Button disabled={!stopRecording.isCallable} onClick={stopRecording}>
            STOP_RECORDING
          </Button>

          <Button disabled={!leaveRoom.isCallable} onClick={leaveRoom}>
            LEAVE_ROOM
          </Button>
        </div>

        {/* Uncomment to see the Xstate Inspector */}
        {/* <Inspect /> */}
      </div>
      
    </div>
  );
};

export default App;
