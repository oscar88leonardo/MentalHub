/* eslint-disable */
import React from "react";
import { Row, Col, Container } from "reactstrap";
import Image from "next/image";
import img5 from "../public/MentalHubRoadmap.png";

const RoadMapComponent = () => {
  return (
    <div id="RoadMapSection">
      <div className="spacer bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col md="7" className="text-center">
              <h1 className="title font-bold">RoadMap</h1>
              <h6 className="subtitle font-bold">
              MentalHub is a collaborative environment where professionals and users connect on healthy networks and build health-conscious communities.                               
              </h6>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="spacer ">
        <Container className="feature30">
          <Row className="justify-content-md-center row">
            <Col lg="10">
              <Image
                src={img5}
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
