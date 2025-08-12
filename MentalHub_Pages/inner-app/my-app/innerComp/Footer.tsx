/* eslint-disable */
import React from "react";
import { Container, Row, Col } from "reactstrap";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="bg-surface border-t border-white/10 py-16">
      <Container>
        <Row>
          <Col lg="3" md="6" className="mb-8">
            <h5 className="text-lg font-semibold text-text mb-6">Address</h5>
            <p className="text-muted">25 steet # 4 - 20, Colombia, Neiva - Huila</p>
          </Col>
          <Col lg="3" md="6" className="mb-8">
            <h5 className="text-lg font-semibold text-text mb-6">Phone</h5>
            <p className="text-muted">
              Reception : +205 123 4567 <br />
              Office : +207 235 7890
            </p>
          </Col>
          <Col lg="3" md="6" className="mb-8">
            <h5 className="text-lg font-semibold text-text mb-6">Email</h5>
            <p className="text-muted">
              Office :
              <Link href="#" className="text-teal hover:text-cyan transition-colors nav-underline ml-1">
                info@innerverse.com
              </Link>
              <br />
              Site :
              <Link href="" className="text-teal hover:text-cyan transition-colors nav-underline ml-1">
                innerverse.care
              </Link>
            </p>
          </Col>
          <Col lg="3" md="6">
            <h5 className="text-lg font-semibold text-text mb-6">Social</h5>
            <div className="flex space-x-4">
              <Link href="#" className="w-10 h-10 bg-surface border border-white/20 rounded-full flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all duration-200">
                <i className="fa fa-facebook"></i>
              </Link>
              <Link href="#" className="w-10 h-10 bg-surface border border-white/20 rounded-full flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all duration-200">
                <i className="fa fa-twitter"></i>
              </Link>
              <Link href="#" className="w-10 h-10 bg-surface border border-white/20 rounded-full flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all duration-200">
                <i className="fa fa-google-plus"></i>
              </Link>
              <Link href="#" className="w-10 h-10 bg-surface border border-white/20 rounded-full flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all duration-200">
                <i className="fa fa-youtube-play"></i>
              </Link>
              <Link href="#" className="w-10 h-10 bg-surface border border-white/20 rounded-full flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all duration-200">
                <i className="fa fa-instagram"></i>
              </Link>
            </div>
          </Col>
        </Row>
        
        <Row className="mt-12 pt-8 border-t border-white/10">
          <Col className="text-center">
            <p className="text-muted">
              © 2024 MentalHub. All rights reserved. | 
              <Link href="#" className="text-teal hover:text-cyan transition-colors nav-underline ml-1">
                Privacy Policy
              </Link> | 
              <Link href="#" className="text-teal hover:text-cyan transition-colors nav-underline ml-1">
                Terms of Service
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Footer;