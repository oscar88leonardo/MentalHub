import React, { Component } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import Link from 'next/link';

let nftColink = "/NFTCol1";
let nftTitle = "It's Not You, it's your Anxiety!"
let nftCoAuthor = "By Pila Mental"
let nftCoAuthorLink = "https://www.instagram.com/pila_mental_/"

//<h5 className="title font-medium"> <Link href={NFTcol.Link}>{NFTcol.title}</Link>  </h5>
  
export default class NextJsCarousel extends Component {
    render() {
        return (
            <div>
              <Link href={nftColink}> 
                <h1 className="text-center title">{nftTitle}</h1>
              </Link>
              <Link href={nftCoAuthorLink}> 
                <h2 className="text-center title">{nftCoAuthor}</h2>
              </Link>
              <Carousel autoPlay={true} infiniteLoop={true} interval={1000} showThumbs={false}>
                  <div>
                      <img src="/NFT_CollPreview/ansiedad/a1.png"  alt="image1"/>
                      <p className="legend">Anxiety 17</p>
                  </div>
                  <div>
                      <img src="/NFT_CollPreview/ansiedad/a2.png"  alt="image2" />
                      <p className="legend">Anxiety 23</p>
  
                  </div>
                  <div>
                      <img src="/NFT_CollPreview/ansiedad/a3.png"  alt="image3"/>
                      <p className="legend">Anxiety 42</p>
                  </div>
                  <div>
                      <img src="/NFT_CollPreview/ansiedad/a4.png"  alt="image4"/>
                      <p className="legend">Anxiety 07</p>
                  </div>
              </Carousel>
            </div>
        );
    }
};
