require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const METISNODE_HTTP_URL = process.env.METISNODE_HTTP_URL;
const ALCHEMY_HTTP_URL = process.env.ALCHEMY_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.9",
  networks: {
    goerlim: {
      url: METISNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
    },
    goerlie: {
      url: ALCHEMY_HTTP_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};