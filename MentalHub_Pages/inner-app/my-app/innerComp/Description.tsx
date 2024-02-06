/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";

const FeatureComponent = () => {
  return (
    <div id="DescriptionSection">
      <div className="spacer bg-light">
        <Container >
          <Row className="justify-content-center">
            <Col md="9" className="text-center">
              <h2 className="title">Be part of our community, empower yourself from your mental health
                                     and support others to achieve it through digital collectibles!</h2>
            </Col>
          </Row>
          <Row className="m-t-40">
            <Col md="6" className="wrap-feature4-box">
              <Card>
                <CardBody>
                  <div className="icon-round bg-light-info">
                    <i className="fa fa-star"></i>
                  </div>
                  <h5 className="font-medium">Purpose</h5>
                  <p className="text-justify m-t-20">
                  MentalHub is a digital platform focused on mental health care, 
                  we are creating a community around access to mental health services,
                  provided by qualified profesionals.
                  <br/><br/>
                  Such purpose allows us to contribute to the demystification of mental health by 
                  providing psychoeducational content and accesss to specialized consultation according 
                  to the user needs, as well as expanding adoption of mental health services to 
                  the tech. and crypto industry community.
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
                  <h5 className="font-medium">Why MentalHub?</h5>
                  <p className="text-justify m-t-20">
                  Did you know that according to the World Health Organization (WHO) more than 300 million people 
                  in the world suffer from some kind of anxiety disorder?, and since the pandemic the cases have 
                  increased by 25% ! (WHO, 2022). <br/><br/>

                  Almost 2-thirds of people with symptoms never seek treatment, this happens for multiple causes. 
                  However, the common features are misinformation, prejudice, and stigma around "mental illness" 
                  and psychological care often associated with insanity and disability (PHO & WHO, 2022) <br/><br/>

                  Aware of this reality and guided by the genuine purpose of helping heal people’s suffering, 
                  we propose a digital environment where community con connect with qualified professionals 
                  around mental health services.
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