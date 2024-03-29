import axios from 'axios';
import * as fs from 'fs';
import { stringify } from 'querystring';
import path from 'path';
//import { promises as fs } from 'fs';


export default async function handler(req, res) {
     
  const API_KEY = process.env.API_KEY;
  const HOST_WALLET = process.env.HOST_WALLET;
  //const fileroomPath = './pages/api/hdrooms.txt'
  //const fs = require("fs");

  //Find the absolute path of the json directory
  console.log("antes de filepath");
  console.log(process.cwd());
  //const fileroomPath = path.join(process.cwd(), 'hdrooms.txt');
  const fileroomPath = '/tmp/hdrooms.txt';
  console.log("FILEPATH:");
  console.log(fileroomPath);
  //Read the json data file data.json
  //const fileContents = await fs.readFile(jsonDirectory + '/data.json', 'utf8');


  const fs = require("fs");
  var existFile = false;

  
  if (fs.existsSync(fileroomPath)) {
        existFile = true;
      }
      else {
        existFile = false;
      }
  

    console.log('existFile:');
    console.log(existFile);
    if (existFile){
    const rooms = JSON.parse(fs.readFileSync(fileroomPath,'utf-8'));
    console.log(rooms);
    res.status(200).json(rooms);
    } else {
        console.log("estoy en el catch antes de axios");
        try{  
          const response = await axios.post(
          'https://api.huddle01.com/api/v1/create-room',
          {
          title: 'MentalHub-ComTest',
          hostWallets: [HOST_WALLET],
          },
          {
          headers: {
              'Content-Type': 'application/json',
              //'x-api-key': 'g5Tcae7LDpaNHc6-sHlbuxMnahWnkcnt',
              'x-api-key': API_KEY,
          },
          }
        );
        console.log("estoy en el catch despues de axios");        
        console.log(response.data);
        res.status(200).json(response.data.data);        
        fs.writeFileSync(fileroomPath, JSON.stringify(response.data.data) );
        } catch (error) {
               console.log(error);
              res.status(error.response.status).json({ message: error.message });
        }
      }  
               
}

   
  