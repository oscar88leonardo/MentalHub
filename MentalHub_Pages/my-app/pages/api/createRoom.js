import axios from 'axios';
import * as fs from 'fs';
import { stringify } from 'querystring';


export default async function handler(req, res) {
     
  const API_KEY = process.env.API_KEY;
  const HOST_WALLET = process.env.HOST_WALLET;
  const fileroomPath = './pages/api/hdrooms.txt'
  const fs = require("fs");

    try {                   
          if (!fs.existsSync(fileroomPath)){
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
        //console.log(response.data);
        res.status(200).json(response.data.data);        
        fs.writeFileSync(fileroomPath, JSON.stringify(response.data.data) );
        } else {
          const rooms = JSON.parse(fs.readFileSync(fileroomPath,'utf-8'));
          console.log(rooms);
          res.status(200).json(rooms);
        }

      } catch (error) {
        console.log(error);
        res.status(error.response.status).json({ message: error.message });
      }    
  }

   
  