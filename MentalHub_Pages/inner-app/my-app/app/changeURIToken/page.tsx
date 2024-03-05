"use client"
import Head from "next/head";
import { Row, Col, Container, Input } from "reactstrap";
import Image from "next/image";
import herobanner from "../../public/banner2.png";
import styles from "../styles/Home.module.css";
//import Web3Modal from "web3modal";
import { Contract } from "ethers";
import { BrowserProvider } from "ethers/providers";

import { AppContext } from "../../context/AppContext";

import { useEffect, useRef, useState,useContext } from "react";
import { NFT_CONTRACT_ADDRESS, abi } from "../../constants/MembersAirdrop";

export default function Home() {
  
  const [baseTokenURI, setbaseTokenURI] = useState(null);
  const [gatewayTokenURI, setgatewayTokenURI] = useState(null);

  const { provider,isConnected } = useContext(AppContext);

  useEffect(() => {
    if(isConnected){
      renderButton();
    }
  },[isConnected]);

  const addsetbaseTokenURI = async () => {
    try {
      const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider0);
      await nftContract.setbaseTokenURI(baseTokenURI);
      const _baseTokenURI = await nftContract._baseTokenURI;
      console.log(_baseTokenURI);
      
    } catch (err) {
      console.error(err);
    }
  };

  const addsetgatewayTokenURI = async () => {
    try {
      const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider0);
      await nftContract.setgatewayTokenURI(gatewayTokenURI);
      const _gatewayTokenURI = await nftContract._gatewayTokenURI;
      console.log(_gatewayTokenURI);
      
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = () => {
    if (isConnected) {
      return (<div>
                <Input type="text" placeholder="baseTokenURI" 
                    onChange={(e) => setbaseTokenURI(e.target.value)}
                    value={baseTokenURI}
                    />
                <a
                  className="btn btn-light btn-rounded btn-md m-t-20"
                  data-toggle="collapse"
                  href="#"
                  onClick={addsetbaseTokenURI}
                >
                  <span>Change base Token URI</span>
                </a>
                <Input type="text" placeholder="gatewayTokenURI" 
                    onChange={(e) => setgatewayTokenURI(e.target.value)}
                    value={gatewayTokenURI}
                    />
                <a
                className="btn btn-light btn-rounded btn-md m-t-20"
                data-toggle="collapse"
                href="#"
                onClick={addsetgatewayTokenURI}
              >
                <span>Change gateway Token URI</span>
              </a>
            </div>);
    } 
  };

  return (
    <div>
      <Head>
        <title>InnerVerse | Change URI Token</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="static-slider10">
        <Container>
          <Row className="">
            <Col md="6" className="align-self-center ">
              <span className="label label-rounded label-inverse">
              Change URI Token InnerVerse
              </span>
              <h1 className="title">Welcome to Change URI Token</h1>
              <h6 className="subtitle op-8">
                Update token metadata on deplyed smart contract.
              </h6>
              {renderButton()}
            </Col>
            <Col md="6">
              <Image src={herobanner} alt="herobanner"></Image>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
