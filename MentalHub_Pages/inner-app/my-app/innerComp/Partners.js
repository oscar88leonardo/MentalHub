/* eslint-disable */
import React from 'react';
import { Row, Col, Container } from 'reactstrap';

const Partners = () => {
    return (
        <div id="PartnersSection">
            <div className="spacer bg-light">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="12" className="text-center">
                            <h1 className="title font-bold">MentalHub Partners</h1>
                            <h6 className=" text-justify subtitle">
                                <br/>
                                Mental care requires commitment from professionals in constant training and updating 
                                related to the understanding of psychological and brain health, treatments, therapies, 
                                as well as latest researches and scientific developments about how to deal with differents
                                mental health conditions that currently have a huge impact in our society.
                                <br/><br/>
                                Each psychological project or/and professional that join our community will 
                                increase capacity and diversification of the mental health system, not only for the
                                benefits of access to adequate psychological treatments in everywhere at 
                                their anyone’s own time, but also through MentalHub platform with psycho educational content and 
                                a variety of resources and services that you could better take advantage of! 
                                <br/><br/>
                                All of this framework allows our community to grow while contributing to reducing 
                                stigma and improving the mental health ecosystem. These are the required values as a professional partner 
                                to be part of and build community here in MentalHub
                                <br/><br/>
                                </h6>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="spacer team2">
                <Container>                    
                    <Row className="m-t-30 justify-content-center">
                        <Col lg="4" md="6" >
                            <Row className="no-gutters justify-content-center">
                                <Col md="7" sm="5" xs="5" className="pro-pic t2 circle">
                                    <div className="card-img-overlay">
                                        <ul className="list-inline">
                                            <li className="list-inline-item"><a href="https://www.instagram.com/nataly_mosquera_dussan/"><i className="fa fa-facebook"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/nataly_mosquera_dussan/"><i className="fa fa-twitter"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/nataly_mosquera_dussan/"><i className="fa fa-instagram"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com/nataly_mosquera_dussan/"><i className="fa fa-linkedin"></i></a></li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col md="12">
                                    <div className="p-t-10">
                                        <h5 className="title font-medium text-center">Nataly Mosquera Dussán</h5>
                                        <h6 className="subtitle text-center">Psychotherapist</h6>
                                        <p className="text-justify"> Creator of 'Pila Mental', a proposal designed to help you unleash the potential of your mind 
                                            with psychological tools. Co-founder of Me Too! an NGO that promotes inclusion and diversity through art. 
                                            Photographer, writer and content designer. I have a huge passion for science and the study of the psyche 
                                            and human behavior, a lover of creative challenges and new learning.
                                            <br/><br/>
                                            </p>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col lg="4" md="6" sm="12" className="m-b-30">
                            <Row className="no-gutters justify-content-center">
                                <Col md="7" sm="5" xs="5" className="pro-pic t1 circle">
                                    <div className="card-img-overlay"> 
                                        <ul className="list-inline">
                                            <li className="list-inline-item"><a href="https://www.facebook.com/"><i className="fa fa-facebook"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.twitter.com"><i className="fa fa-twitter"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.instagram.com"><i className="fa fa-instagram"></i></a></li>
                                            <li className="list-inline-item"><a href="https://www.linkedin.com/"><i className="fa fa-linkedin"></i></a></li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col md="12">
                                    <div className="p-t-10">
                                        <h5 className="title font-medium text-center">Julian Andrade</h5>
                                        <h6 className="subtitle text-center">Psychotherapist</h6>
                                        <p className="text-justify">Psychologist with extensive experience in the organizational field, both in human and administrative management, 
                                        as well as in the inclusion of self-care practices in occupational health and safety processes. In the clinical field, 
                                        i used psychophysical techniques to manage stress, emotional congestion, states of anguish, and depersonalization.
                                        <br/><br/>
                                        </p>                                   
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
