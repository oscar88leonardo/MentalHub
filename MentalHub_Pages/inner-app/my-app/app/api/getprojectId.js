export default async function handler(req, res) {
    try {
       const PJID = process.env.PJID;
       console.log("PJID:");
       console.log(PJID);
       // post and get response
      res.status(200).json(PJID);
    } catch (error) {
      console.log(error);
      res.status(error.response.status).json({ message: error.message });
    }
  }

  
 