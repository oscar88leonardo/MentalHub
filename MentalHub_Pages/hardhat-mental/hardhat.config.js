require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config({ path: ".env" });

const METISNODE_HTTP_URL = process.env.METISNODE_HTTP_URL;
const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const sanitizePk = (k) => {
  if (!k) return k;
  const trimmed = k.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  return trimmed.startsWith("0x") ? trimmed : ("0x" + trimmed);
};

module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    },
  },
  networks: {
    metis_sepolia: {
      url: METISNODE_HTTP_URL || "http://127.0.0.1:8545",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 59902
    },
    polygon_mumbai: {
      url: QUICKNODE_HTTP_URL || "http://127.0.0.1:8545",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    shibuya: {
      url: "https://evm.shibuya.astar.network",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 81
    },
    lisk_sepolia: {
      url: process.env.LISK_SEPOLIA_RPC || "https://4202.rpc.thirdweb.com",
      accounts: PRIVATE_KEY ? [sanitizePk(PRIVATE_KEY)] : [],
      chainId: 4202
    }
  },
  etherscan: {
    apiKey: {
      metis_sepolia: "metis_sepolia", // placeholder
    },
    customChains: [
      {
        network: "metis_sepolia",
        chainId: 59902,
        urls: {
          apiURL: "https://sepolia-explorer.metisdevops.link/api",
          browserURL: "https://sepolia-explorer.metisdevops.link"
        }
      }
    ]
  }
};