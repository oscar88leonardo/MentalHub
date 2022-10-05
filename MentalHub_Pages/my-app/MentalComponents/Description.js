/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";

const FeatureComponent = () => {
  return (
    <div>
      <div className="spacer feature4">
        <Container>
          <Row className="justify-content-center">
            <Col md="7" className="text-center">
              <h2 className="title">¡Forma parte de nuestra comunidad, empoderate de tu salud mental y apoya a otros para que lo logren a través de los NFTs!</h2>
            </Col>
          </Row>
          <Row className="m-t-40">
            <Col md="6" className="wrap-feature4-box">
              <Card>
                <CardBody>
                  <div className="icon-round bg-light-info">
                    <i className="fa fa-star"></i>
                  </div>
                  <h5 className="font-medium">The purpose of Mental Hub</h5>
                  <p className="m-t-20">
                    MentalHub es una plataforma digital orientada al cuidado de la salud mental creando comunidad por medio de los NFT, a través de los cuales el acceso a un tratamiento adecuado se facilita y agiliza.
 <br/><br/>
Tal propósito permite a su vez contribuir a la desmitificación de la salud mental al brindar contenido psicoeducativo y la posibilidad de acceder a consulta especializada acorde a las necesidades de los usuarios, así como a la diversificación del mercado de los NFT expandiendo los servicios de salud mental a la comunidad de la  cryptoindustria.
                  </p>
                </CardBody>
              </Card>
            </Col>
            <Col md="6" className="wrap-feature4-box">
              <Card>
                <CardBody>
                  <div className="icon-round bg-light-info">
                    <i className="fa fa-star"></i>
                  </div>
                  <h5 className="font-medium">Why Mental Hub?</h5>
                  <p className="m-t-20">
                    ¿Sabías que, según la organización mundial de la salud (OMS) más de 300 millones de personas en el mundo sufren de algún tipo de trastorno de ansiedad y a partir de la pandemia se incrementaron un 25% los casos? (OMS, 2022).<br/>
Aunque son datos alarmantes, casi 2 tercios de las personas con síntomas nunca buscan tratamiento, esto ocurre por múltiples causas, sin embargo, las características comunes son la desinformación, los prejuicios y estigmatizaciones en torno a las “enfermedades mentales” y atención psicológica frecuentemente asociadas a la locura e  incapacidad (OPS & OMS 2022). <br/>
Conscientes de esta realidad y guiados por el genuino propósito de ayudar a aliviar el sufrimiento de las personas, proponemos un entorno digital saludable que se configura a partir de los NFT.

                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default FeatureComponent;
