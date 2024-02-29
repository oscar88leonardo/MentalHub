import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req, res) {
  // get the tokenId from the query params
  //const tokenId = req.query.tokenId;
  const { nftmint } = req.query

  const tokenId = nftmint[0];
  
  let pathDigContent = "";
  
  if(nftmint[2] === "url") {
    const fileContents = await fs.readFile('dataNFT/baseUrlsDigContent.json', 'utf8');
    const urlDigCont = JSON.parse(fileContents);
    for (var key in urlDigCont) {
      if(urlDigCont[key].name === nftmint[3])
        pathDigContent = urlDigCont[key].url;
    };
  } else
    pathDigContent = 'NFT_CollPreview/'+nftmint[3];
  
  let dataJson = {
    'name':nftmint[1],
    'pathImage':pathDigContent,
    'contSessions':nftmint[4]
  }

  console.log(tokenId);
  console.log(dataJson);

  /*const pinataSDK = require('@pinata/sdk');
  const pinata = new pinataSDK({ pinataJWTKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmMDg0YjcxNi1lOGI2LTQ0MjMtODExOC1lZWMwYjcyN2VlNzIiLCJlbWFpbCI6Im1lbnRhbGh1YnByb2plY3RAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjllMTM3ODhkNGI3YWYyNGQ0MWE1Iiwic2NvcGVkS2V5U2VjcmV0IjoiMjYwYTU5MzkxZjIwOTk3ODZlZjEwZjkxMGUyZjJmM2Y4ZWNiZGUzMjZmYzI4MzQ5YWE0NzBhZjdjYjY2MjU5YSIsImlhdCI6MTY3OTIwMDU3OX0.G-t-FUTLotlPZfUn5NGejsnO12u97-zVKW-b3DUEHtU'});*/

  /*const body = {
      message: 'Pinatas are awesome'
  };*/
  /*const options = {
      pinataMetadata: {
          name: tokenId+'.json',*/
          /*keyvalues: {
              customKey: 'customValue',
              customKey2: 'customValue2'
          }*/
      /*},
      pinataOptions: {
          cidVersion: 0,
          wrapWithDirectory: true
      }
  };
  pinata.pinJSONToIPFS(dataJson, options).then((result) => {
      //handle results here
      console.log(result);
  }).catch((err) => {
      //handle error here
      console.log(err);
  });*/

  let data = JSON.stringify(dataJson);
  fs.writeFile('dataNFT/'+tokenId+'.json', data);
  
  res.status(200).json({
    message: "Token " + tokenId + " Created.",
  });
}
