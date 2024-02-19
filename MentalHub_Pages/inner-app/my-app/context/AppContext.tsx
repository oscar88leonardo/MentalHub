"use client"
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "./ethersRPC";

import React, { createContext, useEffect, useState } from "react";

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

      } catch (error) {
        console.error(error);
      }
    };

    init();

  }, []);
   

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if(web3authProvider)
      setIsConected(true);
    else
      setIsConected(false);
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
    //setisConnectOrbis(false);
    //setUserOrbis(null);
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

  return (
    <AppContext.Provider
      value={{ provider,
              AddressWeb3, 
              userInfo, 
              PrivateKey,
              isConnected,
              login, 
              logout, 
              getUserInfo
            }}
    >
      {children}
    </AppContext.Provider>
  );
};
export default AppProvider;
