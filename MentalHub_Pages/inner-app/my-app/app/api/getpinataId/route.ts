import {NextRequest, NextResponse} from "next/server";

export async function GET (request: NextRequest){    
  try {
        let varet={
          PINATA_GATEWAY:process.env.PINATA_GATEWAY,
          PINATA_API_KEY:process.env.PINATA_API_KEY,
          PINATA_SECRET:process.env.PINATA_SECRET_API_KEY
        };

        return NextResponse.json(varet);
    } catch (error) {
      console.log(error);
      return NextResponse.json({status:500, message: error });
    }
  }

