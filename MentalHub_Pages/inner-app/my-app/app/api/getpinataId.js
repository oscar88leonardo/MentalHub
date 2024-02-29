export default async function handler(req, res) {
    
  try {
        let varet={
          PINATA_GATEWAY:process.env.PINATA_GATEWAY,
          PINATA_API_KEY:process.env.PINATA_API_KEY,
          PINATA_SECRET:process.env.PINATA_SECRET_API_KEY
        };
        res.status(200).json(varet);    
    } catch (error) {
      console.log(error);
      res.status(error.response.status).json({ message: error.message });
    }
  }

