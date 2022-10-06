/* eslint-disable */
import React from 'react';
import { Row, Col, Container } from 'reactstrap';



const NFTcoList = () => {

    const  NFTColInfo = [
        {animation:"/NFT_CollPreview/AnsiedadPreview.mp4", title:"No eres tú, es tu ansiedad", 
         Author_url:"https://www.instagram.com/pila_mental_/", Author_id:"@pila_mental_"},
        
        {animation:"/NFT_CollPreview/MembersPreview.mp4", title:"Mental Hub Member", 
        Author_url:'"https://www.instagram.com/pila_mental_/"', Author_id:"@m3ntal_hub"}
    ]

    const renderNFTgals = (NFTcol, index) => {
        return(
            <div className="col-lg-6" key={index}>
                <div className='player-wrapper'>
                    <video autoPlay muted loop
                    src={NFTcol.animation}
                    width='100%'
                    height='100%'
                    ></video>
                </div>
                    <Col md="12">
                                <div className="p-t-10">
                                    <h5 className="title font-medium">{NFTcol.title}</h5>
                                    <h6 className="subtitle">By <a href={NFTcol.Author_url}>{NFTcol.Author_id}</a> </h6>
                                </div>
                    </Col>                    
                </div>
        )
    }

    return (
        <div className="grid">
            <div className="spacer bg-light">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="7" className="text-center">
                            <h1 className="title font-bold">NFT Collections</h1>
                            <h6 className="subtitle font-18" >Al adquirir un NFT de nuestras colecciones, contribuyes en la <br/>
                                                             visibilización del cuidado psicológico, también podrás acceder<br/>
                                                            a las herramientas, consultas y demás beneficios que los<br/> 
                                                            profesionales de MentalHub diseñan constantemente para ti.                                              
                                                            </h6>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div>
                <Container>
                <div className="row">
                {NFTColInfo.map(renderNFTgals)}       
                </div>
                </Container>
            </div>            
        </div>
    );
}

export default NFTcoList;