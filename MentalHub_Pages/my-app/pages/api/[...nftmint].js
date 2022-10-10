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

  let data = JSON.stringify(dataJson);
  fs.writeFile('dataNFT/'+tokenId+'.json', data);
  
  res.status(200).json({
    message: "Token " + tokenId + " Created.",
  });
}
