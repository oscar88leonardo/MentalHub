import Image from "next/image";
import { Link } from "react-scroll";
//import { useRouter } from "next/navigation"; cambia con respecto a next/router
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

import Menu from "./Menu";
import logo from "../../public/LogoMentalHub.png";

const Header = () => {

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
                <Menu/>
              </Navbar>
            </Container>
          </div>
        </div>
      );

}

export default Header;
