require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config({ path: ".env" });

// wallet para deploys
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// EVM Configs
const SOLC_VERSION = "0.8.26";
const EVM_VERSION = "cancun";
const VIA_IR = false;

const sanitizePk = (k) => {
  if (!k) return k;
  const trimmed = k.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  return trimmed.startsWith("0x") ? trimmed : ("0x" + trimmed);
};

module.exports = {
  solidity: {
    version: SOLC_VERSION,
    settings: {
      evmVersion: EVM_VERSION,
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: VIA_IR
    },
  },
  networks: {
    arbitrum_sepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 421614
    },
    metis_sepolia: {
      url:  "https://metis-sepolia-rpc.publicnode.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 59902
    },
    polygon_mumbai: {
      url: "https://quiet-multi-bird.matic-testnet.discover.quiknode.pro/11514888637b7e0629fb4741b7832b3d89c88629/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    shibuya: {
      url: "https://evm.shibuya.astar.network",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 81
    },
    lisk_sepolia: {
      url: "https://4202.rpc.thirdweb.com",
      accounts: PRIVATE_KEY ? [sanitizePk(PRIVATE_KEY)] : [],
      chainId: 4202
    }
  },
  
};