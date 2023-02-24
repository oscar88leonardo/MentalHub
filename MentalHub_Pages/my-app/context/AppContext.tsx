import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "../pages/web3RPC";

import React, { createContext, useEffect, useState } from "react";

const clientId = "BKBATVOuFf8Mks55TJCB-XTEbms0op9eKowob9zVKCsQ8BUyRw-6AJpuMCejYMrsCQKvAlGlUHQruJJSe0mvMe0"; // get from https://dashboard.web3auth.io

export const AppContext = createContext(null);

const AppProvider = ({ children }) => {
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

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
  };

  const logout = async () => {
    if (!web3auth) {
      console.info("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    window.location.href = "/";
  };

  return (
    <AppContext.Provider
      value={{ provider, login, logout }}
    >
      {children}
    </AppContext.Provider>
  );
};
export default AppProvider;