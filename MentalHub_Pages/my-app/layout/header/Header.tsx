import React, { useEffect, useRef, useState, useContext } from "react";
/*import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";*/

import { AppContext } from "../../context/AppContext";

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
  
  const { provider, login, logout } = useContext(AppContext);

  useEffect(() => {
    renderButton();
  }, [provider]);

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
          href="#"
          className="btn btn-light font-14"
          onClick={login}
        >
          Connect wallet
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
  
  const renderLogout = () => {
    return (
      <NavLink
        href="#"
        className="btn btn-light font-14"
        onClick={logout}
      >
        Logout
      </NavLink>
    )
  }

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
              <div className="act-buttons">
                {provider ? renderLogout():''}
                </div>
            </Collapse>
          </Navbar>
        </Container>
      </div>
    </div>
  );
};

export default Header;
