import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files } from 'formidable'
import { promises as fs } from 'fs'
import axios from 'axios'
//import concat from 'concat-stream'
import FormData from 'form-data'

export const config = {
    api:{
          bodyParser: false
        },
    headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5NjcwNTA2NzZGNDllZmE3Q2MyMTlDRTc3QTU3QjJlMjBDMDI3RjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAwNjQxNDIwNDQsIm5hbWUiOiJUZXN0In0.87lNftjfCcFkXvIu6N_j115oye6pxb6_iWF80DSamrQ'
    }
}

const parseFormData = (req: NextApiRequest): Promise<{fields: Fields, files: Files}> => new Promise((resolve, reject) => {
    const form = new IncomingForm({multiples: false})
    form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
    })
})

const request = async (req: NextApiRequest, image: Buffer) => {
    const data = new FormData();
    const blob = new Blob([image]);
    data.append('file', image);
    req.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5NjcwNTA2NzZGNDllZmE3Q2MyMTlDRTc3QTU3QjJlMjBDMDI3RjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAwNjQxNDIwNDQsIm5hbWUiOiJUZXN0In0.87lNftjfCcFkXvIu6N_j115oye6pxb6_iWF80DSamrQ';
    console.log('data:')
    console.log(data)
    /*const response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5NjcwNTA2NzZGNDllZmE3Q2MyMTlDRTc3QTU3QjJlMjBDMDI3RjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAwNjQxNDIwNDQsIm5hbWUiOiJUZXN0In0.87lNftjfCcFkXvIu6N_j115oye6pxb6_iWF80DSamrQ",

        },
        body: data,
        });
    
    
    return response;*/

    /*data.pipe(concat(data => {    
        const url = 'https://api.web3.storage/upload';
        const headers = {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5NjcwNTA2NzZGNDllZmE3Q2MyMTlDRTc3QTU3QjJlMjBDMDI3RjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAwNjQxNDIwNDQsIm5hbWUiOiJUZXN0In0.87lNftjfCcFkXvIu6N_j115oye6pxb6_iWF80DSamrQ',
          ...data.getHeaders()
        };
    
        const result = await axios({
          'post',
          url: 'https://api.web3.storage/upload',
          data: data,
          headers,
        });
    
        return result.data;
      }))*/
    //headers: req.headers as any,
    //"Content-Length": blob.size,
    /*headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5NjcwNTA2NzZGNDllZmE3Q2MyMTlDRTc3QTU3QjJlMjBDMDI3RjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAwNjQxNDIwNDQsIm5hbWUiOiJUZXN0In0.87lNftjfCcFkXvIu6N_j115oye6pxb6_iWF80DSamrQ",

    },*/
    /*const https = require('https');
    const fCa = await fs.readFile('/home/selpmascre/MentalHub/MentalHub_Pages/my-app/certs/Builtin Object Token_Baltimore CyberTrust Root').toString()
    const fCert = fCa
    const httpsAgent = new https.Agent({
        ca: fCa,
        //cert: fCert,
    });*/
    return axios.post('https://api.web3.storage/upload', data, {
        headers: req.headers as any,  
        //httpsAgent,
    })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const fData = await parseFormData(req)
    console.log('fData:')
    console.log(JSON.stringify(fData))
    const imageFile = fData.files.path as any
    console.log('imageFile:')
    console.log(imageFile)
    console.log('imageFile.length:')
    console.log(imageFile.length)
    const tempImagePath = imageFile[0].filepath
    console.log('tempImagePath:')
    console.log(tempImagePath)
    const image = await fs.readFile(tempImagePath)
    console.log('image:')
    console.log(image)
    try {
        const response = await request(req, image)
        console.log('response:')
        console.log(response)
        res.status(response.status).json(response)
    }
    catch (error: any) {
        console.error(error)
        res.status(500).json({error: error.message})
    }
    finally {
        fs.rm(tempImagePath)
    }

    res.end()
}