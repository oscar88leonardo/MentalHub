/* eslint-disable */
import React from "react";
import { Row, Col, Container } from "reactstrap";
import Image from "next/image";
import roadMap from "../public/MentalHubRoadmap.svg";

const RoadMapComponent = () => {
  return (
    <div id="RoadMapSection" className="section-py">
      <Container>
        <Row className="justify-content-center mb-16">
          <Col lg="10" md="11" sm="12" className="text-center">
            <div className="eyebrow-pill mb-6">
              Our Journey
            </div>
            <h2 className="text-h2 font-bold text-text mb-6">RoadMap</h2>
            <p className="text-lead text-muted max-w-3xl mx-auto">
              We are building Innerverse, the platform that will empower the community and decentralize the access of 
              mental health services, take a look at our next steps.
            </p>
          </Col>
        </Row>
        
        <Row className="justify-content-center">
          <Col lg="10">
            <div className="modern-card p-8">
              <Image
                src={roadMap}
                className="w-full h-auto rounded-2xl"
                alt="MentalHub Roadmap"
                priority
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RoadMapComponent;