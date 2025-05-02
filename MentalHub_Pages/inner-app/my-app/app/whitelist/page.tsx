"use client"
import Head from "next/head";
import { Row, Col, Container, Alert } from "reactstrap";
import Image from "next/image";
import herobanner from "../../public/banner2.png";

import { AppContext } from "../../context/AppContext";
import { useEffect, useState,useContext } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../../constants/whitelist";

import {client as clientThridweb} from "../../innerComp/client";
import { myChain } from "../../innerComp/myChain";
import { 
  getContract, 
  prepareContractCall, 
  resolveMethod,
  sendTransaction } from "thirdweb";
import { useActiveWallet, useReadContract } from "thirdweb/react";
import { waitForReceipt } from "thirdweb";

export default function Home() {
  
  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  
  //const { provider, signer, getSigner, isConComposeDB } = context;

  // joinedWhitelist keeps track of whether the current account has joined the Whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState<boolean>(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // numberOfWhitelisted tracks the number of addresses's whitelisted
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // define thirdweb hook to use the active wallet and get the account
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;


// Detect account
  useEffect(() => {
    if(account != null){
      console.log("account connected:");
      console.log(account);
      //checkIfAddressInWhitelist();
      //getNumberOfWhitelisted();
    }
  },[account]);

// create contract instance for the whitelist smartcontract
  const contract = getContract({
      client: clientThridweb!,
      chain: myChain,
      address: WHITELIST_CONTRACT_ADDRESS,
      // The ABI for the contract is defined here
      abi: abi as [],
    });
  
    const { data: isWhitelisted, isLoading: isCheckingWhitelist } = useReadContract({
      contract,
      method: "whitelistedAddresses",
      params: [account?.address || ""],
    });

    const { data: numberOfWhitelistedData, isLoading: isLoadingNumber } = useReadContract({
      contract,
      method: "numAddressesWhitelisted",
      params: [],
    });

    useEffect(() => {
      if (isWhitelisted !== undefined) {
        console.log("iswhitelisted?");
        console.log(isWhitelisted);
        setJoinedWhitelist(Boolean(isWhitelisted));
      }
    }, [isWhitelisted]);

    useEffect(() => {
      if (numberOfWhitelistedData !== undefined) {
        console.log("Número de whitelisteados:", numberOfWhitelistedData);
        setNumberOfWhitelisted(Number(numberOfWhitelistedData));
      }
    }, [numberOfWhitelistedData]);


  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addAddressToWhitelist = async () => {
      // Check if the user has connected their wallet    
      if (!activeWallet) {
        console.log("No hay wallet conectada");
        return;
      }
    
      try {
        setLoading(true);
        
        // Prepare tx using ThirdWeb
        const tx = await prepareContractCall({
          contract,
          method: resolveMethod("addAddressToWhitelist"),
          params: [],
        });
    
        // Execute the transaction
        const { transactionHash } = await sendTransaction({
          transaction: tx,
          account: account!,
        });
    
        console.log("Transaction Hash:", transactionHash);
        
        // wait for transaction to be mined 
        const receipt = await waitForReceipt({
          client: clientThridweb,
          chain: myChain,
          transactionHash: transactionHash,
        });
        console.log("Transaction Receipt:", receipt);
        
        setLoading(false);
        setJoinedWhitelist(true);
        
        // numberOfWhitelistedData will be updated automatically by the useReadContract hook
        
      } catch (error) {
        console.error("Error adding address to whitelist:", error);
        alert('Process failed, please check your funds.');
        setLoading(false);
      }       
  };

/*
    renderWhitelistCount based on the state of the dapp
  */
  
    const renderWhitelistCount = () => {
      if (isLoadingNumber) {
        return "...";
      }
      return numberOfWhitelisted;
    };  
  
 /*
    renderButton: Returns a button based on the state of the dapp
  */
    const renderButton = () => {
      if (account != null) {
        if (isCheckingWhitelist){
          return <div>Verificando whitelist...</div>;
        }
        if (joinedWhitelist) {
          return (
            <div className="subtitle op-10">
              Thanks for joining the Whitelist!
            </div>
          );
        } else if (loading) {
          return (<a
                  className="btn btn-light btn-rounded btn-md m-t-20"
                  data-toggle="collapse"
                  href="#"
                >
                  <span>Loading...</span>
                </a>);
        } else {
          return (
            <a
              className="btn btn-light btn-rounded btn-md m-t-20"
              data-toggle="collapse"
              href="#"
              onClick={addAddressToWhitelist}
            >
              <span>Join the Whitelist</span>
            </a>
          );
        }
    } 
  };


  // Render the component
  return (
    <div>
      <Head>
        <title>MentalHub | Whitelist</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="static-slider10">
        <Container>
          <Row className="">
            <Col md="6" className="align-self-center ">
              <span className="label label-rounded label-inverse">
                Whitelist Mental Hub
              </span>
              <h1 className="title">Welcome to the whitelist</h1>
              <h6 className="subtitle op-8">
                Some NFT collections to help with your mental health <br />
                Provided by the best healthcare professionals. <br />
                {renderWhitelistCount()} have already joined the Whitelist.
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
