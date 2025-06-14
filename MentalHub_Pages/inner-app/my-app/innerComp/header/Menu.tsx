"use client"
import React, { useEffect, useRef, useState, useContext } from "react";
import {
  Collapse,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { usePathname } from "next/navigation";
import { Link } from "react-scroll";
import { AppContext } from "../../context/AppContext";
import { ConnectButton } from "thirdweb/react";

import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";

import {client as clientThridweb} from "../client";
import { myChain } from "../myChain";
import { useActiveWallet } from "thirdweb/react";

const menu = () => {
  // get global data from Appcontext
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error("useContext must be used within a provider");
  }
  const { logout, isConComposeDB } = context;
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const toggle = () => setIsOpen(!isOpen);
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  /*const clientThridweb = createThirdwebClient({
    clientId: "e7b10fdbf32bdb18fe8d3545bac07a5d",
  });*/
  
  // función para validar autenticación
  const handleAuthenticatedNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!account || !isConComposeDB) {
      setShowAuthWarning(true);
      setTimeout(() => setShowAuthWarning(false), 3000);
      return;
    }
    window.location.href = path;
  };


  type LoginPayload = {
  address: string;
  chain_id?: string;
  domain: string;
  expiration_time: string;
  invalid_before: string;
  issued_at: string;
  nonce: string;
  resources?: Array<string>;
  statement: string;
  uri?: string;
  version: string;
};

  const walletsThirdweb = [
    inAppWallet({
      auth: {
        options: [
          "google",
          "discord",
          "telegram",
          "farcaster",
          "email",
          "x",
          "passkey",
          "phone",
        ],
      }, 
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
  ];

  useEffect(() => {
    renderButton();
  }, []);


  // revisar rutas en app router
  const renderUrl = (AuxSection = "", AuxText = "") => {
    // incluir validación
    if (AuxSection === "NTFCollectSection") {
      return (
        <NavLink
          href="#"
          className="nav-link"
          onClick={(e) => handleAuthenticatedNavigation(e, './#NTFCollectSection')}
        >
          {AuxText}
        </NavLink>
      );
    }
    
    //console.log(pathname);
    var vHref = './#'+AuxSection;
    if (pathname != '/') {
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
        
  const renderButton = () => {
      //console.log("provider:");
      //console.log(provider);
      if (account != null) {
        return (
          <NavLink
            href="./profile"
            className="btn btn-light font-14"
          >
            Profile
          </NavLink>
        );
      } 
  };
  

  return (
    <div>
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
                <NavLink
                  href="#"
                  className="nav-link"
                  onClick={(e) => handleAuthenticatedNavigation(e, './whitelist')}
                >
                  WhiteList
                </NavLink>
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
              {showAuthWarning && (
                <div className="auth-warning" style={{
                  position: 'fixed',
                  top: '20px',
                  right: '20px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '5px',
                  zIndex: 1000
                  }}>
                  Por favor, conecta tu wallet primero
                </div>
              )} 
            <div className="act-buttons">
            <ConnectButton
              client={clientThridweb}
              wallets={walletsThirdweb}
              connectModal={{ size: "compact" }}
              accountAbstraction= {{
                chain: myChain,
                sponsorGas: true, 
              }}
              auth={{
                isLoggedIn: async (address: string) => {
                  // Implement your logic to check if the user is logged in
                  // For now, return false or true as needed
                  return !!account;
                },
                doLogin: async (params) => {
                  console.log("logging in!");
                  //await login(params);
                },
                getLoginPayload: async () => ({
                  address: "0x0000000000000000000000000000000000000000",  // Dirección vacía
                  chain_id: "0x1",  // Ethereum Mainnet (pero no se usará)
                  domain: "dummy",
                  uri: "https://dummy.com",
                  version: "1",
                  nonce: "0",
                  issued_at: new Date().toISOString(),
                  expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
                  invalid_before: new Date().toISOString(),
                  statement: "Sign in to Innerverse",
                  resources: [],
                }),
                doLogout: async () => {
                  console.log("logging out!");
                  await logout();
                },
              }}
            />
            </div>
            <div className="act-buttons">
                {renderButton()}
              </div>       
        </Collapse>
    </div>
  )
}

export default menu

/*



*/