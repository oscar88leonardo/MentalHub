/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
import Image from "next/image";
import banner from "../public/MainBanner.jpg";
import HeroVisual from "../components/HeroVisual";

const FeatureComponent = () => {
  return (
    <div id="VisionSection" className="relative overflow-hidden hero-bg">
      <Container className="relative z-10 py-16 sm:py-20 md:py-24 lg:py-28">
        <Row className="items-center min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh]">
          <Col lg="6" md="6" className="order-2 order-lg-1 mb-8 lg:mb-0">
            <div className="space-y-6 sm:space-y-8">
              {/* Eyebrow pill */}
              <div className="eyebrow-pill">
                Mental Health Care
              </div>
              
              {/* Main heading with gradient emphasis */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-h1 font-bold leading-tight">
                Innerverse
                <br />
                <span className="gradient-text-teal">hope</span> for better
                <br />
                <span className="gradient-text-cyan">outcomes</span>
              </h1>
              
              {/* Lead text */}
              <p className="text-base sm:text-lg md:text-xl lg:text-lead text-muted max-w-lg">
                A digital community, aimed at mental health care through
                psychological consultation for anxiety, depression, breakups and grief.
              </p>
              
              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary-gradient">
                  Get Started
                </button>
                <button className="btn-outline-modern">
                  Learn More
                </button>
              </div>
              
              {/* Stats tile */}
              <div className="modern-card p-4 sm:p-6 max-w-xs">
                <div className="text-2xl sm:text-3xl font-bold text-text mb-2">92%</div>
                <div className="text-xs sm:text-sm text-muted">Success rate in mental health improvement</div>
                <div className="progress-mini mt-3 w-3/4"></div>
              </div>
            </div>
          </Col>
          
          <Col lg="6" md="6" className="order-1 order-lg-2">
            <div className="relative flex justify-center lg:justify-end">
              <HeroVisual />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FeatureComponent;
