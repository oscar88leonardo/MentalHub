import type { ChainKey } from "./chain";
import { CHAIN } from "./chain";

type Contracts = {
  membersAirdrop: string;
  whitelist: string;
  membersgovernor?: string;
};

const MAP: Record<ChainKey, Contracts> = {
  'arbitrum-sepolia': {
    membersgovernor: "0xE79e3c6CC2a258D0b74692F4A3645Db31f8A0AC0",//"0x51a109A3f06f3D6cE610b5c94CB3Be91553f1390", // MembersGovernorTimeBased actualizado con validación de 1 minuto
    membersAirdrop: "0x609ee5AC3154Aa8501Ccfd0D4521469Eb747E0B7",//"0x0868c53AcD1D4713AbA14F0199C8006e039635D5", // NFT existente
    whitelist: "0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88",
  },
  'metis-sepolia': {
    membersAirdrop: "0xcc1515239C446f6f1a3D49fEb8953f68c4F84cDA",
    whitelist: "0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88",
  },
  'lisk-sepolia': {
    membersAirdrop: "0xE49AcfF5b7e0C0cc8252F9420a553c61BE02eAf3",
    whitelist: "0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88",
  },
  'shibuya': {
    membersAirdrop: "0x7BCbe9a7A35793A9031C0cAA3DfD2A46212a40c5",
    whitelist: "0x7452e1D4353Cb41DDbb4De4F84F0D129247d98d9",
  },
  'polygon-mumbai': {
    membersAirdrop: "0xd97533D7a552e2c793cdC477C0DcA64e76c76E3b",
    whitelist: "0xB73e449442055e1310E467bb657469e402aBd904",
  },
};

export const contracts = MAP[CHAIN];



