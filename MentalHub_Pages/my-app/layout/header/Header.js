import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import Image from "next/image";
import { Link } from "react-scroll";
import { useRouter } from "next/router";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  Container,
  NavLink,
} from "reactstrap";
import logo from "../../public/LogoMentalHub.png";

const Header = () => {

  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

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
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
      console.log('MetaMask is installed!');
    
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
    
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);

    } catch (err) {
      console.error(err);
    }
  };

  /*
    renderButton: Returns a button based on the state of the dapp
  */
  const renderButton = () => {
    if (walletConnected) {
      return (
        <NavLink
          href="./profile"
          className="btn btn-light font-14"
        >
          Profile
        </NavLink>
      );
    } else {
      return (
        <NavLink
          href="#"
          className="btn btn-light font-14"
          onClick={connectWallet}
        >
          Connect wallet
        </NavLink>
      );
    }
  };

const checkConnect = async () => {
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
};

 useEffect(() => {
  if (typeof window.ethereum !== 'undefined') {
  
   if(typeof window !== 'undefined'){
       window.ethereum.on('accountsChanged', async () => {
        const {ethereum} = window;
        const accounts = ethereum.request({method: 'eth_accounts'});
        if(accounts && accounts.length > 0){
          setWalletConnected(true);
        } else {
          setWalletConnected(false);
        }
      });
    }
    checkConnect();
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        //disableInjectedProvider: false,
        cacheProvider: true,
      });
    } else
      connectWallet();
  } else {
          window.alert("Wellcome Friend!, MentalHub is a web3 application, please install Metamask https://metamask.io/ for full fetures. (working on making this a frictionless experience!) ");
        } 
  }, [walletConnected]);
  
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const toggle = () => setIsOpen(!isOpen);

  const renderUrl = (AuxSection = "", AuxText = "") => {
    console.log(router.pathname);
    var vHref = './#'+AuxSection;
    if (router.pathname != '/') {
      return (
        <NavLink
          href={vHref}
          className="nav-link"
        >
          {AuxText}
        </NavLink>
      );
    } else {
      return (
        <Link to={AuxSection} spy={true} smooth={true} offset={10} duration={500} className="nav-link">
          {AuxText}
        </Link>
      );
    }
  };
  
  return (
    <div className="fixed-top" style={{
        backgroundColor: '#0faba5' 
      }} id="top">
      <div className="header6">
        <Container className="po-relative">
          <Navbar className="navbar-expand-sm h6-nav-bar">
            <NavbarBrand href="/">
              <Image
              width={98}
              height={81}
              src={logo} alt="wrapkit" />
            </NavbarBrand>
            <NavbarToggler onClick={toggle}>
              <span className="ti-menu"></span>
            </NavbarToggler>
            <Collapse
              isOpen={isOpen}
              navbar
              className="hover-dropdown ml-auto"
              id="h6-info"
            >
              <Nav navbar className="ml-auto" >
                <NavItem>
                  {renderUrl("VisionSection","Vision")}
                </NavItem>
                <NavItem>
                  {renderUrl("DescriptionSection","Description")}
                </NavItem>
                <NavItem>
                  {renderUrl("NTFCollectSection","Digital Collections")}
                </NavItem>
                <NavItem>
                  <a href="./whitelist" className="nav-link">
                    WhiteList
                  </a>
                </NavItem>
                <NavItem>
                  {renderUrl("PartnersSection","Partners")}
                </NavItem>
                <NavItem>
                  {renderUrl("RoadMapSection","RoadMap")}
                </NavItem>
                <NavItem>
                  {renderUrl("FAQsSection","FAQs")}
                </NavItem>
              </Nav>
              <div className="act-buttons">
                {renderButton()}
              </div>
            </Collapse>
          </Navbar>
        </Container>
      </div>
    </div>
  );
};

export default Header;
