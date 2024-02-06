/* eslint-disable */
import React from "react";
import { Row, Col, Container } from "reactstrap";
import Image from "next/image";
import roadMap from "../public/MentalHubRoadmap.svg";


const RoadMapComponent = () => {
  return (
    <div id="RoadMapSection">
      <div className="spacer bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col lg="10" md="11" sm="12" className="text-center">
              <h1 className="title font-bold">RoadMap</h1>
              <h3 className="subtitle font-bold">              
              We are building the 
              protocol that will empower the community and decentralize the access of 
              mental health services, take a look at our next steps.                                          
              </h3>
            </Col>
          </Row>
        </Container>
      </div>
      <div>
        <Container className="feature30">
          <Row className="justify-content-md-center row">
            <Col lg="10">
              <Image
                src={roadMap}
                className="rounded img-responsive"
                alt="wrappixel"
              />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  
  );
};

export default RoadMapComponent;