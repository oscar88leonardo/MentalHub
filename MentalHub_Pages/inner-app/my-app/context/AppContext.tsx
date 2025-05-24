"use client"
import type {OpenloginUserInfo } from "@web3auth/openlogin-adapter";
import RPC from "./ethersRPC";

import React, { createContext, useEffect, useState } from "react";
//import { providerToBrowserProvider } from "../innerComp/providerUtility";
//import { BrowserProvider, Eip1193Provider } from "ethers/providers"
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


//import { MetamaskAdapter } from "@web3auth/metamask-adapter";
//const metamaskAdapter = new MetamaskAdapter();

import { createThirdwebClient,defineChain } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet, privateKeyToAccount,smartWallet } from "thirdweb/wallets";
import { useActiveWallet, useReadContract } from "thirdweb/react";
import {client as clientThridweb} from "../innerComp/client";
import { EIP1193 } from "thirdweb/wallets";
import { myChain } from "../innerComp/myChain";

//const clientId = "BKBATVOuFf8Mks55TJCB-XTEbms0op9eKowob9zVKCsQ8BUyRw-6AJpuMCejYMrsCQKvAlGlUHQruJJSe0mvMe0"; // get from https://dashboard.web3auth.io
//const clientId = "BAejqiv6dLQmUrf5ap4mv8Pg57G2imeabR9Cr7sZgbF_ZN1dxtoStZIS49sdkMlb7stGzlhxwIwBybo_iXz1oZs";
// const clientId = "BAQR0_ynGoFJSpg2ubIe1K_p7p2aMUrioGISxq8aUoTSRuKiU14AmoAFQQOA6p5GZsgd_543D8LdKMBlu8zJ-sk"
// Interfaces and types definitions :
//
// Appcontext types interface
interface AppContextType {
  //provider: EIP1193.EIP1193Provider | null;
  //signer: JsonRpcSigner | null;
  //AddressWeb3: string | null;
  //userInfo: Partial<OpenloginUserInfo> | null; // Replace 'any' with a more specific type if possible
  //PrivateKey: string | null;
  //isConnected: boolean;
  isConComposeDB: boolean;
  ceramic: CeramicClient;
  composeClient: ComposeClient;
  innerProfile: any | null; // Replace 'any' with a more specific type if possible
  //getSigner: () => Promise<void>;
  executeQuery: (query: string) => Promise<any>; // Replace 'any' with a more specific return type if possible
  getInnerProfile: () => Promise<void>;
  loginComposeDB: () => Promise<void>;
  //login: () => Promise<void>;
  logout: () => Promise<void>;
  //getUserInfo: () => Promise<void>;
  //getAccounts: () => Promise<void>;
  //getPrivateKey: () => Promise<void>;
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
  //const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  //const [provider, setProvider] = useState<EIP1193.EIP1193Provider| null>(null);
  //const [isConnected, setIsConected] = useState(false);
  const [isConComposeDB, setIsConComposeDB] = useState(false);
  //const [AddressWeb3, setAddressWeb3] = useState(null);
  //const [userInfo, setuserInfo] = useState<Partial<OpenloginUserInfo> | null>(null);
  //const [PrivateKey, setPrivateKey] = useState(null);
  //const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [flagInitExec, setFlagInitExec] = useState(false);
  const [innerProfile, setInnerProfile] = useState<InnerverProfile | null>(null);
// define thirdweb hook to use the active wallet and get the account
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const providerThirdweb = activeWallet
    ? EIP1193.toProvider({
        wallet: activeWallet,
        chain: myChain,
        client: clientThridweb,
      })
    : null;
  /**
   * Configure ceramic Client & create context.
   */
  const ceramic = new CeramicClient("https://ceramicnode.innerverse.care");

  const composeClient = new ComposeClient({
    ceramic: "https://ceramicnode.innerverse.care",
    // cast our definition as a RuntimeCompositeDefinition
    definition: definition as RuntimeCompositeDefinition,
  });


useEffect(() => {
  
    if (account) {
      loginComposeDB();
    }
  }, [account]);

  const loginComposeDB = async () => {
    try {
      const sessionStr = sessionStorage.getItem("ceramic:eth_did"); // for production you will want a better place than localStorage for your sessions.
      let session;
      //console.log("Getting sessionStr:", sessionStr);
      if (sessionStr) {
        session = await DIDSession.fromSession(sessionStr);
      }
      //console.log("Getting session:", session);
      if (!session || (session.hasSession && session.isExpired)) {
        if (!providerThirdweb) {
          console.error("Provider is not initialized");
          return;
        }
    
        // Clear existing session
        sessionStorage.removeItem("ceramic:eth_did");
        
        //const oProvider = new BrowserProvider(provider);
        //const signer = await oProvider.getSigner();
        
        // Get the account ID
        let accountId;
        try {
          const address = account?.address || "";
          console.log("Getting account ID for address:", address);
          accountId = await getAccountId(providerThirdweb, address);
          console.log("Account ID obtained:", accountId);
        } catch (error) {
          console.error("Error getting account ID:", error);
          throw new Error(`Failed to get account ID: ${error}`);
        }
    
        // Get auth method
        let authMethod;
        try {
          console.log("Getting auth method for account ID:", accountId);
          
          // Create a properly typed provider wrapper with additional logging
          if (!providerThirdweb) {
            throw new Error("providerThirdweb is not initialized");
          }
          const providerWithMethods = {
            ...providerThirdweb,
            request: async ({ method, params }: { method: string; params?: unknown[] }) => {
              if (!providerThirdweb.request) {
                throw new Error("Provider doesn't implement request method");
              }
              console.log(`Provider request - Method: ${method}, Params:`, params);
              const response = await providerThirdweb.request({ method, params });
              console.log(`Provider response:`, response);
              return response;
            }
          };
    
          authMethod = await EthereumWebAuth.getAuthMethod(
            providerWithMethods,
            accountId
          );
          
          console.log("Auth method obtained successfully");
          console.log('Auth method:', authMethod);
        } catch (error) {
          console.error("Error getting auth method:", error);
          throw new Error(`Failed to get auth method: ${error}`);
        }
    
          // Create DID session
          let session;
          try {
            console.log("Creating DID session...");
            
            // Verify resources
            if (!composeClient.resources || composeClient.resources.length === 0) {
              throw new Error("ComposeDB resources not properly initialized");
            }
            console.log("ComposeDB resources:", composeClient.resources);
            
            // Create session with domain and origin from current window location
            session = await DIDSession.authorize(authMethod, {
              resources: composeClient.resources,
              expiresInSecs: 60 * 60 * 24 * 1, // 1 day
              domain: window.location.hostname,
            });
      
            if (!session || !session.did) {
              throw new Error("Invalid session created");
            }
            
            console.log("DID session created:", {
              id: session.id,
              domain: window.location.hostname,
              origin: window.location.origin
            });
          } catch (error) {
            console.error("Error creating DID session:", error);
            if (error instanceof Error) {
              console.error("Detailed error:", {
                message: error.message,
                stack: error.stack,
                name: error.name
              });
            }
            throw new Error(`Failed to create DID session: ${error}`);
          }
    
        // Store and set session
        try {
          const serializedSession = session.serialize();
          console.log("Session serialized successfully");
          
          // Verify serialized session
          if (typeof serializedSession !== 'string') {
            throw new Error("Invalid session serialization format");
          }
          
          // Store session with additional logging
          console.log("Storing session in sessionStorage...");
          sessionStorage.setItem("ceramic:eth_did", serializedSession);
          
          console.log("Setting DID for clients...");
          composeClient.setDID(session.did);
          ceramic.did = session.did;
          
          console.log("DID setup complete");
          
          setIsConComposeDB(true);

        } catch (error) {
          console.error("Error in final session setup:", error);
          throw new Error(`Failed to setup session: ${error}`);
        }
      } else {
        console.log("Setting DID for clients...");
          composeClient.setDID(session.did);
          ceramic.did = session.did;
          
          console.log("DID setup complete");
          setIsConComposeDB(true);
      }
    } catch (error) {
      console.error("Fatal error in loginComposeDB:", error);
      setIsConComposeDB(false);
      // Rethrow the error to be handled by the caller
      throw error;
    }
  };


const executeQuery = async (query: string) => {
  await loginComposeDB();
  console.log("exec ceramic OBJ", ceramic)
  console.log("exec ComposeDB OBJ", composeClient);
  const update = await composeClient.executeQuery(query);
  console.log("update:", update)
  
  if (update.errors) {
    console.log("errors:");
    console.log(update.errors);
  }
  return update
  //getInnerProfile();
}

const logout = async () => {
  try {
    if (!account) {
      console.info("thirdweb not initialized yet");
      return;
    }
    
    // Clear all state and storage
    //await web3auth.logout();
    //setProvider(null);
    //setIsConected(false);
    setIsConComposeDB(false);
    //setSigner(null);
    //setuserInfo(null);
    setInnerProfile(null);
    
    // Clear storage
    sessionStorage.removeItem("ceramic:eth_did");
    localStorage.removeItem("openlogin_store");
    
    window.location.href = "/";
  } catch (error) {
    console.error("Error during logout:", error);
  }
};


/*  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    /*console.log(user);
    setuserInfo(user);
  }; */

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
                    schedules(filters: {where: {state: {in: [Pending,Active]}}}, last: 100) {
                      edges {
                        node {
                          created
                          date_finish
                          date_init
                          profileId
                          profile {
                            id
                            name
                            displayName
                          }
                          state
                          id
                        }
                      }
                    }
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
        } else {console.log(profile);console.log('innerverProfile is undefined');}

                
    }
   
  };
  

  const contextValue: AppContextType = {    
    //userInfo, 
    isConComposeDB,
    ceramic,
    composeClient,
    innerProfile,
    executeQuery,
    getInnerProfile,
    loginComposeDB,
    logout,
    //getUserInfo
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;

  
};
export default AppProvider;
