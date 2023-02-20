import React, { useEffect, useRef, useState } from "react";
/*import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";*/

import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "../../pages/web3RPC";

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

const clientId = "BKBATVOuFf8Mks55TJCB-XTEbms0op9eKowob9zVKCsQ8BUyRw-6AJpuMCejYMrsCQKvAlGlUHQruJJSe0mvMe0"; // get from https://dashboard.web3auth.io

const Header = () => {

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

  /*
    renderButton: Returns a button based on the state of the dapp
  */
  const renderButton = () => {
    if (provider) {
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
          onClick={login}
        >
          Connect wallet
        </NavLink>
      );
    }
  };

  const loggedInView = (
    <NavLink
          href="./profile"
          className="btn btn-light font-14"
        >
          Profile
        </NavLink>
  );

  const unloggedInView = (
    <NavLink
      href="./profile"
      className="btn btn-light font-14"
    >
      Profile
    </NavLink>
  );

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
                {provider ? loggedInView : unloggedInView}
              </div>
            </Collapse>
          </Navbar>
        </Container>
      </div>
    </div>
  );
};

export default Header;
