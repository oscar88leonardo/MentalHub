import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import Link from "next/link";
import { Row, Col, Container, Card, CardBody, NavLink } from "reactstrap";
import Image from "next/image";
//import bannerimg from "../assets/images/landingpage/banner-img.png";
import bannerimg from "../public/mhm-web-banner.png";
import img0 from "../assets/images/testimonial/1.jpg";
import img1 from "../assets/images/portfolio/img1.jpg";
import img2 from "../assets/images/portfolio/img2.jpg";
import img3 from "../assets/images/portfolio/img3.jpg";
import img4 from "../assets/images/portfolio/img4.jpg";
import img5 from "../assets/images/portfolio/img5.jpg";
import img6 from "../assets/images/portfolio/img6.jpg";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants/MembersAirdrop";

export default function Profile() {

  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  const  NFTItemsInfo = [];

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 599) {
      window.alert("Change network to Metis Goerli TestNet");
      throw new Error("Change network to Metis Goerli TestNet");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      if(typeof window !== 'undefined'){
           window.localStorage.setItem("IsConnectWallet",true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNFTsOwner = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the MentalHub NFT
      let ArrTokenIds = await nftContract.walletOfOwner(signer.getAddress()); 
      console.log(ArrTokenIds.length);
      for (const TkId of ArrTokenIds) {
        try {
          const response = await fetch(
            'http://localhost:3000/api/'+ TkId.toNumber()
          );
          const todo = await response.json(); 
          console.log(todo);
          const jsonContent = JSON.parse(todo);
          NFTItemsInfo.push(jsonContent);
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

 useEffect(() => {
  if (typeof window !== "undefined") {
    web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        //disableInjectedProvider: false,
        cacheProvider: true,
      });
    getNFTsOwner();
  }
  }, []);

 useEffect(() => {
    //getNFTsOwner();
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        //disableInjectedProvider: false,
        cacheProvider: true,
      });
      
      connectWallet();
    }
  }, [walletConnected]);
  
  
  
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
                    <h6 className="m-b-0 customer">Michelle Anderson</h6>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="spacer">
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

