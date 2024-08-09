import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: process.env.PINATA_GATEWAY!,
  });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    console.log('file:');
    console.log(file);

    try {
        const upload = await pinata.upload.file(file);
        console.log(upload);

        revalidatePath("/");

        return NextResponse.json({ status: "success", IpfsHash: process.env.PINATA_GATEWAY + '/ipfs/' + upload.IpfsHash });
      } catch (error) {
        console.log(error);
        return NextResponse.json({ status: "fail", error: error });
      }

    /*const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(`./public/uploads/${file.name}`, buffer);*/
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}