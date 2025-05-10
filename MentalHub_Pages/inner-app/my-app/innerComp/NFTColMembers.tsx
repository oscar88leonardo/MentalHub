import { Row, Col, Container, Card, CardBody, NavLink } from "reactstrap";
import Image from "next/image";
import ImgAuthor from "../public/NFT_Authors/MentalHubAuthor.png";
import React, { useEffect, useRef, useState, useContext } from "react";

import { AppContext } from "../context/AppContext";

import { abi, NFT_CONTRACT_ADDRESS } from "../constants/MembersAirdrop";
import { abi as abi_w, WHITELIST_CONTRACT_ADDRESS } from "../constants/whitelist";

import { createThirdwebClient,
  defineChain,
  getContract, 
  prepareContractCall, 
  toWei,
  resolveMethod,
  sendTransaction } from "thirdweb";
import { useActiveWallet, useAdminWallet, useReadContract } from "thirdweb/react";
import { getWalletBalance } from "thirdweb/wallets";
import { owner } from "thirdweb/extensions/common";
import {client as clientThridweb} from "./client";
import { myChain } from "./myChain";

const NFTColMembers = () => {
  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }

  // walletConnected keep track of whether the user's wallet is connected or not
  //const [walletConnected, setWalletConnected] = useState(false);
  const [airdropStarted, setAirdropStarted] = useState(false);
  // presaleEnded keeps track of whether the presale ended
  const [airdropEnded, setAirdropEnded] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  //const web3ModalRef = useRef();

  // Usar useActiveWallet dentro del componente
  console.log("process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID");
  console.log(process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID);
  const activeWallet = useActiveWallet();
  const adminWallet = useAdminWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const adminAccount = adminWallet ? adminWallet.getAccount() : null;

  const contract = getContract({
    client: clientThridweb!,
    chain: myChain,
    address: NFT_CONTRACT_ADDRESS,
    // The ABI for the contract is defined here
    abi: abi as [],
  });

  const contractWhitelist = getContract({
    client: clientThridweb!,
    chain: myChain,
    address: WHITELIST_CONTRACT_ADDRESS,
    // The ABI for the contract is defined here
    abi: abi_w as [],
  });

  const dataWhitelist = useReadContract({
    contract: contractWhitelist,
    method: "whitelistedAddresses",
    params: [account?.address || ""],
  });

  const dataAirdropStarted = useReadContract({
    contract: contract,
    method: "airdropStarted",
    params: [],
  });

  const dataAirdropEnded = useReadContract({
    contract: contract,
    method: "airdropEnded",
    params: [],
  });

  const datatokenIds = useReadContract({
    contract: contract,
    method: "getTokenIds",
    params: [],
  });

  const dataisSponsoredMint = useReadContract({
    contract: contract,
    method: "isSponsoredMint",
    params: [],
  });

  /**
   * presaleMint: Mint an NFT during the presale
   */
   const airdropMint = async (name:string, pathTypeContDig:string,pathContDigi:string,contSessions:number) => {
    try {

      console.log("dataWhitelist:");
      console.log(dataWhitelist);

      if(dataWhitelist.isLoading) {
        console.log("Loading whitelist data...");
        return;
      } else if(dataWhitelist.data) {

        console.log("minting");
  
        console.log("contract airdropMint:");
        console.log(contract);
          
        const tx = prepareContractCall({
          contract,
          // We get auto-completion for all the available functions on the contract ABI
          method: resolveMethod("airdropMint"),
          // including full type-safety for the params
          params: [2],
          value: toWei("0"),
        });

        if (activeWallet) {
          //let tx = null;
          console.log(activeWallet);
          console.log(account);
          
          const { transactionHash } = await sendTransaction({
            account: account!,
            transaction: tx,
          });
          console.log("transactionHash publicMint:");
          console.log(transactionHash);

          window.alert("You successfully minted a community member NFT!");
        } else {
          console.log("No hay una billetera activa.");
        }
      } else {
        window.alert("Sorry friend, you're not whitelisted");
      }
      
    } catch (err) {
      console.error(err);
    }
  };

  const publicMint = async (name:string, pathTypeContDig:string,pathContDigi:string,contSessions:number) => {
    try {
      
      console.log("minting");
  
      console.log("contract publicMint:");
      console.log(contract);
      
      // verificar si el mint es sponsoreado
     // const isSponsoredMint = await contract.read("isSponsoredMint");
      console.log("dataisSponsoredMint:");
      console.log(dataisSponsoredMint.data);
     

      const tx = prepareContractCall({
        contract,
        // We get auto-completion for all the available functions on the contract ABI
        method: resolveMethod("mint"),
        // including full type-safety for the params
        params: [2],
        // solo enviar valor si no es sponsoreado
        value: dataisSponsoredMint.data ? toWei("0") : toWei("0.01"),
      });

      if (activeWallet) {
        //let tx = null;
        console.log(activeWallet);
        console.log(account);
        
        const { transactionHash } = await sendTransaction({
          account: account!,
          transaction: tx,
        });
        console.log("transactionHash publicMint:");
        console.log(transactionHash);

        window.alert("You successfully minted a community member NFT!");
      } else {
        console.log("No hay una billetera activa.");
      }

      
    } catch (err) {
      console.error(err);
      window.alert(err);
    }
  };
  
/**
   * startAirdrop: starts the presale for the NFT Collection
   */
 const startAirdrop = async (duration: number, isMinutes: boolean) => {
  try {
    
    console.log("starting airdrop");
  
    console.log("contract startAirdrop:");
    console.log(contract);
    
    const timeUnit = isMinutes ? 0 : 1;// 0 para minutos, 1 para dias
    
    const tx = prepareContractCall({
      contract,
      // We get auto-completion for all the available functions on the contract ABI
      method: resolveMethod("StartAirdrop"),
      // including full type-safety for the params
      params: [duration, timeUnit],
      //value: toWei("0"),
    });

    if (adminWallet) {
      //let tx = null;
      //console.log(activeWallet);
      //console.log(account);
      
      const { transactionHash } = await sendTransaction({
        account: adminAccount!,
        transaction: tx,
      });

      console.log(`Airdrop iniciado por ${duration} ${isMinutes ? 'minutos' : 'días'}`);
      console.log("Transaction Hash:", transactionHash);
      window.alert("You successfully started the Airdrop!");

    } else {
      console.log("No hay una billetera activa.");
    }
    
  } catch (err) {
    console.error("Error al iniciar airdrop:", err);
  }
};

  /**
   * checkIfAirdropstarted: checks if the presale has started by quering the `AirdropStarted`
   * variable in the contract
   */
const checkIfAirdropStarted = async () => {
    try {
      
      console.log("dataAirdropStarted:");
      console.log(dataAirdropStarted);

      if(dataAirdropStarted.isLoading) {
        console.log("Loading AirdropStarted data...");
        return;
      } else if(!dataAirdropStarted.data) {
        await getOwner();
      }
      
      setAirdropStarted(!!dataAirdropStarted.data);
      return !!dataAirdropStarted.data;

    } catch (err) {
      console.error(err);
      return false;
    }
  };

  /**
   * checkIfAirdropEnded: checks if the presale has ended by quering the `presaleEnded`
   * variable in the contract
   */
const checkIfAirdropEnded = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      
      console.log("dataAirdropEnded:");
      console.log(dataAirdropEnded);

      if(dataAirdropEnded.isLoading) {
        console.log("Loading dataAirdropEnded data...");
        return;
      } else if(dataAirdropEnded.data) {
        const _airdropEnded = dataAirdropEnded.data
        console.log("_airdropEnded:");
        console.log(typeof _airdropEnded);
        console.log(_airdropEnded);

        let hasEnded = null;
        if (typeof _airdropEnded === "number" && _airdropEnded < Math.floor(Date.now() / 1000))
          hasEnded = true;
        else 
          hasEnded = false;
        if (hasEnded) {
          setAirdropEnded(true);
        } else {
          setAirdropEnded(false);
        }
        return hasEnded;
      }
      return false;
      
    } catch (err) {
      console.error(err);
      return false;
    }
  };    

  /**
   * getOwner: calls the contract to retrieve the owner
   */
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

  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      //const provider = await getProviderOrSigner();
      
      console.log("datatokenIds:");
      console.log(datatokenIds);

      if(datatokenIds.isLoading) {
        console.log("Loading datatokenIds data...");
        return;
      } else if(datatokenIds.data) {
        const _tokenIds = datatokenIds.data;
        setTokenIdsMinted(_tokenIds.toString());
      }
      
    } catch (err) {
      console.error(err);
    }
  };
  
  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called


useEffect(() => {
  
    if (account) {
      getOwner();
      renderNFT();
    }
  }, [account]);

  useEffect(() => {
    getTokenIdsMinted();
  }, [datatokenIds]);
  
  useEffect(() => {
    // Check if airdrop has started and ended
    const _airdropStarted = checkIfAirdropStarted();
    if (_airdropStarted != null) {
      checkIfAirdropEnded();
    }
  }, [dataAirdropStarted]);


const variables_state = () => {
  //console.log(walletConnected);
  console.log(loading);
  console.log(isOwner);
  console.log(airdropStarted);
  console.log(airdropEnded);
} 



const renderButton = (name:string,pathTypeContDig:string,pathContDigi:string,contSessions:number) => {  
  console.log(name, pathTypeContDig, pathContDigi, contSessions);  
  console.log('isOwner');console.log(isOwner);
  console.log('connected wallet');//console.log(signer?.address);
  

    // If wallet is not connected, return a button which allows them to connect their wllet        
    if (account) {         
      // If we are currently waiting for something, return a loading button
      if (loading) {
        return <button className="btn btn-light font-16 hcenter">Loading...</button>;
      }

      // If connected user is the owner, and airdrop hasnt started yet, allow them to start the airdrop
      else if ((isOwner && !airdropStarted) || (isOwner && airdropStarted && airdropEnded)) {
        return (
          <button className="btn btn-light font-16 hcenter" onClick={() => startAirdrop(5, true)}>
            Start Airdrop!
          </button>
        );
      }

      // If connected user is not the owner but presale hasn't started yet, tell them that
      else if (!airdropStarted) {
        return (
          <div>
            <h6 className="text-center">Airdrop coming S o O n!</h6>
          </div>
        );
      }

      // If presale started, but hasn't ended yet, allow for minting during the presale period
      else if (airdropStarted && !airdropEnded) {
        return (
          <div>
            <h6 className="text-center">
              Airdrop has started for whitelisted addresses!
            </h6>
            <button className="btn btn-light font-16 hcenter" onClick={() =>airdropMint(name, pathTypeContDig,pathContDigi,contSessions)}>
              Claim 🚀!
            </button>
          </div>
        );
      }

      // If presale started and has ended, its time for public minting
      else if (airdropStarted && airdropEnded) {
        return (          
          <button className="btn btn-light font-16 hcenter" onClick={() => publicMint(name, pathTypeContDig,pathContDigi,contSessions)}>
            Public Mint 🚀!
          </button>
        );
      }
    } 
  };


  const NFTGeneralData = {title:"Mental Hub Members", AuthorImg:"/../public/NFT_Authors/pilamental.png",
                           AuthorUrl:"https://www.instagram.com/pila_mental_/", AuthorId:"@mental_hub"}
                                                    
  const  NFTItemsInfo = [
                        { 
                         animation:"https://aqua-uneven-canid-277.mypinata.cloud/ipfs/QmSgf5R7Fv4voxy5EPpPqx7eDwEpryEEnGGjs2RzyR17yK", 
                         id:'Members', 
                         usecase:"One \npsychology assessment consultation,\none ebook "+
                                  "and 3 premium psycho-toolkits, lifetime access to MentalHUb repository",
                         name:"Member",
                         pathTypeContDig:"url",
                         pathContDigi:"Members",
                         contSessions:1
                        }
                        ]
  
const renderNFT = () => {
  return NFTItemsInfo.map((NFTitem, index) => (
    <Col md="4" key={index}>
      <Card className="card-shadow">
        <div className='player-wrapper'>
          <video controls width='100%' height='50%'>
            <source src={NFTitem.animation} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <CardBody>
          <h3 className="font-bold m-b-0 text-center">{NFTitem.id}</h3>
          <p className="m-b-0 font-18 text-center">
            {NFTitem.usecase}
            <br /><br />
          </p>
          {renderButton(NFTitem.name, NFTitem.pathTypeContDig, NFTitem.pathContDigi, NFTitem.contSessions)}
        </CardBody>
      </Card>
    </Col>
  ));
}

  return (
    <div>     
      <div className="spacer">
        <Container>
          <Row className="justify-content-center">
            <Col lg="10" md="6" className="text-center"> 
            <h2 className="title font-bold">{NFTGeneralData.title}</h2>            
            <h3 className="subtitle text-center"> A digital collection by <a href={NFTGeneralData.AuthorUrl}>{NFTGeneralData.AuthorId}</a></h3>                               
            </Col>
          </Row>
          <Row>
            <div className="d-flex no-block align-items-center">
                      <span  className="thumb-img">
                        <Image  src={ImgAuthor}  alt="wrapkit" className="circle" width="150" height="150"/> <br />
                      </span>
                      
                      <p className="text-center font-16"> 
                          This NFT identify you as a community member, more surprises are coming along the way, stay tuned! 
                      </p>
              </div>
          </Row>        
          <Row>
            <h3 className="subtitle text-center">
              {tokenIdsMinted} Tokens minted
            </h3>
          </Row>
          <Row className="justify-content-center">
          {renderNFT()}
          </Row>
        </Container>
      </div>
    </div>
  );
};
export default NFTColMembers;
