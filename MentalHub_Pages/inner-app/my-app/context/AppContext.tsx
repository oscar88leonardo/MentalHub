"use client"
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "./ethersRPC";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
//import { providerToBrowserProvider } from "../innerComp/providerUtility";
import { BrowserProvider } from "ethers/providers"
import { CeramicClient } from "@ceramicnetwork/http-client"
import { ComposeClient } from "@composedb/client";

import { definition } from "../src/__generated__/definition.js";
import { RuntimeCompositeDefinition } from "@composedb/types";

import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";

import type {
  JsonRpcSigner
} from "../node_modules/ethers/src.ts/providers/provider-jsonrpc.js";

import { MetamaskAdapter } from "@web3auth/metamask-adapter";
const metamaskAdapter = new MetamaskAdapter();

//const clientId = "BKBATVOuFf8Mks55TJCB-XTEbms0op9eKowob9zVKCsQ8BUyRw-6AJpuMCejYMrsCQKvAlGlUHQruJJSe0mvMe0"; // get from https://dashboard.web3auth.io
const clientId = "BAejqiv6dLQmUrf5ap4mv8Pg57G2imeabR9Cr7sZgbF_ZN1dxtoStZIS49sdkMlb7stGzlhxwIwBybo_iXz1oZs";

export const AppContext = createContext(null);



const AppProvider = ({children,}: Readonly<{children: React.ReactNode;}>) => 
{
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [isConnected, setIsConected] = useState(false);
  const [isConComposeDB, setIsConComposeDB] = useState(false);
  const [AddressWeb3, setAddressWeb3] = useState(null);
  const [userInfo, setuserInfo] = useState(null);
  const [PrivateKey, setPrivateKey] = useState(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)

  const [innerProfile, setInnerProfile] = useState();

  /**
   * Configure ceramic Client & create context.
   */
  const ceramic = new CeramicClient("http://192.168.1.105:7007");

  const composeClient = new ComposeClient({
    ceramic: "http://192.168.1.105:7007",
    // cast our definition as a RuntimeCompositeDefinition
    definition: definition as RuntimeCompositeDefinition,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0xE9FE", // Metis goerli Id: "0x257", polygon mumbai id:"0x13881"
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

        

        const web3auth = new Web3Auth({
          clientId, 
          web3AuthNetwork: "testnet", // mainnet, aqua, celeste, cyan or testnet
          privateKeyProvider: privateKeyProvider,
        });

        web3auth.configureAdapter(metamaskAdapter);
        await web3auth.initModal();
          setProvider(web3auth.provider);
        //};
        setWeb3auth(web3auth);
        if(web3auth.connected)
          setIsConected(true);


      } catch (error) {
        console.error(error);
      }
    };

    init();

  }, []);

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
      const oProvider = new BrowserProvider(provider);
      const signer = await oProvider.getSigner();

      // We enable the ethereum provider to get the user's addresses.
      // const ethProvider = window.ethereum;
      // request ethereum accounts.
      console.log("signer");
      console.log(signer);
      //setAddressWeb3(signer.address);
      const accountId = await getAccountId(provider, signer.address);
      console.log("accountId");
      console.log(accountId);
      const authMethod = await EthereumWebAuth.getAuthMethod(provider, accountId);
      console.log("authMethod");
      console.log(authMethod);
      
      /**
       * Create DIDSession & provide capabilities for resources that we want to access.
       * @NOTE: The specific resources (ComposeDB data models) are provided through
       * "compose.resources" below.
       */

      session = await DIDSession.authorize(authMethod, { resources: composeClient.resources });
      console.log("session");
      console.log(session);
      sessionStorage.setItem("ceramic:eth_did", session.serialize());
      // Set the session in localStorage.
      //localStorage.setItem("ceramic:eth_did", session.serialize());
      setSigner(signer);
    }

    // Set our Ceramic DID to be our session DID.
    composeClient.setDID(session.did);
    ceramic.did = session.did;

    console.log("ceramic OBJ");
    console.log(ceramic);
    console.log("ComposeDB OBJ");
    console.log(composeClient);

    setIsConComposeDB(true);

    return;
    
};

const executeQuery = async (query) => {
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
    console.log(user);
    setuserInfo(user);
  };

  const getInnerProfile = async () => {
    await loginComposeDB();
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
              pfp
              hudds(first: 10) {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
        `);
        setInnerProfile(profile?.data?.viewer?.innerverProfile);
        console.log("getInnerProfile:");
        console.log(profile);
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
};
export default AppProvider;
