import { defineChain } from "thirdweb";

 /*export const myChain = defineChain({
    id: 81,
    rpc: " https://evm.shibuya.astar.network",
  });*/

  export const myChain = defineChain({
    id: 4202,
    rpc: "https://4202.rpc.thirdweb.com/" + (process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID || ""),
  });