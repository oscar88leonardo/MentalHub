"use client"
import Head from "next/head";
import { Row, Col, Container, Alert } from "reactstrap";
import Image from "next/image";
import herobanner from "../../public/banner2.png";
import styles from "../styles/Home.module.css";
//import Web3Modal from "web3modal";
import { Contract } from "ethers";
import { BrowserProvider } from "ethers/providers";

import { AppContext } from "../../context/AppContext";

import { useEffect, useRef, useState,useContext } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../../constants/whitelist";

export default function Home() {
  
  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  const { provider, signer, getSigner, isConComposeDB } = context;

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
    if(isConComposeDB){
      getSigner();
    }
  },[isConComposeDB]);

  useEffect(() => {
    if(signer != null){
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    }
  },[signer]);

  /**
   * addAddressToWhitelist: Adds the current connected address to the whitelist
   */
  const addAddressToWhitelist = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      //const signer = await getProviderOrSigner(true);
      /*const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
      const signer = await provider0.getSigner();*/
      //await getPrivateKey();
      /*console.log('PrivateKey:');
      console.log(PrivateKey);
      const signer = new Wallet(PrivateKey,provider0);*/
      if(signer != null) {
        console.log('signer:');
        console.log(signer);
        // Create a new instance of the Contract with a Signer, which allows
        // update methods

        //await provider.getFeeData();
        /*await sendTransaction(WHITELIST_CONTRACT_ADDRESS,
        "5000000000",
        "6000000000000",
        "0");
        //await trs.wait();
        console.log('pasa sendTransaction');*/
        // call the addAddressToWhitelist from the contract
        /*const destination = WHITELIST_CONTRACT_ADDRESS;
        const amount = utils.parseEther("0"); // Convert 1 ether to wei
        console.log('back transaction');
        // Submit transaction to the blockchain
        const tx0 = await signer.signTransaction({ // .sendTransaction({
          from: signer.getAddress(),
          to: destination,
          value: amount,
          maxPriorityFeePerGas: "5000000000", // Max priority fee per gas
          maxFeePerGas: "6000000000000", // Max fee per gas
        });
        console.log('next transaction');
        //await tx0.wait();
        console.log('post transaction');*/

        const whitelistContract = new Contract(
          WHITELIST_CONTRACT_ADDRESS,
          abi,
          signer
        );
        console.log('pasa new Contract');
        /*const amount = utils.parseEther("0");
        const estimatedGasLimit = await whitelistContract.estimateGas.addAddressToWhitelist();
        //const withSigner = whitelistContract.connect(signer);
        const tx = await whitelistContract.populateTransaction.addAddressToWhitelist();
        console.log('pasa populateTransaction');
        tx.chainId = 599;
        tx.gasLimit = estimatedGasLimit;
        tx.gasPrice = await provider0.getGasPrice();
        tx.nonce = await provider0.getTransactionCount(signer.getAddress());
        //tx.maxFeePerGas = utils.parseUnits('50','gwei');
        
        console.log('pasa tx');
        console.log(tx);

        const txSigned = await signer.signTransaction(tx);
        console.log('pasa signTransaction');
        const wallet = signer.connect(provider0);
        const submittedTx = await wallet.sendTransaction(tx);
        //const submittedTx = await provider0.sendTransaction(txSigned);
        console.log('pasa sendTransaction');
        setLoading(true);
        console.log('pasa addAddressToWhitelist');
        const Receipt = await submittedTx.wait();
        if (Receipt.status === 0)
            throw new Error("Approve transaction failed");*/
        
        /*const response = await signer.signTransaction(tx);
        console.log('pasa response');
        console.log(response);
        const wallet = signer.connect(provider0);
        await wallet.sendTransaction(tx);
        setLoading(true);
        console.log('pasa addAddressToWhitelist');*/
        setLoading(true);
        const tx = await whitelistContract.addAddressToWhitelist();
        // wait for the transaction to get mined
        console.log('pasa addAddressToWhitelist');
        await tx.wait();
        console.log('pasa tx.wait()');
        setLoading(false);
        console.log('pasa wait');
        // get the updated number of addresses in the whitelist
        await getNumberOfWhitelisted();
        setJoinedWhitelist(true);
        console.log('pasa setJoinedWhitelist');
      }
    } catch (err) {
      console.error(err);
      //console.error(err.code);
      //console.error(err.message);
      alert('Proccess failed, check your funds.');
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
      if(provider != null) {
        const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
        /*const signer = await provider0.getSigner();
        console.log('signer:');
        console.log(signer);*/
        const whitelistContract = new Contract(
          WHITELIST_CONTRACT_ADDRESS,
          abi,
          provider0
        );
        // call the numAddressesWhitelisted from the contract
        console.log("whitelistContract:");
        console.log(whitelistContract);
        const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
        console.log("_numberOfWhitelisted:");
        console.log(_numberOfWhitelisted);
        setNumberOfWhitelisted(Number(_numberOfWhitelisted));
      }
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
      /*const provider0 = new BrowserProvider(provider);//new providers.Web3Provider(provider);
      //const provider0 = new providers.Web3Provider(provider);
      const signer = await provider0.getSigner();*/
      if(signer != null) {
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
        console.log("_joinedWhitelist:");
        console.log(_joinedWhitelist);
        setJoinedWhitelist(_joinedWhitelist);
      }
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
    if (isConComposeDB) {
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
        <title>MentalHub | Whitelist</title>
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
