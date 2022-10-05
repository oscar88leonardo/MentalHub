/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
import Image from "next/image";
import img5 from "../assets/images/features/feature30/feature-img.jpg";

const FeatureComponent = () => {
  return (
    <div>
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
                    <h3 className="title">
                      Vision
                    </h3>
                    <p>
                      Mental Hub se propone como una comunidad digital construida en torno a los NFTs, orientada al cuidado de la salud mental a través de tratamiento psicológico específico sobre ansiedad, depresión, rupturas y duelos.

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

