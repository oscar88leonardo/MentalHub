/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";

const FeatureComponent = () => {
  return (
    <div id="DescriptionSection" className="section-py">
      <Container>
        <Row className="justify-content-center mb-16">
          <Col md="9" className="text-center">
            <div className="eyebrow-pill mb-6">
              Our Mission
            </div>
            <h2 className="text-h2 font-bold text-text">
              Be part of our community, empower yourself from your mental health
              and support others to achieve it through digital collectibles!
            </h2>
          </Col>
        </Row>
        
        <Row className="gap-8">
          <Col md="6" className="mb-8">
            <div className="modern-card p-8 h-full">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mr-4">
                  <i className="fa fa-star text-white text-xl"></i>
                </div>
                <h5 className="text-xl font-semibold text-text">Purpose</h5>
              </div>
              <p className="text-muted leading-relaxed">
                MentalHub is a digital platform focused on mental health care, 
                we are creating a community around access to mental health services,
                provided by qualified professionals.
                <br/><br/>
                Such purpose allows us to contribute to the demystification of mental health by 
                providing psychoeducational content and accesss to specialized consultation according 
                to the user needs, as well as expanding adoption of mental health services to 
                the tech. and crypto industry community.
              </p>
            </div>
          </Col>
          
          <Col md="6" className="mb-8">
            <div className="modern-card p-8 h-full">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-teal rounded-2xl flex items-center justify-center mr-4">
                  <i className="fa fa-heart text-white text-xl"></i>
                </div>
                <h5 className="text-xl font-semibold text-text">Why MentalHub?</h5>
              </div>
              <p className="text-muted leading-relaxed">
                Did you know that according to the World Health Organization (WHO) more than 300 million people 
                in the world suffer from some kind of anxiety disorder?, and since the pandemic the cases have 
                increased by 25% ! (WHO, 2022). <br/><br/>

                Almost 2-thirds of people with symptoms never seek treatment, this happens for multiple causes. 
                However, the common features are misinformation, prejudice, and stigma around "mental illness" 
                and psychological care often associated with insanity and disability (PHO & WHO, 2022) <br/><br/>

                Aware of this reality and guided by the genuine purpose of helping heal people's suffering, 
                we propose a digital environment where community con connect with qualified professionals 
                around mental health services.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FeatureComponent;