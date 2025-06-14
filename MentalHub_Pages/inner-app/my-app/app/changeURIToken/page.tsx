/*"use client"
import React, { useEffect, useState, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, Label, Input, Button } from "reactstrap";
import { AppContext } from "../../context/AppContext";
import { abi, NFT_CONTRACT_ADDRESS } from "../../constants/MembersAirdrop";
import { 
  getContract, 
  prepareContractCall, 
  resolveMethod,
  sendTransaction 
} from "thirdweb";
import { useAdminWallet, useReadContract } from "thirdweb/react";
import { owner } from "thirdweb/extensions/common";
import { client as clientThridweb } from "../../innerComp/client";
import { myChain } from "../../innerComp/myChain";


export default function Home() {

  // Estados locales
  const [baseURI, setBaseURI] = useState("");
  const [gatewayURI, setGatewayURI] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);


  // Obtener contexto global
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }

  // Hooks de ThirdWeb
  const adminWallet = useAdminWallet();
  const adminAccount = adminWallet ? adminWallet.getAccount() : null;

  // Inicializar contrato
  const contract = getContract({
    client: clientThridweb!,
    chain: myChain,
    address: NFT_CONTRACT_ADDRESS,
    abi: abi as [],
  });

  useEffect(() => {
    
      if (adminAccount) {
        getOwner();
      }
    }, [adminAccount]);

  // Verificar si es el owner 
  const getOwner = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // No need for the Signer here, as we are only reading state from the blockchain
  
        console.log("contract publicMint:");
        console.log(contract);
  
        const _owner = await owner({
          contract,
        });
        console.log("result _owner:");
        console.log(_owner);
        if(adminWallet) {
          const adminAddress = adminAccount?.address || "";
          console.log("Admin Address (EOA):", adminAddress);
          if (adminAddress.toLowerCase() == _owner.toLowerCase()) {
            setIsOwner(true);        
          }
          console.log("Admin Addres from smart wallet:");
          console.log(adminAddress);
          console.log("is owner");
          console.log(isOwner);
        }
  
        
      } catch (err:any) {
        console.error(err.message);
      }
    }; 


  const handleSetBaseURI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminWallet || !isOwner) {
      window.alert("Solo el owner puede cambiar el URI base");
      return;
    }

    try {
      setLoading(true);

      const tx = prepareContractCall({
        contract,
        method: resolveMethod("setbaseTokenURI"),
        params: [baseURI],
      });

      const { transactionHash } = await sendTransaction({
        account: adminAccount!,
        transaction: tx,
      });

      console.log("Base URI actualizado. Hash:", transactionHash);
      window.alert("Base URI actualizado exitosamente!");
      setBaseURI("");

    } catch (error) {
      console.error("Error al actualizar base URI:", error);
      window.alert("Error al actualizar el base URI");
    } finally {
      setLoading(false);
    }
  };

  const handleSetGatewayURI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminWallet || !isOwner) {
      window.alert("Solo el owner puede cambiar el URI del gateway");
      return;
    }

    try {
      setLoading(true);

      const tx = prepareContractCall({
        contract,
        method: resolveMethod("setgatewayTokenURI"),
        params: [gatewayURI],
      });

      const { transactionHash } = await sendTransaction({
        account: adminAccount!,
        transaction: tx,
      });

      console.log("Gateway URI actualizado. Hash:", transactionHash);
      window.alert("Gateway URI actualizado exitosamente!");
      setGatewayURI("");

    } catch (error) {
      console.error("Error al actualizar gateway URI:", error);
      window.alert("Error al actualizar el gateway URI");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6}>
          <h3>Cambiar Base URI</h3>
          <Form onSubmit={handleSetBaseURI}>
            <FormGroup>
              <Label for="baseURI">Nuevo Base URI</Label>
              <Input
                type="text"
                id="baseURI"
                value={baseURI}
                onChange={(e) => setBaseURI(e.target.value)}
                placeholder="Ingrese el nuevo Base URI"
                required
              />
            </FormGroup>
            <Button 
              color="primary" 
              type="submit" 
              disabled={loading || !baseURI}
            >
              {loading ? "Procesando..." : "Actualizar Base URI"}
            </Button>
          </Form>
        </Col>

        <Col md={6}>
          <h3>Cambiar Gateway URI</h3>
          <Form onSubmit={handleSetGatewayURI}>
            <FormGroup>
              <Label for="gatewayURI">Nuevo Gateway URI</Label>
              <Input
                type="text"
                id="gatewayURI"
                value={gatewayURI}
                onChange={(e) => setGatewayURI(e.target.value)}
                placeholder="Ingrese el nuevo Gateway URI"
                required
              />
            </FormGroup>
            <Button 
              color="primary" 
              type="submit" 
              disabled={loading || !gatewayURI}
            >
              {loading ? "Procesando..." : "Actualizar Gateway URI"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

*/
/*
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

import { useEffect, useRef, useState, useContext } from "react";
import { NFT_CONTRACT_ADDRESS, abi } from "../../constants/MembersAirdrop";

export default function Home() {
  
  const [baseTokenURI, setbaseTokenURI] = useState("");
  const [gatewayTokenURI, setgatewayTokenURI] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  const { provider, isConnected } = useContext(AppContext)!;

  useEffect(() => {
    if(isConnected){
      checkIsOwner();
    }
  }, [isConnected]);

  useEffect(() => {
    if(isOwner){
      renderButton();
    }
  },[isOwner]);

  const checkIsOwner = async () => {
    try {
      if(provider != null){
        const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
        const signer = await provider0.getSigner();
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider0);
        // call the owner function from the contract
        const _owner = await nftContract.owner();
        // We will get the signer now to extract the address of the currently connected MetaMask account
        //const signer = await getProviderOrSigner(true);
        // Get the address associated to the signer which is connected to  MetaMask
        const address = await signer.getAddress();
        if (address.toLowerCase() === _owner.toLowerCase()) {
          setIsOwner(true);
        } else {
          window.alert("This wallet does not own the contract.");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addsetbaseTokenURI = async () => {
    try {
      if(provider != null){
        const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
        const signer = await provider0.getSigner();
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
        console.log(baseTokenURI);
        const tx = await nftContract.setbaseTokenURI(baseTokenURI);
        await tx.wait();
        const _baseTokenURI = await nftContract.tokenURI(2);
        console.log(_baseTokenURI);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const addsetgatewayTokenURI = async () => {
    try {
      if(provider != null) {
        const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
        const signer = await provider0.getSigner();
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
        console.log(gatewayTokenURI);
        const tx = await nftContract.setgatewayTokenURI(gatewayTokenURI);
        await tx.wait();
        const _gatewayTokenURI = await nftContract.gatewayURI(2);
        console.log(_gatewayTokenURI);
      }

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
              {isOwner ? renderButton():""}
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
*/