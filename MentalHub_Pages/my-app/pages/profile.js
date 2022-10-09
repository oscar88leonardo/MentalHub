import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import Link from "next/link";
import { Row, Col, Container, Card, CardBody, NavLink } from "reactstrap";
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

  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change network to Metis Startdust TestNet");
      throw new Error("Change network to Metis Startdust TestNet");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      if(typeof window !== 'undefined'){
           window.localStorage.setItem("IsConnectWallet",true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /*
    renderButton: Returns a button based on the state of the dapp
  */
  const renderButton = () => {
    if (walletConnected) {
      return (
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
      );
    } else {
      return (
        <NavLink
          href="#"
          className="btn btn-light font-14"
          onClick={connectWallet}
        >
          Connect wallet
        </NavLink>
      );
    }
  };

 useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        //disableInjectedProvider: false,
        cacheProvider: true,
      });
      
      connectWallet();
    }
  }, [walletConnected]);
  
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

