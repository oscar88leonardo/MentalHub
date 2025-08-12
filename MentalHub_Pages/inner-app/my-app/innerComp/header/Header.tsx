import React from "react";
import Image from "next/image";
import Menu from "./Menu";
import logo from "../../public/LogoMentalHub.png";

const Header = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem 0',
            color: 'white'
        }} id="top">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Image
                            width={98}
                            height={81}
                            src={logo} 
                            alt="MentalHub Logo"
                        />
                        <span style={{ marginLeft: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            MENTALHUB
                        </span>
                    </div>  
                    <Menu/>
                </div>
            </div>
        </div>
    );
}

export default Header;
