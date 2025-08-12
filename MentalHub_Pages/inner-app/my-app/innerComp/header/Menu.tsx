"use client"
import React, { useEffect, useState, useContext } from "react";
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

const Menu = () => {
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
        <a
          href="#"
          style={{
            color: 'var(--muted)',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            fontWeight: '500',
            transition: 'color 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
          onClick={(e) => handleAuthenticatedNavigation(e, './#NTFCollectSection')}
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
          style={{
            color: 'var(--muted)',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            fontWeight: '500',
            transition: 'color 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
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
          style={{
            color: 'var(--muted)',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            fontWeight: '500',
            transition: 'color 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
        >
          {AuxText}
        </Link>
      );
    }
  };
        
  const renderButton = () => {
      if (account != null) {
        return (
          <a
            href="./profile"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
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
  };
  

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
        {/* Desktop Menu - Siempre visible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
            {renderUrl("VisionSection","Vision")}
            {renderUrl("DescriptionSection","Description")}
            {renderUrl("NTFCollectSection","Digital Collections")}
            <a
              href="#"
              style={{
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                fontWeight: '500',
                transition: 'color 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
              onClick={(e) => handleAuthenticatedNavigation(e, './whitelist')}
            >
              WhiteList
            </a>
            {renderUrl("PartnersSection","Partners")}
            {renderUrl("RoadMapSection","RoadMap")}
            {renderUrl("FAQsSection","FAQs")}
        </div>

        {/* Mobile Menu Button - Solo visible en móvil */}
        <button
          onClick={toggle}
          style={{
            display: 'none',
            border: 'none',
            color: 'var(--text)',
            background: 'none',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
          className="mobile-menu-btn"
        >
            <span className="ti-menu" style={{ fontSize: '1.25rem' }}></span>
        </button>

        {/* Mobile Menu - Drawer style */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            zIndex: 1000
          }} className="mobile-menu">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {renderUrl("VisionSection","Vision")}
                {renderUrl("DescriptionSection","Description")}
                {renderUrl("NTFCollectSection","Digital Collections")}
                <a
                  href="#"
                  style={{
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    fontWeight: '500',
                    transition: 'color 0.2s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
                  onClick={(e) => handleAuthenticatedNavigation(e, './whitelist')}
                >
                  WhiteList
                </a>
                {renderUrl("PartnersSection","Partners")}
                {renderUrl("RoadMapSection","RoadMap")}
                {renderUrl("FAQsSection","FAQs")}
            </div>
          </div>
        )}

        {showAuthWarning && (
          <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', zIndex: 50 }}>
            Por favor, conecta tu wallet primero
          </div>
        )} 

        {/* Wallet Connection */}
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
                isLoggedIn: async (address: string) => {
                  return !!account;
                },
                doLogin: async (params) => {
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

        {/* Profile Button */}
        <div style={{ marginLeft: '1rem' }}>
            {renderButton()}
        </div>
    </div>
  )
}

export default Menu;