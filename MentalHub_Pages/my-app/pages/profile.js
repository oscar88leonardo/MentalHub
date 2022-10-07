import Head from "next/head";
import React from "react";
import Link from "next/link";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
import Image from "next/image";
//import bannerimg from "../assets/images/landingpage/banner-img.png";
import bannerimg from "../public/mhm-web-banner.png";
import img0 from "../assets/images/testimonial/1.jpg";
import img1 from "../assets/images/portfolio/img1.jpg";
import img2 from "../assets/images/portfolio/img2.jpg";
import img3 from "../assets/images/portfolio/img3.jpg";
import img4 from "../assets/images/portfolio/img4.jpg";
import img5 from "../assets/images/portfolio/img5.jpg";
import img6 from "../assets/images/portfolio/img6.jpg";

export default function Profile() {
  return (
    <div>
      <Head>
        <title>Mental Hub | A platform to help you with the mental health care</title>
        <meta
          name="Mental Hub"
          content="A platform to help you with the mental health care"
        />
      </Head>
      <div className="static-slider-head-profile banner2">
        <Container>
          <Row className="testi3 m-t-40 justify-content-left">
            <Col lg="4" md="1">
              <Card className="card-shadow">
                <CardBody>
                  <div className="d-flex no-block align-items-center">
                    <span className="thumb-img">
                      <Image src={img0} alt="wrapkit" className="circle" />
                    </span>
                  </div>
                  <div className="m-l-20">
                    <h6 className="m-b-0 customer">Michelle Anderson</h6>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="spacer">
        <Container>
          <Row className="justify-content-left">
            <Col md="7" className="text-left">
              <h2 className="title">My NTFs</h2>
            </Col>
          </Row>
          <Row className="m-t-40">
            <Col md="4">
              <Card className="card-shadow">
                <a href="#" className="img-ho">
                  <Image
                    className="card-img-top"
                    src={img1}
                    alt="wrappixel kit"
                  />
                </a>
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    Branding for Theme Designer
                  </h5>
                  <p className="m-b-0 font-14">Digital Marketing</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <a href="#" className="img-ho">
                  <Image
                    className="card-img-top"
                    src={img2}
                    alt="wrappixel kit"
                  />
                </a>
                <CardBody>
                  <h5 className="font-medium m-b-0">Button Designs Free</h5>
                  <p className="m-b-0 font-14">Search Engine</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <a href="#" className="img-ho">
                  <Image
                    className="card-img-top"
                    src={img3}
                    alt="wrappixel kit"
                  />
                </a>
                <CardBody>
                  <h5 className="font-medium m-b-0">Branding & Co Agency</h5>
                  <p className="m-b-0 font-14">Admin templates</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <a href="#" className="img-ho">
                  <Image
                    className="card-img-top"
                    src={img4}
                    alt="wrappixel kit"
                  />
                </a>
                <CardBody>
                  <h5 className="font-medium m-b-0">Zukandre Phoniex</h5>
                  <p className="m-b-0 font-14">Branding</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <a href="#" className="img-ho">
                  <Image
                    className="card-img-top"
                    src={img5}
                    alt="wrappixel kit"
                  />
                </a>
                <CardBody>
                  <h5 className="font-medium m-b-0">Sionage Mokcup</h5>
                  <p className="m-b-0 font-14">Wll Mockup</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <a href="#" className="img-ho">
                  <Image
                    className="card-img-top"
                    src={img6}
                    alt="wrappixel kit"
                  />
                </a>
                <CardBody>
                  <h5 className="font-medium m-b-0">Hard Cover Book Mock</h5>
                  <p className="m-b-0 font-14">Book Covers</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

