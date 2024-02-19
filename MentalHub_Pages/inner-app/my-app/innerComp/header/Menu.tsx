"use client"
import React, { useEffect, useRef, useState, useContext } from "react";
import {
  Collapse,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
//import { useRouter } from "next/router";
import { Link } from "react-scroll";
import { AppContext } from "../../context/AppContext";


const menu = () => {
  const { provider, login, logout } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  //const router = useRouter();
  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    renderButton();
  }, [provider]);


  // revisar rutas en app router
    const renderUrl = (AuxSection = "", AuxText = "") => {
        /*
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
            */
            return (
            <Link to={AuxSection} spy={true} smooth={true} offset={10} duration={500} className="nav-link">
                {AuxText}
            </Link>
            );
       // }
    }; 
        
    const renderButton = () => {
      console.log("provider:");
      //console.log(provider.state);  
      console.log(provider);

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
                {renderButton()}
              </div>
              <div className="act-buttons">
                {provider ? renderLogout():''}
                
              </div>          
        </Collapse>
    </div>
  )
}

export default menu