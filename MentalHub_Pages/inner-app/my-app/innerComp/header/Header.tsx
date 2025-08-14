import React from "react";
import Image from "next/image";
import Menu from "./Menu";
import logo from "../../public/innerverse-logo.png";
import "./Header.css";

const Header = () => {
    return (
        <div className="header-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#6666ff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.75rem 0',
            color: 'white',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }} id="top">
            <div className="header-content">
                <div className="header-flex">
                    <div className="logo-container">
                        <Image
                            width={0}
                            height={0}
                            sizes="100vw"
                            src={logo} 
                            alt="Innerverse Logo"
                            className="header-logo"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>  
                    <Menu/>
                </div>
            </div>
        </div>
    );
}

export default Header;
