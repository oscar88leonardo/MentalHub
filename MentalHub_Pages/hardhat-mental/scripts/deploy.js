const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
    
  //NFT Collection DEPLOY 
  
  // Address of the whitelist contract that you deployed in the previous module
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;
  
  const NFTCol_MHMembersContract = await ethers.getContractFactory("NFTCol_MHMembers");

  // deploy the contract
  const deployedNFTCol_MHMembersContract = await NFTCol_MHMembersContract.deploy(
    metadataURL,
    whitelistContract
  );

  // Wait for it to finish deploying
  await deployedNFTCol_MHMembersContract.deployed();
    
  // print the address of the deployed contract
  console.log(
    "NFT Col Members Contract Address:",
    deployedNFTCol_MHMembersContract.address
  ); 
  
    
  /*
  // WHITELIST DEPLOY
  //A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  //so whitelistContract here is a factory for instances of our Whitelist contract.
  
  const whitelistContract = await ethers.getContractFactory("Whitelist");

  // here we deploy the contract
  const deployedWhitelistContract = await whitelistContract.deploy(10);
  // 10 is the Maximum number of whitelisted addresses allowed

  // Wait for it to finish deploying
  await deployedWhitelistContract.deployed();

  // print the address of the deployed contract
  console.log("Whitelist Contract Address:", deployedWhitelistContract.address);
  */
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });