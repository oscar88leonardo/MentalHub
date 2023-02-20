import { Row, Col, Container, Card, CardBody } from "reactstrap";
import Image from "next/image";
import ImgAuthor from "../public/NFT_Authors/MentalHubAuthor.png";
import React, { useEffect, useRef, useState } from "react";
import { Contract, providers, utils } from "ethers";
//import Web3Modal from "web3modal";

import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "../pages/web3RPC";

import { abi, NFT_CONTRACT_ADDRESS } from "../constants/MembersAirdrop";
import { abi as abi_w, WHITELIST_CONTRACT_ADDRESS } from "../constants/whitelist";

const clientId = "BKBATVOuFf8Mks55TJCB-XTEbms0op9eKowob9zVKCsQ8BUyRw-6AJpuMCejYMrsCQKvAlGlUHQruJJSe0mvMe0"; // get from https://dashboard.web3auth.io

const NFTColMembers = () => {

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
  
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId, 
          web3AuthNetwork: "testnet", // mainnet, aqua, celeste, cyan or testnet
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x257",
            rpcTarget: "https://goerli.gateway.metisdevops.link", // This is the public RPC we have added, please pass on your own endpoint while creating an app
          },
        });


        setWeb3auth(web3auth);

        await web3auth.initModal();
          setProvider(web3auth.provider);
        //};

      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  /**
   * presaleMint: Mint an NFT during the presale
   */
   const airdropMint = async (name, pathTypeContDig,pathContDigi,contSessions) => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      //const signer = await getProviderOrSigner(true);
      const provider0 = new providers.Web3Provider(provider);
      const signer = provider0.getSigner();
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi_w, signer);
    
      const iswhitelisted = await whitelistContract.whitelistedAddresses(signer.getAddress()); 
      
      if (iswhitelisted) {

        // call the presaleMint from the contract, only whitelisted addresses would be able to mint
        const tx = await nftContract.airdropMint({
          // value signifies the cost of one crypto dev which is "0" eth for aridrop.
          // We are parsing `0.` string to ether using the utils library from ethers.js
          value: utils.parseEther("0"),
        });
        setLoading(true);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
        //console.log(tx);
        let tokenIdsCurrent = await nftContract.getTokenIds(); 
        //console.log(tokenIdsCurrent.toNumber());
        //console.log(pathTypeContDig,pathContDigi,contSessions);
        try {
          const res = await fetch(
            'http://localhost:3000/api/'+tokenIdsCurrent.toNumber()+'/'+name+' '+tokenIdsCurrent.toNumber()+'/'+pathTypeContDig+'/'+pathContDigi+'/'+contSessions
          );
          const data = await res.json();
          console.log(data);
        } catch (err) {
          console.log(err);
        }
        window.alert("You successfully minted a community member NFT!");
      } else {
        window.alert("Sorry friend, you're not whitelisted");
      }  
    } catch (err) {
      console.error(err);
    }
  };

  const publicMint = async (name, pathTypeContDig,pathContDigi,contSessions) => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      //const signer = await getProviderOrSigner(true);
      const provider0 = new providers.Web3Provider(provider);
      const signer = provider0.getSigner();
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the Crypto Dev
      const tx = await nftContract.mint({
        // value signifies the cost of one crypto dev which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      let tokenIdsCurrent = await nftContract.getTokenIds(); 
      try {
        const res = await fetch(
          'http://localhost:3000/api/'+tokenIdsCurrent.toNumber()+'/'+name+' '+tokenIdsCurrent.toNumber()+'/'+pathTypeContDig+'/'+pathContDigi+'/'+contSessions
        );
        const data = await res.json();
        console.log(data);
      } catch (err) {
        console.log(err);
      }

      window.alert("You successfully minted a community member NFT!");
    } catch (err) {
      console.error(err);
    }
  };

  /*const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };*/
  
/**
   * startAirdrop: starts the presale for the NFT Collection
   */
 const startAirdrop = async () => {
  try {
    // We need a Signer here since this is a 'write' transaction.
    //const signer = await getProviderOrSigner(true);
    const provider0 = new providers.Web3Provider(provider);
    const signer = provider0.getSigner();
    // Create a new instance of the Contract with a Signer, which allows
    // update methods
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
    // call the startPresale from the contract
    const tx = await nftContract.StartAirdrop();
    setLoading(true);
    // wait for the transaction to get mined
    await tx.wait();
    setLoading(false);
    // set the airdrop started to true
    await checkIfAirdropStarted();
  } catch (err) {
    console.error(err);
  }
};

  /**
   * checkIfAirdropstarted: checks if the presale has started by quering the `AirdropStarted`
   * variable in the contract
   */
const checkIfAirdropStarted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      //const provider = await getProviderOrSigner();
      const provider0 = new providers.Web3Provider(provider);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider0);
      // call the presaleStarted from the contract
      const _airdropStarted = await nftContract.airdropStarted();
      if (!_airdropStarted) {
        await getOwner();
      }
      setAirdropStarted(_airdropStarted);
      return _airdropStarted;
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
      //const provider = await getProviderOrSigner();
      const provider0 = new providers.Web3Provider(provider);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider0);
      // call the presaleEnded from the contract
      const _airdropEnded = await nftContract.airdropEnded();
      // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
      // Date.now()/1000 returns the current time in seconds
      // We compare if the _presaleEnded timestamp is less than the current time
      // which means presale has ended
      const hasEnded = _airdropEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setAirdropEnded(true);
      } else {
        setAirdropEnded(false);
      }
      return hasEnded;
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
      //const provider = await getProviderOrSigner();
      const provider0 = new providers.Web3Provider(provider);
      const signer = provider0.getSigner();
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
      }
    } catch (err) {
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
      const provider0 = new providers.Web3Provider(provider);
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider0);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

/*const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
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
  };*/
  
  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called

/*const checkConnect = async () => {
    const {ethereum} = window;
    const accounts = await ethereum.request({method: 'eth_accounts'});
    console.log(accounts);
    console.log(accounts.length);
    if(accounts && accounts.length){
      console.log("setWalletConnected:true");
      setWalletConnected(true);
    } else {
      console.log("setWalletConnected:false");
      setWalletConnected(false);
    }
  };  */

useEffect(() => {
  //if (typeof window.ethereum !== 'undefined'){
  // check connect
  //checkConnect();  
  // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (provider) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      /*web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();*/

      // Check if airdrop has started and ended
      const _airdropStarted = checkIfAirdropStarted();
      if (_airdropStarted) {
        checkIfAirdropEnded();
      }

      getTokenIdsMinted();

      // Set an interval which gets called every 5 seconds to check airdrop has ended
      const airdropEndedInterval = setInterval(async function () {
        const _airdropStarted = await checkIfAirdropStarted();
        if (_airdropStarted) {
          const _airdropEnded = await checkIfAirdropEnded();
          if (_airdropEnded) {
            clearInterval(airdropEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  /*} else {
    window.alert("Wellcome Friend!, MentalHub is a web3 application, please install Metamask https://metamask.io/ for full fetures. (working on making this a frictionless experience!) ");
  }*/
  }, [provider]);


const variables_state = () => {
  //console.log(walletConnected);
  console.log(loading);
  console.log(isOwner);
  console.log(airdropStarted);
  console.log(airdropEnded);
} 

const renderButton = (name,pathTypeContDig,pathContDigi,contSessions) => {
  console.log(name, pathTypeContDig, pathContDigi, contSessions);  

    // If wallet is not connected, return a button which allows them to connect their wllet        
    if (provider) {         
      // If we are currently waiting for something, return a loading button
      if (loading) {
        return <button className="btn btn-light font-16 hcenter">Loading...</button>;
      }

      // If connected user is the owner, and airdrop hasnt started yet, allow them to start the airdrop
      if (isOwner && !airdropStarted) {
        return (
          <button className="btn btn-light font-16 hcenter" onClick={startAirdrop}>
            Start Airdrop!
          </button>
        );
      }

      // If connected user is not the owner but presale hasn't started yet, tell them that
      if (!airdropStarted) {
        return (
          <div>
            <h6 className="text-center">Airdrop coming S o O n!</h6>
          </div>
        );
      }

      // If presale started, but hasn't ended yet, allow for minting during the presale period
      if (airdropStarted && !airdropEnded) {
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
      if (airdropStarted && airdropEnded) {
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
                        {animation:"https://drive.google.com/uc?export=download&id=1z-h-yztjs-k0L9zNcpsoLUoEABJBQoBk", 
                         id:'Members', 
                         usecase:"One \npsychology assessment consultation,\none ebook "+
                                  "and 3 premium psycho-toolkits, lifetime access to MentalHUb repository",
                         name:"Member",
                         pathTypeContDig:"url",
                         pathContDigi:"Members",
                         contSessions:1
                        }
                        ]
                      
  
  const renderNFTItems = (NFTitem, index) => {  
    const RenderButtonStr = renderButton(NFTitem.name, NFTitem.pathTypeContDig, NFTitem.pathContDigi, NFTitem.contSessions);

    return(   
      <Col md="4">
        <Card className="card-shadow" key={index}>              
          <div className='player-wrapper'>
            <video controls
              src={NFTitem.animation}
              width='100%'
              height='50%'
              >
          </video>
          </div>
          <CardBody>
            <h3 className="font-bold m-b-0 text-center">
              {NFTitem.id}
            </h3>
              <p className="m-b-0 font-18 text-center">
                          {NFTitem.usecase} 
                          <br/><br/>
              </p> 
            {RenderButtonStr}            
          </CardBody>
        </Card>
        </Col>
        )  
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
       
          <div className="d-flex no-block align-items-center">
                    <span  className="thumb-img">
                      <Image  src={ImgAuthor}  alt="wrapkit" className="circle" width="120%" height="120%"/> <br />
                    </span>
                    
                    <p className="text-center font-16"> 
                        This NFT identify you as a community member, more surprises are coming along the way, stay tuned! 
                    </p>
            </div>
          <Row>
          </Row>        
          <Row className="justify-content-center">
          {NFTItemsInfo.map(renderNFTItems)}
          </Row>
        </Container>
      </div>
    </div>
  );
};
export default NFTColMembers;
