"use client"
import Head from "next/head";
import React, { useEffect, useRef, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Row, Col, Container, Card, CardBody} from "reactstrap";
import Image from "next/image";
import img0 from "../public/profile.png";
import {  Contract } from "ethers";
import { BrowserProvider } from "ethers/providers";
import { abi, NFT_CONTRACT_ADDRESS } from "../../constants/MembersAirdrop";
import FormConsultante  from "../../innerComp/formConsultante";


export default function Profile() {
  const [userName, setUserName] = useState("");
  // get global data from Appcontext
  const { provider, innerProfile, getInnerProfile, executeQuery, isConnected, isConComposeDB, AddressWeb3, userInfo, getUserInfo, getAccounts } = useContext(AppContext);
  
  // when a changue in orbis provider is detected
  useEffect(() => {
    if (isConComposeDB) {
      getAccounts();
      getNFTsOwner();
      getInnerProfile();
      getUserInfo();
      //renderUserName();
    }
    }, [isConComposeDB]);
  
    useEffect(() => {
      if (innerProfile != undefined) {
        renderUserName();
      }
      }, [innerProfile]);

    const NFTItemsInfo = [];

    const getNFTsOwner = async () => {
      try {
        // We need a Signer here since this is a 'write' transaction.
        //const signer = await getProviderOrSigner(true);
        const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
        const signer = await provider0.getSigner();
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

  const updateProfile = async (name,rol) => {

    const strMutation = `
    mutation {
      createInnerverProfile(input: {
        content: {
          name: "${name}"
          displayName: "${name}"
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
    console.log(strMutation);
    await executeQuery(strMutation);
    await getInnerProfile();
    /*console.log("composeClient:")
    console.log(composeClient)
    const isAuth = await composeClient.context.isAuthenticated();
    console.log("isAuth:")
    console.log(isAuth)*/
//    const update = await composeClient.executeQuery(strMutation);
    console.log("Profile update: ", innerProfile);
    
    /*const res = await orbis.updateProfile({
      username:username,
      pfp:pfp
    });*/
  }

  /*const renderUrlProfilePicture = () => {
    if(orbisProfile != undefined){
      if(orbisProfile.details != undefined){
        if(orbisProfile.details.profile != undefined){
          if(orbisProfile.details.profile.pfp != undefined) {
            console.log(orbisProfile.details.profile.pfp);
            return orbisProfile.details.profile.pfp;
          }
        }
      }
    }
  }*/

  // render UserName    
  const renderUserName = () => {
    console.log("innerProfile object_1");
    console.log(innerProfile);
    if (innerProfile != undefined){
      console.log("Data on ceramic");
      console.log(innerProfile);
      if(innerProfile.name != undefined) {
        setUserName(innerProfile.name + " - " + innerProfile.rol + " - " + AddressWeb3);
      } else if(userInfo != undefined) {
        console.log("userInfo:");
        console.log(userInfo);
        if(userInfo.name != undefined){
          setUserName(userInfo.name + " - " + innerProfile.rol + " - " + AddressWeb3);
          /*console.log("profileImage:");
          console.log(userInfo.profileImage);*/
          updateProfile(userInfo.name,innerProfile.rol);
        }
      }
    }
    /*if (provider && AddressWeb3 && userInfo) {
    
      if(AddressWeb3 && userInfo){
        userName = AddressWeb3; 
        if(userInfo.name != undefined) {
          userName = userInfo.name + '\n' + userName;
        }     
      }
    }*/
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
                      <Image src={"/profile.png"/*renderUrlProfilePicture()*/} alt="wrapkit" className="circle" width="100" height="100" />
                      </span>
                    </div>
                    <div className="m-l-20">
                      <h6 className="m-b-0 customer">{userName}</h6>
                    </div>
                    <div className="m-l-20">
                    <FormConsultante />
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

