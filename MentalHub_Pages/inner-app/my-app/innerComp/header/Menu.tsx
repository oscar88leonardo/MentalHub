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

import { createThirdwebClient } from "thirdweb";
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
  const { provider, isConComposeDB, login, logout } = context;
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const toggle = () => setIsOpen(!isOpen);
  const activeWallet = useActiveWallet();
  const account = activeWallet ? activeWallet.getAccount() : null;
  /*const clientThridweb = createThirdwebClient({
    clientId: "e7b10fdbf32bdb18fe8d3545bac07a5d",
  });*/
  
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
    renderLogout();
  }, [isConComposeDB]);


  // revisar rutas en app router
  const renderUrl = (AuxSection = "", AuxText = "") => {
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
  
    const renderLogout = () => {
      if (isConComposeDB) {
        return (
          <NavLink
            href="#"
            className="btn btn-light font-14"
            onClick={logout}
          >
            Logout
          </NavLink>
        );
      } else {
        return;
      }
  }

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
            <ConnectButton
              client={clientThridweb}
              wallets={walletsThirdweb}
              connectModal={{ size: "compact" }}
              accountAbstraction= {{
                chain: myChain,
                sponsorGas: true, 
              }}
            />
            </div>
            <div className="act-buttons">
                {renderButton()}
              </div>
              <div className="act-buttons">
                {renderLogout()}
                
              </div>          
        </Collapse>
    </div>
  )
}

export default menu