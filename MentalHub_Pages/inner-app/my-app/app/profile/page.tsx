"use client"
import Head from "next/head";
import React, { useEffect, useRef, useState, useContext, use, useMemo } from "react";
import { AppContext } from "../../context/AppContext";
import { Row, Col, Container, Card, CardBody} from "reactstrap";
import Image from "next/image";
import { abi, NFT_CONTRACT_ADDRESS } from "../../constants/MembersAirdrop";
import FormConsultante  from "../../innerComp/formConsultante";
import TherapistRooms  from "../../innerComp/TherapistRooms";
import TherapistAvalSched  from "../../innerComp/TherapistAvalSched";
import Schedule from "@/innerComp/Schedule";
import SchedTherapist from "@/innerComp/SchedTherapist";

// thirdweb imports
import { 
  getContract, 
  readContract,
  prepareContractCall, 
  toWei,
  resolveMethod,
  sendTransaction } from "thirdweb";
import { useActiveWallet, useReadContract } from "thirdweb/react";
import {client as clientThridweb} from "../../innerComp/client";
import { myChain } from "../../innerComp/myChain";
import { set } from "react-datepicker/dist/date_utils";


export default function Profile() {
  const [userName, setUserName] = useState("");
  const [pfp, setPfp] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState<boolean | undefined>(undefined);

  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  const { innerProfile, activeWallet,account, adminWallet, adminAccount, getInnerProfile, executeQuery, isConComposeDB } = context;
  

  // incializacion del contrato
const contract =   getContract({
      client: clientThridweb!,
      chain: myChain,
      address: NFT_CONTRACT_ADDRESS,
      // The ABI for the contract is defined here
      abi: abi as [],
    });


// Efecto para manejar la conexion inicial
  useEffect(() => {
    const initializeProfile = async () => {
      setLoading(true);
      try {
        if (account && isConComposeDB) {
          await getInnerProfile();
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing profile:", error);
      } 
    };

    initializeProfile();
  }, [account, isConComposeDB]);

  // Efecto para actualizar UI cuando cambia el perfil
  
   // Separar la lógica de verificación de nuevo usuario
  useEffect(() => {
    // Solo actualizar isNewUser cuando no está cargando
    if ( !loading && innerProfile !== undefined) {
      // Si innerProfile es null, es un usuario nuevo
      setIsNewUser(innerProfile === null);
    }
    if (innerProfile) {
      renderUserName();
      renderUrlProfilePicture();
    }
    },[innerProfile, loading]);


    //let NFTItemsInfo: any[] = [];
    const [NFTItemsInfo, setNFTItemsInfo] = useState<any[]>([]);

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
          for (const TkId of ArrTokenIds) {
            try {
                      
          readContract({
            contract: contract,
            method: "function gatewayURI(uint256 tokenId) view returns (string)",
            params: [TkId],
          }).then((urlGateway) => {
            
            console.log("urlGateway:", urlGateway);
            if (typeof urlGateway === "string" && urlGateway) {
              fetch(urlGateway)
                .then(response => response.json())
                .then(validNFTs => {
                  console.log(validNFTs);
                  setNFTItemsInfo(prevNFTs => [...prevNFTs, validNFTs]);
                })
                .catch(err => console.error(err));
            }
          });
            //const urlGateway = await nftContract.gatewayURI(TkId);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }

  }, [ArrTokenIds]);
  
  useEffect(() => {
    console.log("NFTItemsInfo:");
    console.log(NFTItemsInfo);
    NFTItemsInfo.forEach(itemNFT => {
      console.log(itemNFT.name);
      const row = document.getElementById('NFTList');
      const col = document.createElement('div');
      const str = `<div md="4" id="`+itemNFT.name+`" style="padding:10px;">
        <Card className="card-shadow" key={index}>              
          <div className='player-wrapper'>
            <video controls
                src="`+itemNFT.pathImage+`"
                width='300'
                height='300'
                >
            </video>
          </div>
          <CardBody>
            <h5 className="font-medium m-b-0">
              `+itemNFT.name+`
            </h5>
            <p className="m-b-0 font-14">Sessions:`+itemNFT.contSessions+`</p> 
          </CardBody>
        </Card>
      </Col>`;
      col.innerHTML = str;
      const element =  document.getElementById(itemNFT.name);
      console.log(element);
      if (!element)
      {
        if (row != null){
          row.appendChild(col);
        }
      }
    });
  }, [NFTItemsInfo]);

 

  const renderUrlProfilePicture = () => {
    if(innerProfile != undefined){
      if(innerProfile.pfp != undefined) {
        console.log(innerProfile.pfp);
          if(innerProfile.pfp.startsWith('https')) {
            setPfp(innerProfile.pfp);
      } else {
        setPfp("/profile.png");
      }
    } else {
      setPfp("/profile.png");
    }
  } else {
    setPfp("/profile.png");
    }
  }

  // render UserName    
  const renderUserName = () => {
    console.log("innerProfile object_1");
    console.log(innerProfile);
    if (innerProfile != undefined){
      console.log("Data on ceramic");
      console.log(innerProfile);
      if(innerProfile.name != undefined) {
        setUserName(innerProfile.name + " - " + innerProfile.rol + " - " + account?.address);
      } /*else if(userInfo != undefined) {
        console.log("userInfo:");
        console.log(userInfo);
        if(userInfo.name != undefined){
          setUserName(userInfo.name + " - " + innerProfile.rol + " - " + AddressWeb3);
          console.log("profileImage:");
          console.log(userInfo.profileImage);
          updateProfile(userInfo.name,innerProfile.rol,userInfo.profileImage);
        }
      }*/
    }

  }

  return (
      <div>
        <Head>
          <title>Mental Hub | A platform to help you with the mental health care</title>
          <meta
            name="Mental Hub"
            content="A platform to help you with the mental health care"
          />
        </Head>
        <div className="static-slider-head-profile banner2">
          <Container>
            <Row className="testi3 m-t-40 justify-content-left">
              <Col lg="4" md="1">
                <Card className="card-shadow">
                  <CardBody>
                    <div className="d-flex no-block align-items-center">
                      <span className="thumb-img">
                      <Image src={/*"/profile.png"*/pfp} alt="wrapkit" className="circle" width="100" height="100" />
                      </span>
                    </div>
                    <div className="m-l-20">
                      <h6 className="m-b-0 customer">{userName}</h6>
                    </div>
                    <div className="m-l-20">
                      {/* solo mostrar FormConsultante cuando isNewUser esté definido */}                       
                      <FormConsultante isForced={isNewUser === true} />
                      <TherapistRooms />
                      <TherapistAvalSched />
                      <Schedule />
                      <SchedTherapist />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>    
        <div >
        <Container>
        <Row className="justify-content-left">
            <Col md="7" className="text-left">
              <h2 className="title">My NTFs</h2>
            </Col>
        </Row>
        <Row id="NFTList" className="m-t-40 justify-content-center">

        </Row>
        </Container>
      </div>
      </div>
    );
  }

