/* eslint-disable */
import React from 'react';
import { Row, Col, Container } from 'reactstrap';

const NFTcoList = () => {
    return (
        <div>
            <div className="spacer bg-light">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="7" className="text-center">
                            <h1 className="title font-bold">NFT Collections</h1>
                            <h6 className="subtitle">Explore Mental Health Collections and its Benefits!</h6>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="spacer team2">
                <Container>
                <div class="row">
                    <div class="col-lg-6">
                        <img class="img-fluid" src="NFT_CollPreview/Ansiedad.png" />
                        <Col md="12">
                                    <div className="p-t-10">
                                        <h5 className="title font-medium">No eres tu, es tu ansiedad.</h5>
                                        <h6 className="subtitle">By @PilaMental</h6>
                                    </div>
                        </Col>                    
                    </div>
                    <div class="col-lg-6">
                        <img class="img-fluid" src="NFT_CollPreview/Rupturas.png" />
                        <Col md="12">
                                    <div className="p-t-10">
                                        <h5 className="title font-medium">lorenIpsumNFTCollection.</h5>
                                        <h6 className="subtitle">By @TalkToMe.ao</h6>
                                    </div>
                        </Col>                    
                    </div>
                </div>
                </Container>
            </div>
        </div>
    );
}

export default NFTcoList;