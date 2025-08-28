
// METIS GOERLI TESTNET
//export const WHITELIST_CONTRACT_ADDRESS = "0x3F32B7e7A5B8297Ae8Ab86b1EbaC9831CE4047fD";
// METIS SEPOLIA TESTNET
export const WHITELIST_CONTRACT_ADDRESS = "0x2C20B0E2d623610aEdEA9a1A10DE0AEbebad6f88";
//Shibuya
//export const WHITELIST_CONTRACT_ADDRESS = "0x7452e1D4353Cb41DDbb4De4F84F0D129247d98d9";
// POLYGON MUMBAI TESTNET
// export const WHITELIST_CONTRACT_ADDRESS ="0xB73e449442055e1310E467bb657469e402aBd904";

export const abi = [
  {
    "inputs": [   
      {
        "internalType": "uint8",
        "name": "_maxWhitelistedAddresses",
        "type": "uint8"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "addAddressToWhitelist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxWhitelistedAddresses",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numAddressesWhitelisted",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "whitelistedAddresses",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
