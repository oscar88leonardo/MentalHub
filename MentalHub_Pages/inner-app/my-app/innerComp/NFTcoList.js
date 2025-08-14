"use client"
/* eslint-disable */
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useActiveWallet } from "thirdweb/react";
import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import Link from 'next/link';

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

    const NFTColInfo = [
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
    }, [showAuthWarning]);

    const renderNFTgals = (NFTcol, index) => {
         return(
            <div className="col-lg-6 mb-8" key={index}>
                <div className="modern-card overflow-hidden group cursor-pointer" 
                     onClick={(e) => handleLinkClick(e, NFTcol.Link)}>
                    <div className="relative">
                        <video 
                            autoPlay 
                            muted 
                            loop 
                            src={NFTcol.animation}
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {!account && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                🔒 Locked
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <div className="p-6">
                        <h5 className="text-xl font-semibold text-text mb-3 group-hover:text-primary transition-colors">
                            {NFTcol.title}
                        </h5>
                        <h6 className="text-muted">
                            By <a href={NFTcol.Author_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-teal hover:text-cyan transition-colors">
                                {NFTcol.Author_id}
                            </a>
                        </h6>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>    
            {showAuthWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="modern-card p-8 max-w-md mx-4 text-center">
                        <div className="text-red-400 text-4xl mb-4">🔒</div>
                        <h3 className="text-xl font-semibold text-text mb-2">Authentication Required</h3>
                        <p className="text-muted mb-4">
                            Por favor, conecta tu wallet primero para acceder a las colecciones digitales.
                        </p>
                        <button 
                            onClick={() => setShowAuthWarning(false)}
                            className="btn-primary-gradient w-full"
                        >
                            Entendido
                        </button>
                    </div>
                </div>     
            )}

            <div id="NTFCollectSection" className="section-py">
                <Container>
                    <Row className="justify-content-center mb-16">
                        <Col md="8" className="text-center">
                            <div className="eyebrow-pill mb-6">
                                Digital Collections
                            </div>
                            <h2 className="text-h2 font-bold text-text mb-6">
                                    Explore Innerverse 
                            </h2>
                            <p className="text-lead text-muted max-w-2xl mx-auto">
                                By purchasing a piece from one of our digital collections,  you unlock access to Inerverse servicves, 
                                enable 'psycho-tools', consultations and other benefits that Innerverse professionals 
                                are constantly building for you. 
                            </p>
                        </Col>
                    </Row>
                    
                    <div className="row">
                        {NFTColInfo.map(renderNFTgals)}
                    </div>
                </Container>
            </div>
        </>    
    );
}

export default NFTcoList;
