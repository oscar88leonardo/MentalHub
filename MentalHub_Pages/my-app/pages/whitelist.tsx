import Head from "next/head";
import { Row, Col, Container } from "reactstrap";
import Image from "next/image";
import herobanner from "../public/banner2.png";
import styles from "../styles/Home.module.css";
//import Web3Modal from "web3modal";
import { providers, Contract, utils } from "ethers";

import { AppContext } from "../context/AppContext";

import { useEffect, useRef, useState,useContext } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants/whitelist";

export default function Home() {
  
  const { provider } = useContext(AppContext);

  // walletConnected keep track of whether the user's wallet is connected or not
  //const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // numberOfWhitelisted tracks the number of addresses's whitelisted
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  //const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  /*const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
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

  useEffect(() => {
    if(provider){
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    }
  },[provider]);

  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      //const signer = await getProviderOrSigner(true);
      const provider0 = new providers.Web3Provider(provider);
      const signer = provider0.getSigner();
      console.log('signer:');
      console.log(signer);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      console.log('pasa new Contract');
      // call the addAddressToWhitelist from the contract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      console.log('pasa addAddressToWhitelist');
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      console.log('pasa wait');
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
      console.log('pasa setJoinedWhitelist');
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getNumberOfWhitelisted:  gets the number of whitelisted addresses
   */
  const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      //const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const provider0 = new providers.Web3Provider(provider);
      const signer = provider0.getSigner();
      console.log('signer:');
      console.log(signer);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider0
      );
      // call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkIfAddressInWhitelist: Checks if the address is in whitelist
   */
  const checkIfAddressInWhitelist = async () => {
    try {
      // We will need the signer later to get the user's address
      // Even though it is a read transaction, since Signers are just special kinds of Providers,
      // We can use it in it's place
      //const signer = await getProviderOrSigner(true);
      const provider0 = new providers.Web3Provider(provider);
      const signer = provider0.getSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      // call the whitelistedAddresses from the contract
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  /*const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);

      if(typeof window !== 'undefined'){
           window.localStorage.setItem("IsConnectWallet",true);
      }

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };*/

  /*
    renderButton: Returns a button based on the state of the dapp
  */
  const renderButton = () => {
    if (provider) {
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
    } /*else {
      return (
        <a
          className="btn btn-light btn-rounded btn-md m-t-20"
          data-toggle="collapse"
          href="#"
          onClick={connectWallet}
        >
          <span>Connect your wallet</span>
        </a>
      );
    }*/
  };

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
};*/

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  /*useEffect(() => {
    if (typeof window.ethereum !== 'undefined'){
    checkConnect();
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
    connectWallet();
  } else {
    window.alert("Wellcome Friend!, MentalHub is a web3 application, please install Metamask https://metamask.io/ for full fetures. (working on making this a frictionless experience!) ");
  }
  }, [walletConnected]);*/

  return (
    <div>
      <Head>
        <title>Mental Hub | Whitelist</title>
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
                {numberOfWhitelisted} have already joined the Whitelist.
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
