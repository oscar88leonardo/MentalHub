/* eslint-disable */
"use client"
import React, { useState } from "react";
import { Row, Col, Container, Card, CardBody, Button,
          Modal,
          ModalHeader,
          ModalBody,
          ModalFooter } from "reactstrap";

const FAQsComponent = (props) => {
  const [modal1, setModal1] = useState(false);
  const toggle1 = () => {
    setModal1(!modal1);
  };
  const [modal2, setModal2] = useState(false);
  const toggle2 = () => {
    setModal2(!modal2);
  };
  const [modal3, setModal3] = useState(false);
  const toggle3 = () => {
    setModal3(!modal3);
  };
  const [modal4, setModal4] = useState(false);
  const toggle4 = () => {
    setModal4(!modal4);
  };
  const [modal5, setModal5] = useState(false);
  const toggle5 = () => {
    setModal5(!modal5);
  };
  const [modal6, setModal6] = useState(false);
  const toggle6 = () => {
    setModal6(!modal6);
  };
  const [modal7, setModal7] = useState(false);
  const toggle7 = () => {
    setModal7(!modal7);
  };
  const [modal8, setModal8] = useState(false);
  const toggle8 = () => {
    setModal8(!modal8);
  };
  const [modal9, setModal9] = useState(false);
  const toggle9 = () => {
    setModal9(!modal9);
  };
  
  return (
    <div id="FAQsSection" className="section-py">
      <Container>
        <Row className="justify-content-center mb-16">
          <Col md="8" className="text-center">
            <div className="eyebrow-pill mb-6">
              Common Questions
            </div>
            <h2 className="text-h2 font-bold text-text mb-6">FAQs</h2>
            <p className="text-lead text-muted max-w-3xl mx-auto">
              A frequently asked questions (FAQ) list is often used in articles, websites, email lists, and online forums where common questions tend to recur, for example through posts or queries by new users related to common knowledge gaps. The purpose of a FAQ is generally to provide information on frequent questions or concerns; however, the format is a useful means of organizing information, and text consisting of questions and their answers may thus be called a FAQ regardless of whether the questions are actually frequently asked
            </p>
          </Col>
        </Row>
        
        <Row>
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle1.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                What is an NFT?
              </Button>
              <Modal
                size="sm"
                isOpen={modal1}
                toggle={toggle1.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle1.bind(null)} className="bg-surface text-text border-white/10">What is an NFT?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">NFTs or non-fungible tokens, are cryptographic assets on blockchain with unique identification codes and metadata that distinguish them from each other. NFTs are unique and not mutually interchangeable, which means no two NFTs are the same. NFTs can be a unique digital artwork, sneaker in a limited-run fashion line, in-game item, digital collectible etc.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
          
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle2.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                What makes an NFT valuable?
              </Button>
              <Modal
                size="sm"
                isOpen={modal2}
                toggle={toggle2.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle2.bind(null)} className="bg-surface text-text border-white/10">What makes an NFT valuable?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">The value of an NFT comes from the property it represents, which is generally something that exists in the digital world like an original piece of art or digital memorabilia. The NFT itself doesn't necessarily contain the digital property, but points to its location on the blockchain. Like a concert ticket or a deed to a physical property, an NFT reflects the value of the thing it represents.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
          
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle3.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                How do NFTs work?
              </Button>
              <Modal
                size="sm"
                isOpen={modal3}
                toggle={toggle3.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle3.bind(null)} className="bg-surface text-text border-white/10">How do NFTs work?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">Traditional works of art such as paintings are valuable because they are one of a kind. But digital files can be easily and endlessly duplicated.
                  <br/><br/>
With NFTs, artwork can be "tokenised" to create a digital certificate of ownership that can be bought and sold. As with crypto-currency, a record of who owns what is stored on a shared ledger known as the blockchain.
<br/><br/>
The records cannot be forged because the ledger is maintained by thousands of computers around the world. NFTs can also contain smart contracts that may give the artist, for example, a cut of any future sale of the token.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
          
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle4.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                What's the connection between NFTs and cryptocurrency?
              </Button>
              <Modal
                size="sm"
                isOpen={modal4}
                toggle={toggle4.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle4.bind(null)} className="bg-surface text-text border-white/10">What's the connection between NFTs and cryptocurrency?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">NFTs aren't cryptocurrencies, but they are built using technology similar to Ethereum and Bitcoin. Also, like cryptocurrencies, NFTs exist on a blockchain, which verifies their unique identity and ownership. The blockchain also keeps a record of all the transactions connected to the NFT and the property it represents. Many NFTs are held on the Ethereum blockchain.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
          
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle5.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                How to make an NFT?
              </Button>
              <Modal
                size="sm"
                isOpen={modal5}
                toggle={toggle5.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle5.bind(null)} className="bg-surface text-text border-white/10">How to make an NFT?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">NFTs are typically acquired from different curated platforms that specifically deal in digital assets. Open marketplaces, like OpenSea.io, are popular for buying and trading NFTs. For digital art, buyers can go to MakersPlace, Nifty Gateway, SuperRare and KnownOrigin.
<br/><br/>
It should be noted that some platforms accept USD as well as crypto, some platforms only accept cryptocurrencies, like OpenSea.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
          
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle6.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                How to validate the authencity of an NFT?
              </Button>
              <Modal
                size="sm"
                isOpen={modal6}
                toggle={toggle6.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle6.bind(null)} className="bg-surface text-text border-white/10">How to validate the authencity of an NFT?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">NFT ownership is recorded on the blockchain, and that entry acts as a digital pink slip.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
          
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle7.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                How is an NFT valued? What are the most expensive NFTs?
              </Button>
              <Modal
                size="sm"
                isOpen={modal7}
                toggle={toggle7.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle7.bind(null)} className="bg-surface text-text border-white/10">How is an NFT valued? What are the most expensive NFTs?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">The value of an NFT can vary widely based on the digital asset up for grabs. NFTs are becoming an increasingly popular way to acquire and sell digital artwork, so valuing an NFT would look at the popularity of an artist along with the historical sales of NFTs.
<br/><br/>
Dragon the CryptoKitty continues to be one of the most expensive NFTs in the space, valued at 600 ETH.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
          
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle8.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                Are NFTs the future of art and collectibles?
              </Button>
              <Modal
                size="sm"
                isOpen={modal8}
                toggle={toggle8.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle8.bind(null)} className="bg-surface text-text border-white/10">Are NFTs the future of art and collectibles?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">It depends on whom you ask. Artists, musicians, athletes, celebrities, and others find NFTs attractive because they offer a new and unique way to sell their wares — including things like GIFs, memes, and tweets — directly to fans. NFTs also provide artists an opportunity to program in continued royalties if it is sold to a new owner. Galleries see potential for reaching a new generation of collectors.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
          
          <Col md="4" className="mb-6">
            <div className="modern-card p-6 h-full">
              <Button
                color="info"
                type="button"
                onClick={toggle9.bind(null)}
                className="btn-outline-modern w-full text-left justify-start h-auto py-4"
              >
                Can NFTs be used as an investment?
              </Button>
              <Modal
                size="sm"
                isOpen={modal9}
                toggle={toggle9.bind(null)}
                className={props.className}
              >
                <ModalHeader toggle={toggle9.bind(null)} className="bg-surface text-text border-white/10">Can NFTs be used as an investment?</ModalHeader>
                <ModalBody className="bg-surface text-text">
                  <p className="m-b-0 font-14">Under the current circumstances, NFTs can be used as an investment. One can purchase an NFT and resell it with profits. Certain NFT marketplaces even allow NFT sellers to gain royalties for the sold assets.</p>
                </ModalBody>
              </Modal>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FAQsComponent;
