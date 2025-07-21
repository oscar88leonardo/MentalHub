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
import { myChain } from "../../../innerComp/myChain";

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY as `0x${string}`;

export async function POST(req: Request) {
  console.log("Request setsession:", req);
  const body = await req.json();
  console.log("body:", body);
  // Validación de autorización
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
    return NextResponse.json({ status: "fail", error: "Unauthorized" }, { status: 401 });
  }

  // incializacion del contrato
  const contract =   getContract({
        client: client!,
        chain: myChain,
        address: NFT_CONTRACT_ADDRESS,
        // The ABI for the contract is defined here
        abi: abi as [],
      });

  try {

    const account = privateKeyToAccount({
      client,
      privateKey: PRIVATE_KEY,
    });

    console.log("account:", account);
    //console.log("PRIVATE_KEY:", PRIVATE_KEY);
    console.log("contract setSession:");
    console.log(contract);
    
    const tx = prepareContractCall({
      contract,
      // We get auto-completion for all the available functions on the contract ABI
      method: resolveMethod("setSession"),
      // including full type-safety for the params
      params: [body.tokenId? BigInt(body.tokenId) : null,body.scheduleId,Number(body.state)],
      // solo enviar valor si no es sponsoreado
      value: toWei("0"),
    });

    if (account) {
      //let tx = null;
      
      const { transactionHash } = await sendTransaction({
        account: account!,
        transaction: tx,
      });
      console.log("transactionHash setSession:");
      console.log(transactionHash);

    } else {
      console.log("No hay una billetera activa.");
    }
    return NextResponse.json({ status: "success", msg: "executed setsession" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e }, { status: 500 });
  }
}