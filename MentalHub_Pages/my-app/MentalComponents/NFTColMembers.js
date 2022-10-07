/* eslint-disable */
import React from "react";
import ReactPlayer from "react-player";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
import Image from "next/image";

import ImgAuthor from "../public/NFT_Authors/pilamental.png";


const NFTColMembers = () => {

  
  const NFTGeneralData = {title:"Mental Hub Members", AuthorImg:"/../public/NFT_Authors/pilamental.png",
                           AuthorUrl:"https://www.instagram.com/pila_mental_/", AuthorId:"@mental_hub"}
                          
  
  const  NFTItemsInfo = [
                        {animation:"https://drive.google.com/uc?export=download&id=1z-h-yztjs-k0L9zNcpsoLUoEABJBQoBk", 
                         id:'Member 01', 
                         usecase:"Freemium acces"},

                        {animation:"https://drive.google.com/uc?export=download&id=1z-h-yztjs-k0L9zNcpsoLUoEABJBQoBk", 
                        id:'Member 02', 
                        usecase:"Freemium acces"},
                         
                        {animation:"https://drive.google.com/uc?export=download&id=1z-h-yztjs-k0L9zNcpsoLUoEABJBQoBk", 
                         id:'Member 03',
                         usecase:"Freemium acces"},
                         
                        {animation:"https://drive.google.com/uc?export=download&id=1z-h-yztjs-k0L9zNcpsoLUoEABJBQoBk", 
                         id:'Member 04', 
                         usecase:"Freemium acces"},
                         
                        {animation:"https://drive.google.com/uc?export=download&id=1z-h-yztjs-k0L9zNcpsoLUoEABJBQoBk", 
                         id:'Member 05', 
                         usecase:"Freemium acces"},
                        
                        {animation:"https://drive.google.com/uc?export=download&id=1z-h-yztjs-k0L9zNcpsoLUoEABJBQoBk", 
                         id:'Member 06', 
                         usecase:"Freemium acces"} 
                        ]
                      
  
  const renderNFTItems = (NFTitem, index) => {
    return(   
      <Col md="4">
        <Card className="card-shadow" key={index}>              
        <div className='player-wrapper'>
          <video controls
              src={NFTitem.animation}
              width='300'
              height='300'
              >
          </video>
          </div>
          <CardBody>
            <h5 className="font-medium m-b-0">
              {NFTitem.id}
            </h5>
            <p className="m-b-0 font-14">{NFTitem.usecase}</p>
            <a className="btn btn-danger btn-md btn-arrow m-t-20 justify-content-center"
              data-toggle="collapse"
              href=""
            >
            <span>
                  Mint! <i className="ti-arrow-right"></i>
            </span>
          </a>
          </CardBody>
        </Card>
        </Col>
        )  
  }

  return (
    <div>     
      <div className="spacer">
        <Container>
          <Row className="justify-content-center">
            <Col lg="12" md="6" className="text-center"> 
            <br /><h2 className="title font-bold">{NFTGeneralData.title}</h2><br />
              <div className="d-flex no-block align-items-center">
                    <span className="thumb-img">
                      <Image src={ImgAuthor}  alt="wrapkit" className="circle" /> <br />
                    </span>
                    <div className="text-left font-18">
                    <h3 className="subtitle ">An NFT collection by <a href={NFTGeneralData.AuthorUrl}>{NFTGeneralData.AuthorId}</a> </h3><br /> 
                    <p> El espíritu de esta colección parte del supuesto de que “comprender” es “aliviar” 
                        Por eso cada NFT trae una pregunta sobre “trampas mentales” que nos creamos 
                        las historias que nos contamos y hacen tanto daño, aquello que nos afecta 
                        e ignoramos o evitamos repetidamente.<br /><br />
                        Cada NFT nos ayuda a entender porqué muchas veces hacemos las cosas 
                        equivocadas por los motivos correctos. <br /><br />
                        Have fun collecting and take care of your mental health!
                        </p>
                      <div className="font-14">                        
                      </div>
                    </div>
                  </div>             
            </Col>
          </Row>
          <Row className="m-t-40">
          {NFTItemsInfo.map(renderNFTItems)}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default NFTColMembers;
