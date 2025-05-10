const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL, GATEWAY_URI } = require("../constants/cNFTCol");


async function main() {
    
  //NFT Collection DEPLOY 
  
  // Address of the whitelist contract that you deployed in the previous module
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;
  
  const MembersAirdropContract = await ethers.getContractFactory("MembersAirdrop");

  // deploy the contract
  const deployedMembersAirdropContract = await MembersAirdropContract.deploy(
    metadataURL,
    GATEWAY_URI,
    whitelistContract
  );

  // Wait for it to finish deploying
  await deployedMembersAirdropContract.deployed();
    
  // print the address of the deployed contract
  const contractAddress = deployedMembersAirdropContract.address;
  console.log("MembersAirdrop contract Address:", contractAddress);
  
   // Esperar unos bloques para la verificación
   console.log("Esperando bloques...");
   await new Promise(resolve => setTimeout(resolve, 30000));
 
   // Verificar el contrato
   console.log("Verificando contrato...");
   try {
   await hre.run("verify:verify", {
     address: contractAddress,
     constructorArguments: [
       METADATA_URL,
       GATEWAY_URI,
       whitelistContract
     ],
   });
   console.log("Contrato verificado con éxito");
  } catch (error) {
   console.error("Error al verificar el contrato:", error);
  } 
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