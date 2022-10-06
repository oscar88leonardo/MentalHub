import React, { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const toggle = () => setIsOpen(!isOpen);
  return (
    <div className="fixed-top" style={{
        backgroundColor: '#6521ff'
      }} id="top">
      <div className="header6">
        <Container className="po-relative">
          <Navbar className="navbar-expand-sm h6-nav-bar">
            <NavbarBrand href="/">
              <Image
              width={140}
              height={70}
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
                  <Link to="VisionSection" spy={true} smooth={true} offset={10} duration={500} className="nav-link">
                    Vision
                  </Link>
                </NavItem>
                <NavItem>
                  <Link to="DescriptionSection" spy={true} smooth={true} offset={10} duration={500} className="nav-link">
                    Description
                  </Link>
                </NavItem>
                <NavItem>
                  <Link to="NTFCollectSection" spy={true} smooth={true} offset={10} duration={500} className="nav-link">
                    NFT Collections
                  </Link>
                </NavItem>
                <NavItem>
                  <Link to="PartnersSection" spy={true} smooth={true} offset={10} duration={500} className="nav-link">
                    Partners
                  </Link>
                </NavItem>
                <NavItem>
                  <Link to="RoadMapSection" spy={true} smooth={true} offset={10} duration={500} className="nav-link">
                    RoadMap
                  </Link>
                </NavItem>
                <NavItem>
                  <Link to="FAQsSection" spy={true} smooth={true} offset={10} duration={500} className="nav-link">
                    FAQs
                  </Link>
                </NavItem>
                <NavItem>
                  <a href="/profile" className="nav-link">
                    Profile
                  </a>
                </NavItem>
              </Nav>
              <div className="act-buttons">
                <NavLink
                  href="https://wrappixel.com/templates/nextkit-nextjs-free-uikit"
                  className="btn btn-light font-14"
                  target="_blank"
                >
                  Connect Wallet
                </NavLink>
              </div>
            </Collapse>
          </Navbar>
        </Container>
      </div>
    </div>
  );
};

export default Header;
