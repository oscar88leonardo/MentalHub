/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";

const FeatureComponent = () => {
  return (
    <div id="DescriptionSection">
      <div className="spacer feature4">
        <Container>
          <Row className="justify-content-center">
            <Col md="7" className="text-center">
              <h2 className="title">Be part of our community, empower yourself from your mental health and support others to achieve it through NFTs!</h2>
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
                  MentalHub is a digital platform focused on mental health care creating community through NFTs, through which access to adequate treatment is facilitated and expedited.
                  <br/><br/>
                  Such purpose allows in turn contribute to the demystification of mental health by providing psychoeducational content and the possibility of accessing specialized consultation according to the needs of users, as well as diversifying the NFT market by expanding mental health services to the crypto industry community.
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
                  Did you know that, according to the World Health Organization (WHO), more than 300 million people in the world suffer from some kind of anxiety disorder and since the pandemic the cases have increased by 25%? (WHO, 2022). <br/><br/>
                  Almost 2-thirds of people with symptoms never seek treatment, this happens for multiple causes, however, the common features are misinformation, prejudice, and stigma around "mental illness" and psychological care often associated with insanity and disability (PHO & WHO, 2022) <br/><br/>
                  Aware of this reality and guided by the genuine purpose of helping heal people’s suffering, we propose a healthy digital environment that is configured from NFTs.
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
