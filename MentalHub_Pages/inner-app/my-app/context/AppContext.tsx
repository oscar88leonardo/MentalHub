"use client"
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "./ethersRPC";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
//import { providerToBrowserProvider } from "../innerComp/providerUtility";
import { BrowserProvider, Eip1193Provider } from "ethers/providers"
import { CeramicClient } from "@ceramicnetwork/http-client"
import { ComposeClient } from "@composedb/client";

import { definition } from "../src/__generated__/definition.js";
import { RuntimeCompositeDefinition } from "@composedb/types";

import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { JsonRpcSigner } from "ethers/providers";
/*import type {
  JsonRpcSigner
} from "../node_modules/ethers/src.ts/providers/provider-jsonrpc.js";
*/

import { MetamaskAdapter } from "@web3auth/metamask-adapter";
const metamaskAdapter = new MetamaskAdapter();

//const clientId = "BKBATVOuFf8Mks55TJCB-XTEbms0op9eKowob9zVKCsQ8BUyRw-6AJpuMCejYMrsCQKvAlGlUHQruJJSe0mvMe0"; // get from https://dashboard.web3auth.io
const clientId = "BAejqiv6dLQmUrf5ap4mv8Pg57G2imeabR9Cr7sZgbF_ZN1dxtoStZIS49sdkMlb7stGzlhxwIwBybo_iXz1oZs";

// Interfaces and types definitions :
//
// Appcontext types interface
interface AppContextType {
  provider: SafeEventEmitterProvider | Eip1193Provider | null;
  signer: JsonRpcSigner | null;
  AddressWeb3: string | null;
  userInfo: any | null; // Replace 'any' with a more specific type if possible
  PrivateKey: string | null;
  isConnected: boolean;
  isConComposeDB: boolean;
  ceramic: CeramicClient;
  composeClient: ComposeClient;
  innerProfile: any | null; // Replace 'any' with a more specific type if possible
  getSigner: () => Promise<void>;
  executeQuery: (query: string) => Promise<any>; // Replace 'any' with a more specific return type if possible
  getInnerProfile: () => Promise<void>;
  loginComposeDB: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<void>;
  getAccounts: () => Promise<void>;
  getPrivateKey: () => Promise<void>;
}

//Types for Graphql querys
//
// Enum for Rol
enum Rol {
  Terapeuta = 'Terapeuta',
  Consultante = 'Consultante'
}

// Interface for InnerverProfile
interface InnerverProfile {
  id: string; // ComposeDB typically adds an id field
  displayName: string;
  name: string;
  rol: Rol;
  pfp?: string; // Optional because it doesn't have a '!' in the schema
}

// Interface for the query result
interface ProfileQueryResult {
  data?: {
    viewer?: {
      innerverProfile?: InnerverProfile | undefined;
    } | undefined;
  } | null | undefined;
}

export const AppContext = createContext<AppContextType | null>(null);
//export const AppContext = createContext(null);

const AppProvider = ({children,}: Readonly<{children: React.ReactNode;}>) => 
{
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | Eip1193Provider | null>(null);
  const [isConnected, setIsConected] = useState(false);
  const [isConComposeDB, setIsConComposeDB] = useState(false);
  const [AddressWeb3, setAddressWeb3] = useState(null);
  const [userInfo, setuserInfo] = useState(null);
  const [PrivateKey, setPrivateKey] = useState(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [flagInitExec, setFlagInitExec] = useState(false);
  const [innerProfile, setInnerProfile] = useState<InnerverProfile | null>(null);

  /**
   * Configure ceramic Client & create context.
   */
  const ceramic = new CeramicClient("http://10.42.0.43:7007");

  const composeClient = new ComposeClient({
    ceramic: "http://10.42.0.43:7007",
    // cast our definition as a RuntimeCompositeDefinition
    definition: definition as RuntimeCompositeDefinition,
  });

  const init = async () => {
    try {
      const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0xe9fe", //Metis sepolia id: "0xe9fe", Metis goerli Id: "0x257", polygon mumbai id:"0x13881"
        rpcTarget: "https://sepolia.metisdevops.link",//"https://rpc.ankr.com/metis", // This is the public RPC we have added, please pass on your own endpoint while creating an app
        // metis RPC:"https://goerli.gateway.metisdevops.link" , polygon quicknode rpc: "https://quiet-multi-bird.matic-testnet.discover.quiknode.pro/11514888637b7e0629fb4741b7832b3d89c88629/"
        displayName: "Sepolia Testnet",
        blockExplorerUrl: "https://sepolia-explorer.metisdevops.link/",
        ticker: "tMETIS",
        tickerName: "TestnetMetis",
      }

      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig: chainConfig },
      });

      const web3auth_local = new Web3Auth({
        clientId, 
        web3AuthNetwork: "testnet", // mainnet, aqua, celeste, cyan or testnet
        privateKeyProvider: privateKeyProvider,
      });

      web3auth_local.configureAdapter(metamaskAdapter);
      await web3auth_local.initModal();
      setWeb3auth(web3auth_local);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setFlagInitExec(true);
  }, []);

  useEffect(() => {
    console.log("web3auth-before-init:");
    console.log(web3auth);
    console.log("flagInitExec:");
    console.log(flagInitExec);
    if(!web3auth && flagInitExec){
      setFlagInitExec(false);
      init();
    }
  }, [flagInitExec]);

  useEffect(() => {
    if (web3auth){
      console.log("web3auth-init:");
      console.log(web3auth);
      setProvider(web3auth.provider);
      if(web3auth.connected){
        setIsConected(true);
      }
    }
  }, [web3auth])

  useEffect(() => {
    if (isConnected){
      loginComposeDB();
    }
  }, [isConnected])

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
    
    const sessionStr = sessionStorage.getItem("ceramic:eth_did"); // for production you will want a better place than localStorage for your sessions.
    let session;

    if (sessionStr) {
      session = await DIDSession.fromSession(sessionStr);
    }
    if (!session || (session.hasSession && session.isExpired)) {
      //const oProvider = providerToBrowserProvider(provider);      
      if (!provider){
        console.error("Provider is not initialized");
        return;
      }      
      const oProvider = new BrowserProvider(provider);
      const signer = await oProvider.getSigner();

      // We enable the ethereum provider to get the user's addresses.
      // const ethProvider = window.ethereum;
      // request ethereum accounts.
      
      //setAddressWeb3(signer.address);
      const accountId = await getAccountId(provider, signer.address);
      
      const authMethod = await EthereumWebAuth.getAuthMethod(provider, accountId);
      
      
      /**
       * Create DIDSession & provide capabilities for resources that we want to access.
       * @NOTE: The specific resources (ComposeDB data models) are provided through
       * "compose.resources" below.
       */

      session = await DIDSession.authorize(authMethod, { resources: composeClient.resources });
      
      sessionStorage.setItem("ceramic:eth_did", session.serialize());
      // Set the session in localStorage.
      //localStorage.setItem("ceramic:eth_did", session.serialize());
      setSigner(signer);
    }

    // Set our Ceramic DID to be our session DID.
    composeClient.setDID(session.did);
    ceramic.did = session.did;

    /*console.log("ceramic OBJ");
    console.log(ceramic);
    console.log("ComposeDB OBJ");
    console.log(composeClient);*/

    setIsConComposeDB(true);

    return;
    
};

const executeQuery = async (query: string) => {
  await loginComposeDB();
  console.log("exec ceramic OBJ");
  console.log(ceramic);
  console.log("exec ComposeDB OBJ");
  console.log(composeClient);
  const update = await composeClient.executeQuery(query);
  console.log("update:")
  console.log(update)
  if (update.errors) {
    console.log("errors:");
    console.log(update.errors);
  }
  return update
  //getInnerProfile();
}

  const logout = async () => {
    
    
    if (!web3auth) {
      console.info("web3auth not initialized yet");
      return;
    }
    console.log("web3auth-logout:");
    console.log(web3auth);
    await web3auth.logout();
    setProvider(null);
    setIsConected(false);
    setIsConComposeDB(false);
    sessionStorage.removeItem("ceramic:eth_did");
    window.location.href = "/";
  };


  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    /*console.log(user);
    setuserInfo(user);*/
  };

  const getInnerProfile = async () => {
    await loginComposeDB();
    if (ceramic.did == undefined) {
      console.log("ceramic not initialized yet");
      return;
    }else {
      const profile : ProfileQueryResult = await composeClient.executeQuery(`
        query {
          viewer {
            innerverProfile {
              id
              name
              displayName
              rol
              pfp
              hudds(last: 100, filters: {where: {state: {in: Active}}}) {
                edges {
                  node {
                    id
                    name
                    roomId
                    created
                    state
                  }
                }
              }
              sched_therap(last: 100, filters: {where: {state: {in: Active}}}) {
                edges {
                  node {
                    id
                    date_init
                    date_finish
                    created
                    state
                  }
                }
              }
              schedules(filters: {where: {state: {in: [Pending,Active]}}}, last: 100) {
                edges {
                  node {
                    created
                    date_finish
                    date_init
                    huddId
                    hudd {
                      roomId
                      profileId
                    }
                    profileId
                    state
                    id
                  }
                }
              }
            }
          }
        }
        `);
        if (profile?.data?.viewer?.innerverProfile){
          setInnerProfile(profile?.data?.viewer?.innerverProfile);
          console.log("getInnerProfile:");
          console.log(profile);    
        } else {console.log('innerverProfile is undefined');}

                
    }
    /*const { data, error } = await orbis.getProfile(userOrbis.did);  
    setOrbisProfile(data);
        console.log("orbis profile:");
        console.log(orbisProfile);*/
 
  };
  
  const getSigner = async () => {
    if (!provider) {
      console.info("provider not initialized yet");
      return;
    }
    const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
    const signer = await provider0.getSigner();
    setSigner(signer);
  }

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

  const contextValue: AppContextType = {
    provider,
    signer,
    AddressWeb3,
    userInfo,
    PrivateKey,
    isConnected,
    isConComposeDB,
    ceramic,
    composeClient,
    innerProfile,
    getSigner,
    executeQuery,
    getInnerProfile,
    loginComposeDB,
    login,
    logout,
    getUserInfo,
    getAccounts,
    getPrivateKey,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;

  /*
  return (
    <AppContext.Provider
      value={{ provider,
              signer,
              AddressWeb3, 
              userInfo, 
              PrivateKey,
              isConnected,
              isConComposeDB,
              ceramic,
              composeClient,
              innerProfile,
              getSigner,
              executeQuery,
              getInnerProfile,
              loginComposeDB,
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
  */
};
export default AppProvider;
