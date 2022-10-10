/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
import Image from "next/image";
import img5 from "../public/banner1.jpg";

const FeatureComponent = () => {
  return (
    <div id="VisionSection">
      <div className="spacer ">
        <Container className="feature30">
          <Row>
            <Col lg="10">
              <Image
                src={img5}
                className="rounded img-responsive"
                alt="wrappixel"
              />
            </Col>
            <Col lg="5" md="7" className="text-center wrap-feature30-box">
              <Card className="card-shadow">
                <CardBody>
                  <div className="p-20">
                    <h3 className="title font-bold">
                      Vision
                    </h3>
                    <p className="font-bold">
                    Mental Hub is proposed as a digital community built around NFTs, aimed at mental health care through specific psychological treatment for anxiety, depression, breakups and grief.
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

