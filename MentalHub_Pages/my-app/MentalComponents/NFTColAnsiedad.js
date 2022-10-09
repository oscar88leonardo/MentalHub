/* eslint-disable */
import React from "react";
import ReactPlayer from "react-player";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
import Image from "next/image";
import imgAuthor from "../public/NFT_Authors/pilamental.png";


const NFTColAnsiedad = () => {

  const NFTGeneralData = {title:"It's not you, it's your Anxiety", AuthorImg:"/../public/NFT_Authors/pilamental.png",
                           AuthorUrl:"https://www.instagram.com/pila_mental_/", AuthorId:"@pila_mental_"}

  const  NFTItemsInfo = [
                        {animation:"https://drive.google.com/uc?export=download&id=1MmvXVr6LZwkbOMn9iJ8boB3MMp_twOLj",
                         id:'Anxiety 01',
                         usecase:"-Consulta de valoración y derivación gratuita \n"+ 
                                 '-1 Pack de 4 sesiones en un mes \n'+
                                 "-Acceso vitalicio al repositorio: banco de recursos y biblioteca virtual de MentalHUb \n"+ 
                                 "-Pase libre a webinar y worshops por 6 meses"
                                },

                        {animation:"https://drive.google.com/uc?export=download&id=1YkQEsrsQ7aStXpdyLwxlmqkIap8_4DCa",
                         id:'Anxiety 02', 
                         usecase:"-Consulta de valoración y derivación gratuita\n"+ 
                                 "-1 Pack de 4 sesiones en un mes\n"+
                                 "-Acceso vitalicio al repositorio: banco de recursos y biblioteca virtual de MentalHUb\n"+ 
                                 "-Pase libre a webinar y worshops por 6 meses"
                                },
                        
                         {animation:"https://drive.google.com/uc?export=download&id=1aiOrh2Xk0m1BjDLVxFL7Y7_bBlg3Fn2P", 
                         id:'Anxiety 03',
                         usecase:"-Consulta de valoración y derivación gratuita\n"+ 
                                 "-1 Pack de 4 sesiones en un mes\n"+
                                 "-Acceso vitalicio al repositorio: banco de recursos y biblioteca virtual de MentalHUb\n"+ 
                                 "-Pase libre a webinar y worshops por 6 meses"
                                },
                         
                         {animation:"https://drive.google.com/uc?export=download&id=1QOGouzQ6ahSrOYWKcGDF-D104pDDYogU", 
                         id:'Anxiety 04',
                         usecase:"-Consulta de valoración psicologica\n"+
                                 "-1 pack de 4 sesiones en un mes\n"+
                                 "-Acceso vitalicio al repositiorio: banco de recursos y biblioteca virtual de MentalHub\n"+
                                 "-Pase libre a webinar y woorkshops por 3 meses"
                                },
                         
                         {animation:"https://drive.google.com/uc?export=download&id=15joe5MOkPoteURfPHq1_CCGPVW-TKilH", 
                         id:'Anxiety 05',
                         usecase:"-Consulta de valoración psicologica\n"+
                                 "-1 pack de 4 sesiones en un mes\n"+
                                 "-Accesp vitalicio al repositiorio: banco de recursos y biblioteca virtual de MentalHub\n"+
                                 "-Pase libre a webinar y woorkshops por 3 meses\n"
                                },
                        
                         {animation:"https://drive.google.com/uc?export=download&id=1UGb_W5A5v6RzAbvYh-enJZYxhL5Zuy4Y", 
                         id:'Anxiety 06',
                         usecase:"-Consulta de valoración psicologica\n"+
                                 "-1 pack de 4 sesiones en un mes\n"+
                                 "-Accesp vitalicio al repositiorio: banco de recursos y biblioteca virtual de MentalHub\n"+
                                 "-Pase libre a webinar y woorkshops por 3 meses\n"
                                },
                         
                         {animation:"https://drive.google.com/uc?export=download&id=1HMnejhXbWhRwiPX1d9eXYzNJ-C3yMT5W", 
                         id:'Anxiety 07',
                         usecase:"-Consulta de valoración psicológica\n"+
                                 "-Ebook y 3 toolkit premium\n"+
                                 "-Accesp vitalicio al repositiorio: banco de recursos y biblioteca virtual de MentalHub\n"
                                },
                                
                         {animation:"https://drive.google.com/uc?export=download&id=1bgIscnEimAzBflf6YnhV8cTslPqdasu_", 
                         id:'Anxiety 08',
                         usecase:"-Consulta de valoración psicológica\n"+
                                 "-Ebook y 3 toolkit premium\n"+
                                 "-Accesp vitalicio al repositiorio: banco de recursos y biblioteca virtual de MentalHub\n"
                                },

                         {animation:"https://drive.google.com/uc?export=download&id=1HMnejhXbWhRwiPX1d9eXYzNJ-C3yMT5W", 
                         id:'Anxiety 09',
                         usecase:"-Consulta de valoración psicológica\n"+
                                 "-Ebook y 3 toolkit premium\n"+
                                 "-Accesp vitalicio al repositiorio: banco de recursos y biblioteca virtual de MentalHub\n"
                                }
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
                      <Image src={imgAuthor} alt="wrapkit" className="circle" />
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

export default NFTColAnsiedad;
