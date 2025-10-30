"use client"
import React, { useEffect, useState, useContext } from "react";
import { usePathname } from "next/navigation";
import { Link } from "react-scroll";
//import { AppContext } from "../../context/AppContext";
//import { ConnectButton } from "thirdweb/react";
import "./Header.css";

/*import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";*/

//import {client as clientThridweb} from "../client";
//import { myChain } from "../myChain";
//import { useActiveWallet } from "thirdweb/react";

const Menu = () => {
  // get global data from Appcontext
  //const context = useContext(AppContext);
  //if (context === null) {
  //  throw new Error("useContext must be used within a provider");
  //}
  //const { logout, isConComposeDB } = context;
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const toggle = () => {
    console.log('Toggle clicked! Current isOpen:', isOpen);
    setIsOpen(!isOpen);
    console.log('New isOpen will be:', !isOpen);
  };
  //const activeWallet = useActiveWallet();
  //const account = activeWallet ? activeWallet.getAccount() : null;
 // const [showAuthWarning, setShowAuthWarning] = useState(false);
  const INNER_APP_URL = process.env.NEXT_PUBLIC_INNER_APP_URL || '/inner-app/my-dapp';
  
  /* función para validar autenticación
  const handleAuthenticatedNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setIsOpen(false); // Cerrar menú móvil al navegar
    if (!account || !isConComposeDB) {
      setShowAuthWarning(true);
      setTimeout(() => setShowAuthWarning(false), 3000);
      return;
    }
    window.location.href = path;
  };*/

  // Cerrar menú cuando se hace click en un link
  const handleLinkClick = () => {
    setIsOpen(false);
  };

/*  const walletsThirdweb = [
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
  ];*/

  useEffect(() => {
    //renderButton();
    
    // Cerrar menú móvil cuando cambie el tamaño de ventana
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // revisar rutas en app router
  const renderUrl = (AuxSection = "", AuxText = "") => {
    // incluir validación
    if (AuxSection === "NTFCollectSection") {
      return (
        <a
          href="#"
          className="menu-link"
          onClick={(e) => {
            handleLinkClick();
            /*handleAuthenticatedNavigation(e, './#NTFCollectSection');*/
          }}
        >
          {AuxText}
        </a>
      );
    }
    
    const vHref = './#'+AuxSection;
    if (pathname != '/') {
      return (
        <a
          href={vHref}
          className="menu-link"
          onClick={handleLinkClick}
        >
          {AuxText}
        </a>
      );
    } else {
      return (
        <Link 
          to={AuxSection} 
          spy={true} 
          smooth={true} 
          offset={10} 
          duration={500} 
          className="menu-link"
          onClick={handleLinkClick}
        >
          {AuxText}
        </Link>
      );
    }
  };
        
  /*const renderButton = () => {
      if (account != null) {
        return (
          <a
            href="./profile"
            style={{
              backgroundColor: 'white',
              color: '#6666ff',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Profile
          </a>
        );
      } 
  };*/
  

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
        {/* Desktop Menu - Visible en desktop */}
        <div className="desktop-menu">
            {renderUrl("VisionSection","Vision")}
            {renderUrl("DescriptionSection","Description")}
            {/*renderUrl("NTFCollectSection","Digital Collections")*/}
            {/*<a
              href="#"
              className="menu-link"
              onClick={(e) => handleAuthenticatedNavigation(e, './whitelist')}
            >
              WhiteList
            </a>
            <a
              href="/dao"
              className="menu-link"
              onClick={handleLinkClick}
            >
              DAO
            </a> */}
            {renderUrl("PartnersSection","Partners")}
            {renderUrl("RoadMapSection","RoadMap")}
            {renderUrl("FAQsSection","FAQs")}
            <a
              href={INNER_APP_URL}
              className="menu-link menu-cta"
              onClick={handleLinkClick}
              target="_blank"
              rel="noopener noreferrer"
            >
              Inner App
            </a>
        </div>

        {/* Mobile Menu Button - Solo visible en móvil */}
        <button
          onClick={toggle}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          style={{
            display: 'block',
            border: 'none',
            color: 'white',
            background: isOpen ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            transition: 'background-color 0.2s ease',
            zIndex: 1001
          }}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
        


        {/* Mobile Menu - Drawer style */}
        {isOpen && (
          <div 
            className="mobile-menu"
            style={{
              display: 'block' // Solo controlamos display, el resto lo maneja CSS
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem'
            }}>
                {renderUrl("VisionSection","Vision")}
                {renderUrl("DescriptionSection","Description")}
                {/*{renderUrl("NTFCollectSection","Digital Collections")}*/}
                {/*<a
                  href="#"
                  className="menu-link"
                  onClick={(e) => handleAuthenticatedNavigation(e, './whitelist')}
                >
                  WhiteList
                </a>
                <a
                  href="/dao"
                  className="menu-link"
                  onClick={handleLinkClick}
                >
                  DAO
                </a>*/}
                {renderUrl("PartnersSection","Partners")}
                {renderUrl("RoadMapSection","RoadMap")}
                {renderUrl("FAQsSection","FAQs")}
                <a
                  href={INNER_APP_URL}
                  className="menu-link menu-cta"
                  onClick={handleLinkClick}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Inner App
                </a>
            </div>
          </div>
        )}
        {/* Auth Warning - Solo visible en móvil 
        {showAuthWarning && (
          <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', zIndex: 50 }}>
            Por favor, conecta tu wallet primero
          </div>
        )} 
      */}

        {/* Wallet Connection 
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ConnectButton
              client={clientThridweb}
              wallets={walletsThirdweb}
              connectModal={{ size: "compact" }}
              accountAbstraction= {{
                chain: myChain,
                sponsorGas: true, 
              }}
              auth={{
                isLoggedIn: async () => {
                  return !!account;
                },
                doLogin: async () => {
                  console.log("logging in!");
                },
                getLoginPayload: async () => ({
                  address: "0x0000000000000000000000000000000000000000",
                  chain_id: "0x1",
                  domain: "dummy",
                  uri: "https://dummy.com",
                  version: "1",
                  nonce: "0",
                  issued_at: new Date().toISOString(),
                  expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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
        */}

        {/* Profile Button 
        <div style={{ marginLeft: '1rem' }}>
            {renderButton()}
        </div>*/}
    </div>
    
  )
}

export default Menu;