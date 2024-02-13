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

const menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  //const router = useRouter();
  const toggle = () => setIsOpen(!isOpen);

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
        </Collapse>
    </div>
  )
}

export default menu