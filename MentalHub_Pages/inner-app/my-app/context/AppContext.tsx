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

//import { createThirdwebClient,defineChain } from "thirdweb";
//import { ConnectButton } from "thirdweb/react";
//import { createWallet, inAppWallet, privateKeyToAccount,smartWallet } from "thirdweb/wallets";
import { useActiveWallet, useAdminWallet } from "thirdweb/react";
import type { Wallet, WalletId, Account } from "thirdweb/wallets";
import {client as clientThridweb} from "../innerComp/client";
import { EIP1193 } from "thirdweb/wallets";
import { myChain } from "../innerComp/myChain";
import { set } from "react-datepicker/dist/date_utils";

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
  activeWallet: Wallet<WalletId> | undefined; // Use the correct type for active wallet
  account: Account | undefined; // Use the correct type for account
  adminWallet: Wallet<WalletId> | undefined; // Use the correct type for admin wallet
  adminAccount: Account | undefined; // Use the correct type for admin account
  //arrTokenIds: string[] | undefined; // Use the correct type for token IDs array
  //setArrayTokenIds: React.Dispatch<React.SetStateAction<string[] | undefined>>; // Add setter for token IDs array
  userNFTs: NFTSession[]; // Array of user NFTs
  setUserNFTs: React.Dispatch<React.SetStateAction<NFTSession[]>>; // Add setter for user NFTs
  //setArrayTokenIds: React.Dispatch<React.SetStateAction<NFTSession[] | undefined>>;
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

// Define the NFTSession interface
interface NFTSession {
  tokenId: number;
  availableSessions: number;
}

export const AppContext = createContext<AppContextType | null>(null);
//export const AppContext = createContext(null);

const AppProvider = ({children,}: Readonly<{children: React.ReactNode;}>) => 
{
  const [isConComposeDB, setIsConComposeDB] = useState(false);
  const [innerProfile, setInnerProfile] = useState<InnerverProfile | null>(null);
  const [ceramicClient, setCeramicClient]=useState<CeramicClient | null>(null);
  const [composeDBClient, setComposeDBClient] = useState<ComposeClient | null>(null);
  const [arrayTokenIds, setArrayTokenIds] = useState<NFTSession[] | undefined>(undefined);
  // estados para validación de NFT
  const [userNFTs, setUserNFTs] = useState<NFTSession[]>([]);
  // define thirdweb hook 
  //const activeWallet = useActiveWallet();
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : undefined;
  const adminWallet = useAdminWallet();
  const adminAccount = adminWallet ? adminWallet.getAccount() : undefined;
  
  const providerThirdweb = adminWallet
    ? EIP1193.toProvider({
        wallet: adminWallet,
        chain: myChain,
        client: clientThridweb,
      })
    : null;
  
   // initialize ceramic & composeDB
  useEffect(() => {
    const initCeramicClients = () => {
      const ceramic = new CeramicClient("https://ceramicnode.innerverse.care");      
      const compose = new ComposeClient({
            ceramic: "https://ceramicnode.innerverse.care",
            // cast our definition as a RuntimeCompositeDefinition
            definition: definition as RuntimeCompositeDefinition,
          });

      setCeramicClient(ceramic);
      setComposeDBClient(compose);    
    };

    initCeramicClients();

  }, []);


// lllamdo a login composeDB cuando se detecta una cuenta y los clientes de Ceramic y ComposeDB están listo
useEffect(() => {
  
    if (account && ceramicClient && composeDBClient) {
      const initAuth = async () => {
      try {
        console.log("Account detected:", account);
        // Esperar a que ThirdWeb esté listo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log("Ceramic and ComposeDB clients ready, attempting loginComposeDB");
        await loginComposeDB();
      } catch (error) {
        console.error("init logincomposeDB error:", error);
      }
    };
      initAuth();
    }
  }, [account, ceramicClient, composeDBClient]);

  const loginComposeDB = async () => {
    try {
      if( !ceramicClient || !composeDBClient) {
        throw new Error("Ceramic clients not initialized");
      }

      if (isConComposeDB){
        console.log("Already connected to ComposeDB");
        return; // Already connected, no need to re-login
      }

      if (!account){
        throw new Error("No account detected. Connect your wallet first.");  
      }

      const sessionStr = sessionStorage.getItem("ceramic:eth_did"); // for production you will want a better place than localStorage for your sessions.
      let session;
      console.log("LoginComposeDB sessionStr:", sessionStr);
      if (sessionStr) {
        session = await DIDSession.fromSession(sessionStr);
        console.log("Getting session:", session);
      }
      
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
          const address = adminAccount?.address || "";
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
            //providerWithMethods,
            providerThirdweb,
            accountId,           
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
            if (!composeDBClient.resources || composeDBClient.resources.length === 0) {
              throw new Error("ComposeDB resources not properly initialized");
            }
            console.log("ComposeDB resources:", composeDBClient.resources);
            
            // Create session with domain and origin from current window location
            session = await DIDSession.authorize(authMethod, {
              resources: composeDBClient.resources,
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
          
          composeDBClient.setDID(session.did);
          ceramicClient.did = session.did;
          setIsConComposeDB(true);
          console.log("DID setup complete");

        } catch (error) {
          console.error("Error in final session setup:", error);
          throw new Error(`Failed to setup session: ${error}`);
        }
      } else {
        console.log("Setting DID for clients...");
          composeDBClient.setDID(session.did);
          ceramicClient.did = session.did;
          setIsConComposeDB(true);
          console.log("DID setup complete");
      }
    } catch (error) {
      console.error("Error in loginComposeDB:", error);
      setIsConComposeDB(false);
      throw error;
    }
  };


const executeQuery = async (query: string) => {
  await loginComposeDB();
  console.log("exec ceramic OBJ", ceramicClient)
  console.log("exec ComposeDB OBJ", composeDBClient);
  const update = await composeDBClient?.executeQuery(query);
  console.log("update:", update)
  
  if (update?.errors) {
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
    //await loginComposeDB(); 
    /* 
    if (account != null) {
      let accountId = await getAccountId(providerThirdweb, account.address);
      console.log("accountId:");
      console.log(accountId);

      let authMethod = await EthereumWebAuth.getAuthMethod(
            providerThirdweb,
            accountId
          );
      console.log("authMethod:");
      console.log(authMethod);

      let session = await DIDSession.authorize(authMethod, {
              resources: composeClient.resources,
              expiresInSecs: 60 * 60 * 24 * 7, // 1 week
              domain: window.location.hostname,
            });
      console.log("session:");
      console.log(session);
      composeClient.setDID(session.did);
      ceramic.did = session.did;
    } 
    */
  try{ 
    if (!ceramicClient?.did) {
        console.log("Waiting for Ceramic initialization...");
        await loginComposeDB();
      }

    if (!composeDBClient) {
      throw new Error("ComposeDB client not initialized");
    }

    const profile : ProfileQueryResult = await composeDBClient.executeQuery(`
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
                          NFTContract
                          TokenID
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
                    NFTContract
                    TokenID
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
      } else {
        console.log(profile);console.log('innerverProfile is undefined');
      }                    
    } catch (error) {
      console.error("Error in getInnerProfile:", error); 
      throw error; 
    }  
  };
  

  const contextValue: AppContextType = {    
    //userInfo, 
    isConComposeDB,
    ceramic: ceramicClient!,
    composeClient: composeDBClient!,
    innerProfile,
    activeWallet,
    account,
    adminWallet,
    adminAccount,
    userNFTs,
    setUserNFTs,
    //arrTokenIds: arrayTokenIds,
    //setArrayTokenIds,
    executeQuery,
    getInnerProfile,
    loginComposeDB,
    logout
    //getUserInfo
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;

  
};
export default AppProvider;
