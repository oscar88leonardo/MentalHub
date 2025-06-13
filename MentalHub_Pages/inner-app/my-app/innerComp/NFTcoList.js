"use client"
/* eslint-disable */
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useActiveWallet } from "thirdweb/react";
import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import Link from 'next/link';
//import NFTCarrousel from "../MentalComponents/NFTCarrousel";

const NFTcoList = () => {


    const [showAuthWarning, setShowAuthWarning] = useState(false);

    // Obtener contexto y wallet
    const context = useContext(AppContext);
    if (context === null){
        throw new Error("useContext must be used within a provider");
    }
    const { isConComposeDB } = context;
    const activeWallet = useActiveWallet();
    const account = activeWallet ? activeWallet.getAccount () : null;

  

    const  NFTColInfo = [

        {animation:"/NFT_CollPreview/MembersPreview.mp4", title:"MentalHub Member", 
        Author_url:'"https://www.instagram.com/pila_mental_/"', Author_id:"@m3ntal_hub",
        Link:"/NFTCol0"},

        {animation:"/NFT_CollPreview/AnsiedadPreview.mp4", title:"It's not you, it's your anxiety", 
         Author_url:"https://www.instagram.com/pila_mental_/", Author_id:"@pila_mental_",
         Link:"/NFTCol1"}
    ]

    
    const handleLinkClick = (e, path) => {
            if (!account || !isConComposeDB) {
                e.preventDefault();
                setShowAuthWarning(true);
                setTimeout(() => setShowAuthWarning(false), 3000);
                return;
            } 
        // si está autenticado, realizar la navegacion programaticamente 
        window.location.href = path;  
    }; 
    
    useEffect( () => {
        console.log("Estado showAuthWarning:", showAuthWarning);
    }, [showAuthWarning])
    ;

    const renderNFTgals = (NFTcol, index) => {
         return(
            <div className="col-lg-6" key={index}>
                <div className='player-wrapper'>
                    <div 
                    onClick={(e) => handleLinkClick(e, NFTcol.Link)}
                    style={{ cursor: 'pointer' }}
                    >
                        <video 
                            autoPlay 
                            muted 
                            loop 
                            src={NFTcol.animation}
                            width='100%'
                            height='100%'
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                </div>
                <Col md="12">
                        <div className="p-t-10">
                            <h5 className="title font-medium">
                                <div 
                                onClick={(e) => handleLinkClick(e, NFTcol.Link)}
                                style={{ cursor: 'pointer', position: 'relative' }}
                                >
                                {NFTcol.title}
                                {!account && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        fontSize: '18px',
                                        color: '#ff4444'
                                    }}>
                                        🔒
                                    </span>
                                )}
                            </div>
                        </h5>
                        <h6 className="subtitle">
                            By <a href={NFTcol.Author_url} target="_blank" rel="noopener noreferrer">
                                {NFTcol.Author_id}
                            </a>
                        </h6>
                    </div>
                </Col>                    
            </div>
        );
        
    };

       
    

    return (
        <>    
            {showAuthWarning && (
                        <div 
                            className="auth-warning" 
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(255, 68, 68, 0.95)',
                                color: 'white',
                                padding: '20px 30px',
                                borderRadius: '8px',
                                zIndex: 99999,
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                minWidth: '300px',
                                animation: 'fadeIn 0.3s ease-in'
                            }}
                        >
                            Por favor, conecta tu wallet primero
                        </div>     
                        
            )}

            <div id="NTFCollectSection" className="grid">
                <div className="spacer bg-light">
                    <Container>
                        <Row className="justify-content-center">
                            <Col md="7" className="text-center">
                                <h1 className="title font-bold">Digital Collections</h1>
                                <h6 className="subtitle font-18 font-bold" >
                                    By purchasing a piece from one of our digital collections (NFTs), you <br/> 
                                    contribute to
                                    the visibility of psychological care, you can also access 'psycho-tools',
                                    consultations and other benefits that MentalHub professionals 
                                    are constantly building for you. <br/><br/>  
                                    </h6>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div>
                    <Container>
                    <div  className="row">
                    {NFTColInfo.map(renderNFTgals)}
                    </div>
                    </Container>
                </div> 
            </div>
    </>    
    );
}

export default NFTcoList;
