/* eslint-disable */
import React from 'react';
import { Row, Col, Container } from 'reactstrap';

const Partners = () => {
    return (
        <div id="PartnersSection">
            <div className="spacer bg-light">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="7" className="text-center">
                            <h1 className="title font-bold">Partners</h1>
                            <h6 className="subtitle">Experienced and qualified profesionals in mental health care</h6>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="spacer team2">
                <Container>                    
                    <Row className="m-t-30 justify-content-center">
                        <Col lg="3" md="6" className="m-b-30">
                            <Row className="no-gutters">
                                <Col md="12" className="pro-pic t2 circle">
                                    <div className="card-img-overlay">
                                        <ul className="list-inline">
                                            <li className="list-inline-item"><a href="https://www.instagram.com/nataly_mosquera_dussan/"><i className="fa fa-facebook"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/nataly_mosquera_dussan/"><i className="fa fa-twitter"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/nataly_mosquera_dussan/"><i className="fa fa-instagram"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/nataly_mosquera_dussan/"><i className="fa fa-behance"></i></a></li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col md="12">
                                    <div className="p-t-10">
                                        <h5 className="title font-medium text-center">Nataly Mosquera Dussán</h5>
                                        <h6 className="subtitle text-center">Psychotherapist</h6>
                                        <p className="text-center"> Creator of 'Pila Mental', a proposal designed to help you unleash the potential of your mind 
                                            with psychological tools. Co-founder of Me Too! an NGO that promotes inclusion and diversity through art, 
                                            photographer, writer and content designer. I have a huge passion for science and the study of the psyche 
                                            and human behavior, a lover of creative challenges and new learning.</p>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col lg="3" md="6" className="m-b-30">
                            <Row className="no-gutters">
                                <Col md="12" className="col-md-12 pro-pic t3 circle">
                                    <div className="card-img-overlay">
                                        <ul className="list-inline">
                                            <li className="list-inline-item"><a href="https://www.instagram.com/julioponcedeleonc/"><i className="fa fa-facebook"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/julioponcedeleonc/"><i className="fa fa-twitter"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/julioponcedeleonc/"><i className="fa fa-instagram"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/julioponcedeleonc/"><i className="fa fa-behance"></i></a></li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col md="12">
                                    <div className="p-t-10">
                                        <h5 className="title font-medium text-center">Julian Andrade</h5>
                                        <h6 className="subtitle text-center">Psychotherapist</h6>
                                        <p className="text-center">Psychologist with extensive experience in the organizational field, both in human and administrative management, 
                                        as well as in the inclusion of self-care practices in occupational health and safety processes. In the clinical field, 
                                        i used psychophysical techniques to manage stress, emotional congestion, states of anguish, and depersonalization.</p>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}

export default Partners;
