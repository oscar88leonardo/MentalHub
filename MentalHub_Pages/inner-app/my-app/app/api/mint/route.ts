import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createThirdwebClient,
  defineChain,
  getContract, 
  prepareContractCall, 
  toWei,
  resolveMethod,
  sendTransaction } from "thirdweb";
  import { abi, NFT_CONTRACT_ADDRESS } from "../../../constants/MembersAirdrop";

export async function POST(req: Request) {
  try {
    const myChain = defineChain({
      id: 59902,
      rpc: "https://59902.rpc.thirdweb.com/" + process.env.THIRDWEB_CLIENTID || "",
    });
    console.log("THIRDWEB_SECRET_KEY");
    console.log(process.env.THIRDWEB_SECRET_KEY);
    let clientThridweb = null;
    // Create a new instance of Thirdweb client
    if (process.env.THIRDWEB_SECRET_KEY) {
      clientThridweb = createThirdwebClient({
        secretKey: process.env.THIRDWEB_SECRET_KEY || "",
      });
    }
    console.log("minting");

    const body = await req.json();
    console.log("body");
    console.log(body);
    const contract = getContract({
      client: clientThridweb!,
      chain: myChain,
      address: NFT_CONTRACT_ADDRESS,
      // The ABI for the contract is defined here
      abi: abi as [],
    });
    console.log("contract publicMint:");
    console.log(contract);
      
    const tx = prepareContractCall({
      contract,
      // We get auto-completion for all the available functions on the contract ABI
      method: resolveMethod("mint"),
      // including full type-safety for the params
      params: [2],
      value: toWei("0.01"),
    });

    // Convert BigInt values to strings before serializing
    const txSerialized: any = {};
    for (const key in tx) {
      const typedKey = key as keyof typeof tx;
      if (typeof tx[typedKey] === 'bigint') {
        txSerialized[typedKey] = tx[typedKey].toString();
      } else {
        txSerialized[typedKey] = tx[typedKey];
      }
    }

    return NextResponse.json({ status: "success", msg: "minted", transaction: txSerialized });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e });
  }
}