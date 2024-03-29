require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const METISNODE_HTTP_URL = process.env.METISNODE_HTTP_URL;
const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;


module.exports = {
  solidity: "0.8.9",
  networks: {
    metis_goerli: {
      url: METISNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
    },   
    polygon_mumbai: {
      url: QUICKNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
    }
  },
};