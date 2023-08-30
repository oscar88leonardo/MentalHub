import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req, res) {
  // get the tokenId from the query params
  const tokenId = req.query.tokenId;
  let path = 'dataNFT/' + tokenId + '.json';
  try {
    let isFile = true;
      try {
        await fs.access(path);
      } catch {
        isFile = false;
      }
      if(isFile) {
        const fileContents = await fs.readFile(path, 'utf8');
        console.log(fileContents);
        //Return the content of the data file in json format
        res.status(200).json(fileContents);
      }
  } catch (err) {
    console.error(err);
  }
  /*// As all the images are uploaded on github, we can extract the images from github directly.
  const image_url =
    "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/";
  // The api is sending back metadata for a Crypto Dev
  // To make our collection compatible with Opensea, we need to follow some Metadata standards
  // when sending back the response from the api
  // More info can be found here: https://docs.opensea.io/docs/metadata-standards
  res.status(200).json({
    name: "Crypto Dev #" + tokenId,
    description: "Crypto Dev is a collection of developers in crypto",
    image: image_url + tokenId + ".svg",
  });*/
}
