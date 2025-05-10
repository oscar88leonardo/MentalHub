require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config({ path: ".env" });

const METISNODE_HTTP_URL = process.env.METISNODE_HTTP_URL;
const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;


module.exports = {
  solidity: "0.8.9",
  networks: {
    metis_sepolia: {
      url: METISNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
      chainId: 59902
    },   
    polygon_mumbai: {
      url: QUICKNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      metis_sepolia: "metis_sepolia", // apiKey is not required, just set a placeholder
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