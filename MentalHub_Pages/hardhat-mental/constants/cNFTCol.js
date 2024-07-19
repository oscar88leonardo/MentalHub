// Address of the Whitelist Contract that you deployed



// METIS SEPOLIA TESTNET
const WHITELIST_CONTRACT_ADDRESS = "0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88";
// POLYGON MUMBAI TESTNET
// const WHITELIST_CONTRACT_ADDRESS = "0xB73e449442055e1310E467bb657469e402aBd904";

// URL to extract Metadata  NFT on localhost
//const METADATA_URL = "http://localhost:3000/api/";

// URL to extract Metadata  NFT from IPFS
const METADATA_URL = "ipfs://bafybeieq7ah4ygw7dfkodzeuvwppml3n3d3l57llhq3xax6wxp2wu4uwym/"; 
// METADATA ON VERCEL APP
//const METADATA_URL = "https://nft-collection-sneh1999.vercel.app/api/"; 

const GATEWAY_URI ="https://nftstorage.link/ipfs/bafybeieq7ah4ygw7dfkodzeuvwppml3n3d3l57llhq3xax6wxp2wu4uwym/";

module.exports = { WHITELIST_CONTRACT_ADDRESS, METADATA_URL, GATEWAY_URI};