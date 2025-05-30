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
  prepareContractCall, 
  toWei,
  resolveMethod,
  sendTransaction } from "thirdweb";
import { useActiveWallet, useReadContract } from "thirdweb/react";
import {client as clientThridweb} from "../../innerComp/client";
import { myChain } from "../../innerComp/myChain";


export default function Profile() {
  const [userName, setUserName] = useState("");
  const [pfp, setPfp] = useState("");
  const [loading, setLoading] = useState(true);

  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  const { innerProfile, activeWallet,account, adminWallet, adminAccount, getInnerProfile, executeQuery, isConComposeDB } = context;
  
// define thirdweb hook to use the active wallet and get the account
  //const activeWallet = useActiveWallet();
  //const account = activeWallet ? activeWallet.getAccount() : null;

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
        }
      } catch (error) {
        console.error("Error initializing profile:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, [account, isConComposeDB]);

  // Efecto para actualizar UI cuando cambia el perfil
  
    useEffect(() => {
      if (innerProfile) {
        renderUserName();
        renderUrlProfilePicture();
      }
      }, [innerProfile]);


      /*
  // Render condicional basado en el estado de carga
  if (loading) {
    return (
      <div className="loading-container">
        <h3>Loading profile...</h3>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="connect-wallet-message">
        <h3>Please connect your wallet to view your profile</h3>
      </div>
    );
  }    */

    let NFTItemsInfo: any[] = [];

    const getNFTsOwner = async () => {      
        // We need a Signer here since this is a 'write' transaction.
        //const signer = await getProviderOrSigner(true);
        /*const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
        const signer = await provider0.getSigner();*/
        // Create a new instance of the Contract with a Signer, which allows
        // update methods
        if(account != null) {
         try { 
          // Ensure signer is the correct type
          //const ethersSigner = signer as unknown as JsonRpcSigner;

          //const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, ethersSigner);
          


          // Get the address asynchronously
          const address = account?.address || "";
          
          // call the contract method walletofOwner 
          const { data: ArrTokenIds, isLoading: isCheckingArrTokenIds } = useReadContract({
            contract,
            method: "walletOfOwner",
            params: [address],
          });

          useEffect(() => {
            if (ArrTokenIds !== undefined) {
              console.log("isArrTokenIds:");
              console.log(isCheckingArrTokenIds);

                if (ArrTokenIds && Array.isArray(ArrTokenIds)) {
                  console.log(ArrTokenIds.length); 
                  for (const TkId of ArrTokenIds) {
                    try {
                    /*const response = await fetch(
                      'http://localhost:3000/api/'+ TkId.toNumber()
                    );
                    const todo = await response.json(); 
                    console.log(todo);
                    const jsonContent = JSON.parse(todo);*/
                  
                   // call the contract method gatewayURI 
                    const { data: urlGateway, isLoading: isurlGateway } = useReadContract({
                      contract,
                      method: "gatewayURI",
                      params: [TkId],
                    });
                    
                    useEffect(() => {
                      console.log("urlGateway:", urlGateway);
                      if (typeof urlGateway === "string" && urlGateway) {
                        fetch(urlGateway)
                          .then(response => response.json())
                          .then(todo => {
                            console.log(todo);
                            //const jsonContent = JSON.parse(todo);
                            NFTItemsInfo.push(todo);
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
                                if (row != null){
                                  row.appendChild(col);
                                }
                              }
                            }
                          })
                          .catch(err => console.error(err));
                      }
                    }, [urlGateway]);
                    //const urlGateway = await nftContract.gatewayURI(TkId);
                  } catch (err) {
                    console.error(err);
                  }
                }
              }
            }

          }, [ArrTokenIds]);
          
          //let ArrTokenIds = await nftContract.walletOfOwner(address); 
         
      
        } catch (error) {
          console.error("Error interacting with NFT contract:", error);
          }    
      }
      
    };
  
    const renderNFTItems = (NFTitem: { pathImage: string | undefined; name: string | null | undefined; contSessions: number | bigint | null | undefined; }, index: number | null | undefined) => {  
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

  const updateProfile = async (name: string | undefined | null,rol: string | undefined | null,pfp: string | undefined | null) => {

    const strMutation = `
    mutation {
      setInnerverProfile(input: {
        content: {
          name: "${name}"
          displayName: "${name}"
          rol: ${rol}
          pfp: ${pfp}
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
    

  }



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
                      <FormConsultante />
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

