import { defineChain } from "thirdweb";

export const myChain = defineChain({
    id: 59902,
    rpc: "https://59902.rpc.thirdweb.com/" + process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID || "",
});
