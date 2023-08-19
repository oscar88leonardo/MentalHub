import axios from 'axios';

export default async function handler(req, res) {
     try {
        const API_KEY = process.env.API_KEY;
        //const API_KEY = "g5Tcae7LDpaNHc6-sHlbuxMnahWnkcnt";
        console.log("API_KEY:");
        console.log(API_KEY);
        // post and get response
        const response = await axios.post(
            'https://api.huddle01.com/api/v1/create-room',
            {
            title: 'MentalHub-ComTest',
            hostWallets: ['0x81b7FB48C1bf438Aab66cdDc851c390DA5f2eEb5'],
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
       res.status(200).json(response.data);
     } catch (error) {
       console.log(error);
       res.status(error.response.status).json({ message: error.message });
     }
   }

   
  