// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//import { Web3Storage, getFilesFromPath } from 'web3.storage';
import { NextApiRequest, NextApiResponse } from "next";
import multiparty from "multiparty";
var mv = require('mv');
import { promises as fs } from 'fs';

const uploadImage = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new multiparty.Form();
  const data = await new Promise((resolve, reject) => {
    form.parse(req, function (err, fields, files) {
      if (err) reject({ err });
      resolve({ fields, files });
    });
  });
  console.log(`data: `, JSON.stringify(data));
  console.log(`length: `, data['files']['path'].length);
  console.log('req.headers:');
  console.log(req.headers);
  req.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5NjcwNTA2NzZGNDllZmE3Q2MyMTlDRTc3QTU3QjJlMjBDMDI3RjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAwNjQxNDIwNDQsIm5hbWUiOiJUZXN0In0.87lNftjfCcFkXvIu6N_j115oye6pxb6_iWF80DSamrQ';

  if(data['files']['path'].length > 0) {
    console.log(`path: `, data['files']['path'][0]['path']);

    let formData = new FormData();
    const tempImagePath = data['files']['path'][0]['path'];
    const image = await fs.readFile(tempImagePath);
    const blob = new Blob([image], {type: 'application/octet-stream'});
    formData.append("file", blob);

    fetch('https://api.web3.storage/upload', {
        method: "POST",
        headers: req.headers as any,
        body: formData,
    }).then(r => {
        console.log(r);
    })

    /*mv(data['files']['path'][0]['path'],
      '/home/selpmascre/MentalHub/MentalHub_Pages/my-app/assets/images/profile/' + data['files']['path'][0]['originalFilename'],
      function(err) {
    });

    const files = await getFilesFromPath('/home/selpmascre/MentalHub/MentalHub_Pages/my-app/assets/images/profile');
    console.log(`files: `, files);
    const client = new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDM5NjcwNTA2NzZGNDllZmE3Q2MyMTlDRTc3QTU3QjJlMjBDMDI3RjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAwNjQxNDIwNDQsIm5hbWUiOiJUZXN0In0.87lNftjfCcFkXvIu6N_j115oye6pxb6_iWF80DSamrQ" });
    const rootCid = await client.put(files);
    console.log("rootCid:"+rootCid);*/
  }

  res.status(200).json({ success: true });
};

export default uploadImage;
export const config = {
  api: {
    bodyParser: false,
  },
};
  