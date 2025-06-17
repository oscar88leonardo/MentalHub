import React, { Fragment, useState, useCallback, useMemo, useContext, useEffect, SetStateAction, Dispatch } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar';
//import events from './events'
import { AppContext } from "../context/AppContext";
import AddSchedule from '../innerComp/AddSchedule';

// Imports para interacción con smart contract
import { abi, NFT_CONTRACT_ADDRESS } from "../constants/MembersAirdrop";

import { 
  getContract, 
  readContract,
  prepareContractCall, 
  toWei,
  resolveMethod,
  sendTransaction } from "thirdweb";
import { useActiveWallet, useAdminWallet, useReadContract } from "thirdweb/react";
import { owner } from "thirdweb/extensions/common";
import {client as clientThridweb} from "./client";
import { myChain } from "./myChain";

// Define the props for the CalendarSchedule component
interface CalendarScheduleProps {
  therapist: string | null | undefined;
  setTherapist: Dispatch<SetStateAction<string>>;
  localizer: DateLocalizer;
}

interface SchedTherap {
  node: {
    id: string;
    date_init: string;
    date_finish: string;
    state: string;
  }
}

interface TherapistNode {
  sched_therap?: {
    edges?: SchedTherap[]
  }
}

interface TherapistInfo {
  data?: {
    nodes?: TherapistNode[]
  }
}

interface BgEvent {
  id: string;
  start: Date;
  end: Date;
  state: string;
}

interface Event {
  id: string;
  start: Date;
  end: Date;
  state: string;
  huddId: string;
  roomId: string;
  profileId: string;
}

interface handleSelectSlotInterface {
  start: Date;
  end: Date;
}

// Define the NFTSession interface
interface NFTSession {
  tokenId: number;
  availableSessions: number;
}


export default function CalendarSchedule({ therapist, setTherapist, localizer }: CalendarScheduleProps) {
  const [myEvents, setEvents] = useState<Event[]>([]);
  const [availTEvents, setAvailTEvents] = useState<BgEvent[]>([]);
  const [therapistInfo, setTherapistInfo] = useState<TherapistInfo | null>(null);
  const [modalAddScheduleisOpen, setModalAddScheduleisOpen] = useState(false);
  const [modalAddScheduleisEdit, setModalAddScheduleisEdit] = useState(false);
  const [modalAddScheduleState, setModalAddScheduleState] = useState("");
  const [modalAddScheduleHuddId, setModalAddScheduleHuddId] = useState("");
  const [modalAddScheduleRoomId, setModalAddScheduleRoomId] = useState("");
  const [modalAddScheduleID, setModalAddScheduleID] = useState("");
  const [modalAddScheduleDateInit, setModalAddScheduleDateInit] = useState(new Date());
  const [modalAddScheduleDateFinish, setModalAddScheduleDateFinish] = useState(new Date());
  const [dateInit, setDateInit] = useState<Date>(new Date());
  const [dateFinish, setDateFinish] = useState<Date>(new Date());
  const [flagValidateDate, setFlagValidateDate] = useState(false);

  // estados para validación de NFT
  const [userNFTs, setUserNFTs] = useState<NFTSession[]>([]);
  //const [hasValidNFT, setHasValidNFT] = useState(false);
  
  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  
  const { innerProfile, activeWallet,account, adminWallet, adminAccount, getInnerProfile, executeQuery, isConComposeDB } = context;
    
  const contract = getContract({
      client: clientThridweb!,
      chain: myChain,
      address: NFT_CONTRACT_ADDRESS,
      // The ABI for the contract is defined here
      abi: abi as [],
    });

  // call the contract method walletofOwner 
  const { data: ArrTokenIds, isLoading: isCheckingArrTokenIds } = useReadContract({
    contract,
    method: "walletOfOwner",
    params: [account?.address || ""],
  });

  useEffect(() => {
      if (ArrTokenIds !== undefined) {
        console.log("isArrTokenIds:");
        console.log(isCheckingArrTokenIds);
  
          if (ArrTokenIds && Array.isArray(ArrTokenIds)) {
            console.log(ArrTokenIds.length); 
            // Limpiar el array de NFTs antes de agregar nuevos
            setUserNFTs([]);

            for (const TkId of ArrTokenIds) {
              try {
                        
            readContract({
                contract: contract,
                method: "function getAvailableSessions(uint256 _tokenId) public view returns (uint256)",
                params: [TkId],
              }).then((availSesh) => {
                
                //console.log("Token ID:", TkId);
                //console.log("Available Sessions:", availSesh);
                // Agregar el nuevo NFT al estado
                setUserNFTs(prevNFTs => [...prevNFTs, {
                    tokenId: Number(TkId),
                    availableSessions: Number(availSesh)
                }]);           
              });

            } catch (err) {
              console.log("error obteniendo sesiones disponibles para el token ID:", TkId);
              console.error(err);
            }
          }
        }
      }
  
    }, [ArrTokenIds]);

  useEffect(() => {console.log("User NFTs and Sesh", userNFTs)}, [userNFTs]);  


  useEffect(() => {
    if(therapist && therapist != "Select therapist"){
      console.log(therapist);
      getTherapistInfo();
    }
  },[therapist]);

  useEffect(() => {
    if(therapistInfo){
      if(therapistInfo.data){
        if(therapistInfo.data.nodes){
          let Bgevents = [];
          console.log('therapistInfo.data.nodes:');
          console.log(therapistInfo.data.nodes);
          for(const node of therapistInfo.data.nodes) {
            if(node.sched_therap){
              if(node.sched_therap.edges){
                for(const sched of node.sched_therap.edges) {
                  const init = new Date(sched.node.date_init);
                  const finish = new Date(sched.node.date_finish);
                  const obj = { 
                    id: sched.node.id,
                    start: init,
                    end: finish,
                    state: sched.node.state,
                  }
                  Bgevents.push(obj);
                }
              }
            }
          }
          console.log('Bgevents:');
          console.log(Bgevents);
          setAvailTEvents(Bgevents);
        }
      }
    }
  },[therapistInfo]);

  const getTherapistInfo = async () => {
    const strQuery = `
      query {
          nodes(ids: "` + therapist + `") {
            ... on InnerverProfile {
              id
              sched_therap(filters: {where: {state: {in: Active}}}, last: 100) {
                edges {
                  node {
                    date_finish
                    date_init
                    id
                    state
                  }
                }
              }
              hudds(last: 100, filters: {where: {state: {in: Active}}}) {
                edges {
                  node {
                    id
                    name
                    roomId
                    profile {
                      name
                    }
                  }
                }
              }
            }
          }
        }
    `;
    if(strQuery){
      const query = await executeQuery(strQuery);
      if (!query.errors) {
        console.log('query:');
        console.log(query);
        setTherapistInfo(query);
      }
    }
  }

  useEffect(() => {
    if(innerProfile) { 
      if(innerProfile.schedules != undefined){
        if(innerProfile.schedules.edges != undefined) {
          let events = [];
          for(const sched of innerProfile.schedules.edges) {
            if(sched.node != undefined){
              console.log('sched.node.date_init:');
              console.log(sched.node.date_init);
              const init = new Date(sched.node.date_init);
              const finish = new Date(sched.node.date_finish);
              const roomId = "";
              const obj = { 
                id: sched.node.id,
                start: init,
                end: finish,
                state: sched.node.state,
                huddId: sched.node.huddId,
                roomId: sched.node.hudd.roomId,
                profileId: sched.node.hudd.profileId,
              }
              events.push(obj);
            }
          }
          console.log('events:');
          console.log(events);
          setEvents(events);
        }
      }
    }
  },[innerProfile]);
  
  useEffect(() => {
    if(flagValidateDate){
      console.log('Fecha inicio seleccionada:', dateInit);
      console.log('Fecha fin seleccionada:', dateFinish);

      let validAvailEvent = availTEvents.some(({start, end}) => {
        return dateInit >= start && dateInit <= end && dateFinish >= start && dateFinish <= end;
      });

      // Nueva logica para validar superposición de eventos
      let validMyEvent = myEvents.some(({start, end}) => {
        //verifica si hay superposicion real, excluyendo los casos donde solo coinciden los limites
        return (dateInit < end && dateFinish > start) &&
               !(dateInit.getTime() === end.getTime() || dateFinish.getTime() === start.getTime());
        // logica previa
        //return (dateInit >= start && dateInit <= end) || (dateFinish >= start && dateFinish <= end);
      });

      console.log('Evento disponible:', validAvailEvent);
      console.log('Conflicto con evento existente:', validMyEvent);

      if(validAvailEvent && !validMyEvent) {
        openModalAddScheduleCreate(dateInit,dateFinish);
      } else {
        alert('Please, Select an available date.');
      }
      setFlagValidateDate(false);
    }
  },[flagValidateDate]);

  const handleSelectSlot = useCallback(    
    async ({ start, end}:handleSelectSlotInterface) => {
      // verificar si hay terapeuta seleccionado
      if (!therapist || therapist === "" || therapist ===  "Select therapist") {
        alert('Please, select a therapist before schedule a date');
        return;
      }    
      // Verificar si tiene NFTS con sesiones disponibles
      const hasValidNFT = userNFTs.some(nft => nft.availableSessions > 0);
      if (!hasValidNFT) {
        alert('you do not have any valid NFT, please get one before schedule a date');
        return;
      }
      setDateInit(start);
      setDateFinish(end);
      setFlagValidateDate(true);
    },
    [setEvents, therapist]
  )

  const handleSelectEvent = useCallback(
    (event:any) => {
      console.log("event:");
      console.log(event);
      if(!event.isBackgroundEvent){
        if(!therapistInfo){
          console.log("therapistInfo:");
          console.log(therapistInfo);
          setTherapist(event.profileId);
          setTimeout(() => {
            // Código a ejecutar cuando el modal se abre
            openModalAddScheduleEdit(event.state,event.id,event.start,event.end,event.huddId,event.roomId);
          }, 0);
        } else {
          openModalAddScheduleEdit(event.state,event.id,event.start,event.end,event.huddId,event.roomId);
        }
      }
    },  
    []
  );

  const { defaultDate, scrollToTime, minTime, maxTime } = useMemo(
    () => {
      const min = new Date();
      min.setHours(6, 0, 0, 0);
      
      const max = new Date();
      max.setHours(20, 0, 0, 0);

      return {
        defaultDate: new Date(),
        scrollToTime: new Date(1970, 1, 1, 6),
        minTime: min,
        maxTime: max
      }
    },
    []
  )
  // Check if an event is within a background event
  const isEventWithinBackgroundEvent = (event: Event, bgEvent: BgEvent) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const bgStart = new Date(bgEvent.start);
    const bgEnd = new Date(bgEvent.end);

    return eventStart >= bgStart && eventEnd <= bgEnd;
  }

  //Modify the events before rendering the calendar
  const filteredEvents = useMemo(() => {
    if (!therapist || !myEvents || !availTEvents) return [];
    
    return myEvents.filter(event =>
      availTEvents.some(bgEvent => 
        isEventWithinBackgroundEvent(event, bgEvent))
    );
  }, [myEvents, availTEvents, therapist]); 


  const openModalAddScheduleCreate = (dateInit:Date,dateFinish:Date) => {
    if (!therapist || therapist === "" || therapist === "Select therapist") {
      alert('Please, select a therapist before schedule a date');
      return;
    }  

    setModalAddScheduleisEdit(false);
    setModalAddScheduleState("");
    setModalAddScheduleID("");
    setModalAddScheduleDateInit(dateInit);
    setModalAddScheduleDateFinish(dateFinish);
    setModalAddScheduleisOpen(true);
  };

  const openModalAddScheduleEdit = (state:string,id:string,dateInit:Date,dateFinish:Date,huddId:string,roomId:string) => {
    setModalAddScheduleisEdit(true);
    setModalAddScheduleState(state);
    setModalAddScheduleHuddId(huddId);
    setModalAddScheduleRoomId(roomId);
    setModalAddScheduleID(id);
    setModalAddScheduleDateInit(dateInit);
    setModalAddScheduleDateFinish(dateFinish);
    setModalAddScheduleisOpen(true);
  };

  useEffect(() => {
    if(!modalAddScheduleisOpen){
      setModalAddScheduleID("");
      setModalAddScheduleDateInit(new Date());
      setModalAddScheduleDateFinish(new Date());
      setModalAddScheduleState("");
      setModalAddScheduleHuddId("");
      setModalAddScheduleisEdit(false);
    } else {
      console.log("openModalAddScheduleCreate therapist:");
      console.log(therapist);
      if(therapist){
        setTherapist(therapist);
      } else {
        setModalAddScheduleisOpen(false);
        alert('Select Therapist');
      }
    }
  },[modalAddScheduleisOpen]);
  
  return (
    <Fragment>
      <AddSchedule show={modalAddScheduleisOpen} close={() => setModalAddScheduleisOpen(false)} isedit={modalAddScheduleisEdit} huddId={modalAddScheduleHuddId} roomId={modalAddScheduleRoomId} state={modalAddScheduleState} id={modalAddScheduleID} dateInit={modalAddScheduleDateInit} dateFinish={modalAddScheduleDateFinish} therapistInfo={therapistInfo}/>
      {!therapist && (
        <div className="alert alert-info m-b-20">
          Please, select a therapist to check his/her availability.
        </div>
      )
      }
      <div style={{height:600}}>
        <Calendar
          defaultDate={defaultDate}
          defaultView={Views.MONTH}
          events={filteredEvents} // use filteredEvents instead of myEvents
          backgroundEvents={availTEvents}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={!!therapist} // solo permitir selección si hay un terapeuta seleccionado
          scrollToTime={scrollToTime}
          min={minTime}
          max={maxTime}
        />
      </div>
    </Fragment>
  )
}

CalendarSchedule.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
