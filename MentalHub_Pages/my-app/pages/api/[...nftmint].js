import path from 'path';
import { promises as fs } from 'fs';

export default function handler(req, res) {
  // get the tokenId from the query params
  //const tokenId = req.query.tokenId;
  const { nftmint } = req.query

  const tokenId = nftmint[0];

  let dataJson = {
    'address':nftmint[1],
    'pathImage':'NFT_CollPreview/'+nftmint[2],
    'contSessions':nftmint[3]
  }

  console.log(tokenId);
  console.log(dataJson);

  let data = JSON.stringify(dataJson);
  fs.writeFile('dataNFT/'+tokenId+'.json', data);
  
  res.status(200).json({
    message: "Token " + tokenId + " Created.",
  });
}
