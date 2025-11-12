import { NextResponse } from "next/server";
// import { revalidatePath } from "next/cache";
import { getContract, prepareContractCall, toWei, resolveMethod, sendTransaction, readContract } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { abi } from "@/abicontracts/MembersAirdrop";
import { client } from "@/lib/client";
import { myChain } from "@/config/chain";
import { contracts } from "@/config/contracts";

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
        address: contracts.membersAirdrop,
        // The ABI for the contract is defined here
        abi: abi as [],
      });

  try {

    const account = privateKeyToAccount({
      client: client!,
      privateKey: PRIVATE_KEY,
    });

    //console.log("account:", account);
    //console.log("PRIVATE_KEY:", PRIVATE_KEY);
    //console.log("contract setSession:");
    //console.log(contract);
    
    // Helper para retry/backoff en caso de 429
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const withRetry = async <T,>(fn: () => Promise<T>, retries = 3, delay = 800): Promise<T> => {
      try { return await fn(); }
      catch (e: any) {
        const msg = String(e?.message || "");
        if (retries > 0 && (e?.code === 429 || msg.includes("Too Many"))) {
          await sleep(delay);
          return withRetry(fn, retries - 1, delay * 2);
        }
        throw e;
      }
    };

    // Pre-chequeo: si ya está en el mismo estado, no ejecutar transacción (tolerante a errores)
    try {
      const current = await withRetry(() => readContract({
        contract,
        method: "function getSessionState(uint256 tokenId, string scheduleId) view returns (uint8)",
        params: [BigInt(body.tokenId), body.scheduleId],
      }));
      if (Number(current) === Number(body.state)) {
        return NextResponse.json({ status: "success", msg: "noop (same state)" }, { status: 200 });
      }
    } catch {}

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
      const { transactionHash } = await withRetry(() => sendTransaction({
        account: account!,
        transaction: tx,
      }));
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


