"use client"
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "./ethersRPC";

import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { providerToBrowserProvider } from "../innerComp/providerUtility";
import { CeramicClient } from "@ceramicnetwork/http-client"
import { ComposeClient } from "@composedb/client";

import { definition } from "../src/__generated__/definition.js";
import { RuntimeCompositeDefinition } from "@composedb/types";

import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";

const clientId = "BKBATVOuFf8Mks55TJCB-XTEbms0op9eKowob9zVKCsQ8BUyRw-6AJpuMCejYMrsCQKvAlGlUHQruJJSe0mvMe0"; // get from https://dashboard.web3auth.io

export const AppContext = createContext(null);



const AppProvider = ({children,}: Readonly<{children: React.ReactNode;}>) => 
{
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [isConnected, setIsConected] = useState(false);
  const [AddressWeb3, setAddressWeb3] = useState(null);
  const [userInfo, setuserInfo] = useState(null);
  const [PrivateKey, setPrivateKey] = useState(null);

  const [innerProfile, setInnerProfile] = useState();
  /*const [PinataGateway, setPinataGateway] = useState(null);
  const [PinataApiKey, setPinataApiKey] = useState(null);
  const [PinataSecret, setPinataSecret] = useState(null);
  const [orbis, setorbis] = useState(null);
  const [userOrbis, setUserOrbis] = useState();
  const [orbisProfile, setOrbisProfile] = useState();
  const [isConnectOrbis, setisConnectOrbis] = useState(false);
  const [orbisProvider, setorbisProvider] = useState(null);*/

  /**
   * Configure ceramic Client & create context.
   */
  const ceramic = new CeramicClient("http://192.168.1.28:7007");

  const composeClient = new ComposeClient({
    ceramic: "http://192.168.1.28:7007",
    // cast our definition as a RuntimeCompositeDefinition
    definition: definition as RuntimeCompositeDefinition,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId, 
          web3AuthNetwork: "testnet", // mainnet, aqua, celeste, cyan or testnet
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x257", // Metis goerli Id: "0x257", polygon mumbai id:"0x13881"
            rpcTarget: "https://goerli.gateway.metisdevops.link",//"https://rpc.ankr.com/metis", // This is the public RPC we have added, please pass on your own endpoint while creating an app
            // metis RPC:"https://goerli.gateway.metisdevops.link" , polygon quicknode rpc: "https://quiet-multi-bird.matic-testnet.discover.quiknode.pro/11514888637b7e0629fb4741b7832b3d89c88629/"
            displayName: "Goerli Testnet",
            blockExplorer: "https://goerli.explorer.metisdevops.link",
            ticker: "METIS",
            tickerName: "Metis",
          },
        });
        setWeb3auth(web3auth);
        await web3auth.initModal();
          setProvider(web3auth.provider);
        //};
        if(web3auth.connected)
          setIsConected(true);

      } catch (error) {
        console.error(error);
      }
    };

    init();

    /*axios.get('/api/getpinataId')
    .then((response) => {
      setPinataGateway(response.data.PINATA_GATEWAY);
      setPinataApiKey(response.data.PINATA_API_KEY);
      setPinataSecret(response.data.PINATA_SECRET);      
    })
    .catch((error) => console.error("Error fetching data:", error));*/

  }, []);

  /*const initOrbis = async () => {
    try {             
    console.log("PinataGateway");
    console.log(PinataGateway);
    console.log("PinataAPIKEY");
    console.log(PinataApiKey);
    console.log("PinataSecret");
    console.log(PinataSecret);
    //console.log("RES DATA:"); 
    // init oribs classs object
    const orbis = new Orbis({
      PINATA_GATEWAY: PinataGateway, // Your Pinata Gateway
      PINATA_API_KEY: PinataApiKey, // Your Pinata API key
      PINATA_SECRET_API_KEY: PinataSecret // Your Pinata Secret API key
    });    

    setorbis(orbis);

    } catch (error) {
      console.error(error);
    }
  };*/

  /*useEffect(() => {
    if (PinataGateway && PinataApiKey && PinataSecret){
      initOrbis();
    }
  }, [PinataGateway,PinataApiKey,PinataSecret])*/

  useEffect(() => {
    if (isConnected && ceramic && composeClient){
      loginComposeDB();
    }
  }, [isConnected,ceramic,composeClient])

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if(web3auth.connected)
      setIsConected(true);
    else
      setIsConected(false);
  };
  
  const loginComposeDB = async () => {
    console.log("ceramic OBJ");
    console.log(ceramic);
    console.log("ComposeDB OBJ");
    console.log(composeClient);
    
    const oProvider = providerToBrowserProvider(provider);      

    // We enable the ethereum provider to get the user's addresses.
    // const ethProvider = window.ethereum;
    // request ethereum accounts.
    const addresses = await oProvider.enable({
      method: "eth_requestAccounts",
    });
    const accountId = await getAccountId(oProvider, addresses[0]);
    const authMethod = await EthereumWebAuth.getAuthMethod(oProvider, accountId);

    /**
     * Create DIDSession & provide capabilities for resources that we want to access.
     * @NOTE: The specific resources (ComposeDB data models) are provided through
     * "compose.resources" below.
     */

    let session = await DIDSession.authorize(authMethod, { resources: composeClient.resources });
    // Set the session in localStorage.
    //localStorage.setItem("ceramic:eth_did", session.serialize());

    // Set our Ceramic DID to be our session DID.
    composeClient.setDID(session.did);
    ceramic.did = session.did;

    //setorbisProvider(oProvider);
    /*const res = await orbis.connect_v2({ provider: oProvider, chain: "ethereum", lit: false });
    // Check if the connection is successful or not 
    if(res.status == 200) {
      setisConnectOrbis(true);
      setUserOrbis(res);        
    } else {
      console.log("Error connecting to Ceramic: ", res);
      alert("Error connecting to Ceramic.");
    }*/
 
};

  const logout = async () => {
    
    
    if (!web3auth) {
      console.info("web3auth not initialized yet");
      return;
    }
    //orbis.logout();
    await web3auth.logout();
    setProvider(null);
    setIsConected(false);
    /*setisConnectOrbis(false);
    setUserOrbis(null);*/
    window.location.href = "/";
  };


  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
    setuserInfo(user);
  };

  const getInnerProfile = async () => {
    if (ceramic.did == undefined) {
      console.log("ceramic not initialized yet");
      return;
    }else {
      const profile = await composeClient.executeQuery(`
        query {
          viewer {
            innerverProfile {
              id
              name
              displayName
              rol
            }
          }
        }
        `);
        setInnerProfile(profile?.data?.viewer?.innerverProfile);
    }
    /*const { data, error } = await orbis.getProfile(userOrbis.did);  
    setOrbisProfile(data);
        console.log("orbis profile:");
        console.log(orbisProfile);*/
 
  };

  const getAccounts = async () => {
    if (!provider) {
      console.info("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    setAddressWeb3(address);
    //console.info(address);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      console.info("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    console.info('privateKey:');
    console.info(privateKey);
    setPrivateKey(privateKey);
  };

  return (
    <AppContext.Provider
      value={{ provider,
              AddressWeb3, 
              userInfo, 
              PrivateKey,
              isConnected,
              ceramic,
              composeClient,
              innerProfile,
              getInnerProfile,
              login, 
              logout, 
              getUserInfo,
              getAccounts,
              getPrivateKey
            }}
    >
      {children}
    </AppContext.Provider>
  );
};
export default AppProvider;
