/* eslint-disable */
import React from "react";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
//import Image from "next/image";
import { Button } from "reactstrap";

const PortfolioComponent = () => {
  return (
    <div>
      <div className="spacer bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col md="7" className="text-center">
              <h1 className="title font-bold">FAQs</h1>
              <h6 className="subtitle">
                A frequently asked questions (FAQ) list is often used in articles, websites, email lists, and online forums where common questions tend to recur, for example through posts or queries by new users related to common knowledge gaps. The purpose of a FAQ is generally to provide information on frequent questions or concerns; however, the format is a useful means of organizing information, and text consisting of questions and their answers may thus be called a FAQ regardless of whether the questions are actually frequently asked
              </h6>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="spacer">
        <Container>
          <Row className="m-t-40">
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    What is an NFT?
                  </h5>
                  <p className="m-b-0 font-14">NFTs or non-fungible tokens, are cryptographic assets on blockchain with unique identification codes and metadata that distinguish them from each other. NFTs are unique and not mutually interchangeable, which means no two NFTs are the same. NFTs can be a unique digital artwork, sneaker in a limited-run fashion line, in-game item, digital collectible etc.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    What makes an NFT valuable?
                  </h5>
                  <p className="m-b-0 font-14">The value of an NFT comes from the property it represents, which is generally something that exists in the digital world like an original piece of art or digital memorabilia. The NFT itself doesn’t necessarily contain the digital property, but points to its location on the blockchain. Like a concert ticket or a deed to a physical property, an NFT reflects the value of the thing it represents.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    How do NFTs work?
                  </h5>
                  <p className="m-b-0 font-14">Traditional works of art such as paintings are valuable because they are one of a kind. But digital files can be easily and endlessly duplicated.
                  <br/><br/>
With NFTs, artwork can be “tokenised” to create a digital certificate of ownership that can be bought and sold. As with crypto-currency, a record of who owns what is stored on a shared ledger known as the blockchain.
<br/><br/>
The records cannot be forged because the ledger is maintained by thousands of computers around the world. NFTs can also contain smart contracts that may give the artist, for example, a cut of any future sale of the token.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    What’s the connection between NFTs and cryptocurrency?
                  </h5>
                  <p className="m-b-0 font-14">NFTs aren’t cryptocurrencies, but they are built using technology similar to Ethereum and Bitcoin. Also, like cryptocurrencies, NFTs exist on a blockchain, which verifies their unique identity and ownership. The blockchain also keeps a record of all the transactions connected to the NFT and the property it represents. Many NFTs are held on the Ethereum blockchain.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    How to make an NFT?
                  </h5>
                  <p className="m-b-0 font-14">NFTs are typically acquired from different curated platforms that specifically deal in digital assets. Open marketplaces, like OpenSea.io, are popular for buying and trading NFTs. For digital art, buyers can go to MakersPlace, Nifty Gateway, SuperRare and KnownOrigin.
<br/><br/>
It should be noted that some platforms accept USD as well as crypto, some platforms only accept cryptocurrencies, like OpenSea.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    How to validate the authencity of an NFT?
                  </h5>
                  <p className="m-b-0 font-14">NFT ownership is recorded on the blockchain, and that entry acts as a digital pink slip.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    How is an NFT valued? What are the most expensive NFTs?
                  </h5>
                  <p className="m-b-0 font-14">The value of an NFT can vary widely based on the digital asset up for grabs. NFTs are becoming an increasingly popular way to acquire and sell digital artwork, so valuing an NFT would look at the popularity of an artist along with the historical sales of NFTs.
<br/><br/>
Dragon the CryptoKitty continues to be one of the most expensive NFTs in the space, valued at 600 ETH.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    Are NFTs the future of art and collectibles?
                  </h5>
                  <p className="m-b-0 font-14">It depends on whom you ask. Artists, musicians, athletes, celebrities, and others find NFTs attractive because they offer a new and unique way to sell their wares — including things like GIFs, memes, and tweets — directly to fans. NFTs also provide artists an opportunity to program in continued royalties if it is sold to a new owner. Galleries see potential for reaching a new generation of collectors.</p>
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card className="card-shadow">
                <CardBody>
                  <h5 className="font-medium m-b-0">
                    Can NFTs be used as an investment?
                  </h5>
                  <p className="m-b-0 font-14">Under the current circumstances, NFTs can be used as an investment. One can purchase an NFT and resell it with profits. Certain NFT marketplaces even allow NFT sellers to gain royalties for the sold assets.</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default PortfolioComponent;
