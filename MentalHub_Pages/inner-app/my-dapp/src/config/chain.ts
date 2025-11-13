import { defineChain } from "thirdweb";

export type ChainKey = 'arbitrum-sepolia' | 'metis-sepolia' | 'lisk-sepolia' | 'shibuya' | 'polygon-mumbai';

const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID || "";

export const CHAINS: Record<ChainKey, { id: number; rpc: string }> = {
  'arbitrum-sepolia': { id: 421614, rpc: 'https://sepolia-rollup.arbitrum.io/rpc' },
  'metis-sepolia': { id: 59902, rpc: 'https://sepolia.metisdevops.link' },
  'lisk-sepolia': { id: 4202, rpc: 'https://rpc.sepolia-api.lisk.com' },
  'shibuya': { id: 81, rpc: 'https://evm.shibuya.astar.network' },
  'polygon-mumbai': { id: 80001, rpc: 'https://rpc-mumbai.maticvigil.com' },
};

export const CHAIN: ChainKey = (process.env.NEXT_PUBLIC_CHAIN as ChainKey) /*|| 'metis-sepolia'*/;

// Fallback RPC de thirdweb en caso de necesitarlo
export const THIRDWEB_FALLBACK_RPC = CLIENT_ID ? `https://${CHAINS[CHAIN].id}.rpc.thirdweb.com/${CLIENT_ID}` : "";
const isBrowser = typeof window !== 'undefined';

export const myChain = defineChain({
  id: CHAINS[CHAIN].id,
  rpc: isBrowser
    ?  THIRDWEB_FALLBACK_RPC //cliente para evitar CORS/429
    : CHAINS[CHAIN].rpc || THIRDWEB_FALLBACK_RPC, 
});



