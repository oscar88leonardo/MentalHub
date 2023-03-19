// Address of the Whitelist Contract that you deployed

// METIS GOERLI TESTNET
const WHITELIST_CONTRACT_ADDRESS = "0x3F32B7e7A5B8297Ae8Ab86b1EbaC9831CE4047fD";
// POLYGON MUMBAI TESTNET
// const WHITELIST_CONTRACT_ADDRESS = "0xB73e449442055e1310E467bb657469e402aBd904";

// URL to extract Metadata  NFT on localhost
//const METADATA_URL = "http://localhost:3000/api/";

// URL to extract Metadata  NFT from IPFS
const METADATA_URL = "ipfs://QmVXhxsUvGBXea1Z3HZPidnj9Gy7smWVvSNqz9dviyjBx9/"; 
// METADATA ON VERCEL APP
//const METADATA_URL = "https://nft-collection-sneh1999.vercel.app/api/"; 

const GATEWAY_URI ="https://gateway.pinata.cloud/ipfs/QmVXhxsUvGBXea1Z3HZPidnj9Gy7smWVvSNqz9dviyjBx9/";

module.exports = { WHITELIST_CONTRACT_ADDRESS, METADATA_URL, GATEWAY_URI};