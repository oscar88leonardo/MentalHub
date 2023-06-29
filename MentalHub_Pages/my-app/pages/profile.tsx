import Head from "next/head";
import React, { useEffect, useRef, useState,useContext } from "react";
//import Web3Modal from "web3modal";
import {  Contract,providers } from "ethers";

import { AppContext } from "../context/AppContext";

import Link from "next/link";
import { Row, Col, Container, Card, CardBody, NavLink } from "reactstrap";
import Image from "next/image";
//import bannerimg from "../assets/images/landingpage/banner-img.png";
import bannerimg from "../public/mhm-web-banner.png";
import img0 from "../public/profile.png";
import img1 from "../assets/images/portfolio/img1.jpg";
import img2 from "../assets/images/portfolio/img2.jpg";
import img3 from "../assets/images/portfolio/img3.jpg";
import img4 from "../assets/images/portfolio/img4.jpg";
import img5 from "../assets/images/portfolio/img5.jpg";
import img6 from "../assets/images/portfolio/img6.jpg";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants/MembersAirdrop";
import { useViewerConnection } from "@self.id/react";
import { useViewerRecord } from "@self.id/react";
import { EthereumAuthProvider } from "@self.id/web";
import styles from '../styles/Home.module.css'
import ReactModal from 'react-modal';
//import FormConsultante  from "../MentalComponents/formConsultante";


function RecordSetter() {

  const [name, setName] = useState("");
  const [points, setPoints] = useState("");

  const record = useViewerRecord("basicProfile");
  console.log('record:');
  console.log(record);

  const updateRecordPoints = async (points) => {
    await record.merge({
      points: points,
    });
  };

  const updateRecordName = async (name) => {
    await record.merge({
      name: name,
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles.mt2}>
        {record.content ? (
          <div className={styles.flexCol}>
            <span className={styles.subtitle}>Hello {record.content.name}!</span>
            <span className={styles.subtitle}>You have {record.content.points}!</span>
  
            <span>
              The above name was loaded from Ceramic Network. Try updating it
              below.
            </span>
          </div>
        ) : (
          <span>
            You do not have a profile record attached to your 3ID. Create a basic
            profile by setting a name below.
          </span>
        )}
      </div>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.mt2}
      />
      <button onClick={() => updateRecordName(name)}>Update Name</button>
      <input
        type="text"
        placeholder="Points"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        className={styles.mt2}
      />      
      <button onClick={() => updateRecordPoints(points)}>Update Points</button>
      
    </div>
  );
}

export default function Profile() {

  const { provider, AddressWeb3, userInfo, getUserInfo, getAccounts } = useContext(AppContext);
  const [name, setName] = useState("");
  const [ceramicCon, connect, disconnect] = useViewerConnection();
  const record = useViewerRecord("basicProfile");
  const updateRecordName = async (name) => {
    await record.merge({
      name: name,
    });
  };

  const  NFTItemsInfo = [];

  const getNFTsOwner = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      //const signer = await getProviderOrSigner(true);
      const provider0 = new providers.Web3Provider(provider);
      const signer = provider0.getSigner();
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the MentalHub NFT
      let ArrTokenIds = await nftContract.walletOfOwner(signer.getAddress()); 
      console.log(ArrTokenIds.length);
      for (const TkId of ArrTokenIds) {
        try {
          /*const response = await fetch(
            'http://localhost:3000/api/'+ TkId.toNumber()
          );
          const todo = await response.json(); 
          console.log(todo);
          const jsonContent = JSON.parse(todo);*/
          const urlGateway = await nftContract.gatewayURI(TkId);
          const response = await fetch(
            urlGateway
          );
          const todo = await response.json(); 
          console.log(todo);
          //const jsonContent = JSON.parse(todo);
          NFTItemsInfo.push(todo);
        } catch (err) {
          console.error(err);
        }
      }
      for(const itemNFT of NFTItemsInfo) {
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
          row.appendChild(col);
        }
      }
      /*try {
        const res = await fetch(
          'http://localhost:3000/api/'+tokenIdsCurrent.toNumber()+'/'+name+' '+tokenIdsCurrent.toNumber()+'/'+pathTypeContDig+'/'+pathContDigi+'/'+contSessions
        );
        const data = await res.json();
        console.log(data);
      } catch (err) {
        console.log(err);
      }*/
    } catch (err) {
      console.error(err);
    }
  };

  const connectToSelfID = async () => {
    const ethereumAuthProvider = await getEthereumAuthProvider();
    connect(ethereumAuthProvider);
    console.log("ceramicCon:"+ceramicCon.status);
  };

  const getEthereumAuthProvider = async () => {
    const wrappedProvider = new providers.Web3Provider(provider);
    const signer = wrappedProvider.getSigner();
    
    //const wrappedProvider = await web3auth.provider;    
    //const signer = wrappedProvider.getSigner();
    const address = await signer.getAddress();
    return new EthereumAuthProvider(wrappedProvider.provider, address);
  };

 useEffect(() => {
  if (provider) {
    getNFTsOwner();
    getUserInfo();
    getAccounts();
    connectToSelfID();
  }
  }, [provider]);
  
  useEffect(() => {
    renderUserName();
    }, [ceramicCon.status]);
  
const renderUserName = () => {
  var userName = "";

  if (provider && AddressWeb3 && userInfo && ceramicCon.status == "connected") {
    console.log('record:');
    console.log(record);

    if(AddressWeb3 && userInfo){
      userName = AddressWeb3; 
      if(record.content) {
        if(record.content.name)
          userName = record.content.name + '\n' + userName;
      } else {
        if(userInfo.name != undefined) {
          updateRecordName(userInfo.name);
          userName = userInfo.name + '\n' + userName;
        }
      }
    }
  }
  return(
    userName
  );
}

  const renderNFTItems = (NFTitem, index) => {  
    console.log(NFTitem);
    console.log(NFTItemsInfo);
    return(   
      <Col md="4">
        <Card className="card-shadow" key={index}>              
        <div className='player-wrapper'>
          <video controls
              src={NFTitem.pathImage}
              width='300'
              height='300'
              >
          </video>
          </div>
          <CardBody>
            <h5 className="font-medium m-b-0">
              {NFTitem.name}
            </h5>
            <p className="m-b-0 font-14">Sessions:{NFTitem.contSessions}</p> 
          </CardBody>
        </Card>
        </Col>
        )  
  }

  const FormConsultante=()=> {
    const [modalisOpen, setIsOpen] = useState(false);
   
    return (
      <div>
        <button onClick={()=>setIsOpen(true)}>Open Modal</button>
        <ReactModal 
          isOpen={modalisOpen}
          onRequestClose={() => setIsOpen(false)}
          contentLabel="Example Modal"
        >
          This is the content of the modal.
        </ReactModal>
      </div>
    );
  };
  

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
                      <Image src={img0} alt="wrapkit" className="circle" />
                    </span>
                  </div>
                  <div className="m-l-20">
                    <h6 className="m-b-0 customer">{renderUserName()}</h6>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="spacer">
        <Container>
        <FormConsultante />
          <Row className="justify-content-left">
            <Col md="7" className="text-left">
              <h2 className="title">My NTFs</h2>
            </Col>
          </Row>
          {ceramicCon.status === "connected" ? (
    
            <div>
              <span className={styles.subtitle}>
                Your 3ID is {ceramicCon.selfID.id}
              </span>
              <RecordSetter />
            </div>
          ) : (
            <span className={styles.subtitle}>
              Connect with your wallet to access your 3ID
            </span>
          )}
          <Row id="NFTList" className="m-t-40 justify-content-center">
            
          </Row>
        </Container>
      </div>
    </div>
  );
}

