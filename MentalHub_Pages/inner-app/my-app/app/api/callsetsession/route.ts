import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createThirdwebClient,
  defineChain,
  getContract, 
  prepareContractCall, 
  toWei,
  resolveMethod,
  sendTransaction } from "thirdweb";
  import { privateKeyToAccount } from "thirdweb/wallets";
  import { abi, NFT_CONTRACT_ADDRESS } from "../../../constants/MembersAirdrop";
import { client } from "../../../innerComp/client";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY as `0x${string}`;

export async function POST(req: Request) {

  try {
    console.log("Request callsetsession:", req);
    const response = await fetch(`/api/setsession`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log("Response from callsetsession:", data);
    //res.status(response.status).json(data);

    return NextResponse.json({ status: "success", msg: "minted", data: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}