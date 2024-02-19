"use client"
/* eslint-disable */
import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import Link from 'next/link';
//import NFTCarrousel from "../MentalComponents/NFTCarrousel";

const NFTcoList = () => {

    const  NFTColInfo = [

        {animation:"/NFT_CollPreview/MembersPreview.mp4", title:"MentalHub Member", 
        Author_url:'"https://www.instagram.com/pila_mental_/"', Author_id:"@m3ntal_hub",
        Link:"/NFTCol0"},

        {animation:"/NFT_CollPreview/AnsiedadPreview.mp4", title:"It's not you, it's your anxiety", 
         Author_url:"https://www.instagram.com/pila_mental_/", Author_id:"@pila_mental_",
         Link:"/NFTCol1"}
    ]

    const handleClick =() => {
        return "hi"
     }

    const renderNFTgals = (NFTcol, index) => {
        return(
            <div className="col-lg-6" key={index} >
                <div className='player-wrapper' onClick={handleClick}>

                    <video autoPlay muted loop 
                    src={NFTcol.animation}
                    width='100%'
                    height='100%'                    
                    >
                    <Link href={NFTcol.Link}>{NFTcol.title}</Link>
                    </video>
                </div>
                    <Col md="12">
                                <div className="p-t-10">
                                    <h5 className="title font-medium"> <Link href={NFTcol.Link}>{NFTcol.title}</Link>  </h5>
                                    <h6 className="subtitle">By <a href={NFTcol.Author_url}>{NFTcol.Author_id}</a> </h6>
                                </div>
                    </Col>                    
                </div>
        )
    }

    return (
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
    );
}

export default NFTcoList;
