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
  console.log("Request setsession:", req);
  // Validación de autorización
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
    return NextResponse.json({ status: "fail", error: "Unauthorized" }, { status: 401 });
  }

  try {

    const wallet = privateKeyToAccount({
      client,
      privateKey: PRIVATE_KEY,
    });

    console.log("wallet:", wallet);
    console.log("PRIVATE_KEY:", PRIVATE_KEY);

    return NextResponse.json({ status: "success", msg: "minted" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}