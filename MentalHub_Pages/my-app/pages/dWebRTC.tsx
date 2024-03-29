import React, { useRef, useState, useEffect, useContext } from "react";
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

  const { joinLobby, leaveLobby, isLoading, isLobbyJoined, error } = useLobby();


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


  const finitProject = async () => {
    axios.post('/api/getprojectId')
      .then((response) => {
        setProjectId(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));

  }

  const fcreateRoom = async () => {
    axios.post('/api/createRoom')
      .then((response) => {
        setRoomId(response.data.roomId);
        console.log('roomId:');
        console.log(roomId);
      })
      .catch((error) => console.error("Error fetching data:", error));

  }

  useEffect(() => {
    if(projectId) {
      console.log('projectId:');
      console.log(projectId);
      initialize(projectId);
    }
    }, [projectId]);

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
                    finitProject();
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

                <Button disabled={!joinRoom.isCallable} onClick={joinRoom}>
                  JOIN_ROOM
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

              </Col>
              <Col md="6" className="align-self-center ">
                <input
                  type="text"
                  placeholder="Your Room Id"
                  value={displayNameText}
                  onChange={(e) => setDisplayNameText(e.target.value)}
                  className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none mr-2"
                />
                <Button
                  disabled={!setDisplayName.isCallable}
                  onClick={() => {
                    setDisplayName(displayNameText);
                  }}
                >
                  {`SET_DISPLAY_NAME ${displayNameError}`}
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
                  <h4 className="text-2xl">Room State</h4>
                  <h5 className="break-words">{JSON.stringify(state.value)}</h5>

                
                  <h4 className="text-3xl text-yellow-500 font-extrabold">Lobby</h4>
                  <h5 className="subtitle">Pj ID: {projectId}</h5>
                  <h5 className="subtitle">Room ID: {roomId}</h5>
            
                  <h4 className="text-2xl">Me Id</h4>
                  <div className="break-words">
                    {JSON.stringify(state.context.peerId)}
                  </div>
                  <h4 className="text-2xl">DisplayName</h4>
                  <div className="break-words">
                    {JSON.stringify(state.context.displayName)}
                  </div>
                  <h4 className="text-2xl">Recording Data</h4>
                  <div className="break-words">{JSON.stringify(recordingData)}</div>

                  <h4 className="text-2xl">Error</h4>
                  <div className="break-words text-red-500">
                    {JSON.stringify(state.context.error)}
                  </div>
                  <h4 className="text-2xl">Peers</h4>
                  <div className="break-words">{JSON.stringify(peers)}</div>
                  <h4 className="text-2xl">Consumers</h4>
                  <div className="break-words">
                    {JSON.stringify(state.context.consumers)}
                  </div>         
                  <Button
                    disabled={!state.matches("Initialized.JoinedLobby")}
                    onClick={() => send("LEAVE_LOBBY")}
                  >
                  LEAVE_LOBBY
                </Button>
              </Col>
            </Row>

            <Row className="=">
            <div>
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
                  {`START_RECORDING ${error}`}
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
            </Row>
          </Container>
        </div>
      </div>

      

    </div>
  );
};

export default App;
