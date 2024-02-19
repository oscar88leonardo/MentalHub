/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
import Image from "next/image";
import banner from "../public/MainBanner.jpg";

const FeatureComponent = () => {
  return (
    <div id="VisionSection">
      <div >
        <Container className="feature30">
          <Row>
            <Col lg="10" className="spacer" >
              <Image 
                src={banner}
                className="img-responsive"
                alt="wrappixel"
                />  
            </Col>
            <Col lg="6" md="6" className="text-center wrap-feature30-box">
              <Card className="card-shadow">
                <CardBody>
                  <div className="p-05">
                    <h1 className="title font-bold">
                      MentalHub
                    </h1>
                    <p className="font-bold">
                    A digital community, aimed at mental health care through
                    psychological consultation for anxiety, depression, breakups and grief.
                    </p>
                  </div>
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
