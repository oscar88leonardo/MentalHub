import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  // Dirección del contrato MembersAirdrop en Arbitrum Sepolia
  const MEMBERS_CONTRACT_ADDRESS = "0xE49AcfF5b7e0C0cc8252F9420a553c61BE02eAf3";
  
  // Obtener la instancia del contrato
  const MembersAirdrop = await ethers.getContractFactory("MembersAirdrop");
  const membersContract = MembersAirdrop.attach(MEMBERS_CONTRACT_ADDRESS);
  
  console.log("=== Análisis detallado de URIs ===");
  console.log(`Dirección del contrato: ${MEMBERS_CONTRACT_ADDRESS}`);
  console.log("");
  
  try {
    const totalSupply = await membersContract.getTokenIds();
    console.log(`Tokens minteados: ${totalSupply}`);
    
    if (totalSupply > 0) {
      // Probar con diferentes token IDs
      for (let i = 1; i <= Math.min(totalSupply, 3); i++) {
        console.log(`\n--- Token ID ${i} ---`);
        
        try {
          const tokenURI = await membersContract.tokenURI(i);
          const gatewayURI = await membersContract.gatewayURI(i);
          
          console.log(`tokenURI(${i}): ${tokenURI}`);
          console.log(`gatewayURI(${i}): ${gatewayURI}`);
          
          // Analizar las URLs
          if (tokenURI.includes('.json')) {
            const baseFromToken = tokenURI.replace(`${i}.json`, '');
            console.log(`Base URI deducido de tokenURI: ${baseFromToken}`);
          }
          
          if (gatewayURI.includes('.json')) {
            const gatewayFromToken = gatewayURI.replace(`${i}.json`, '');
            console.log(`Gateway URI deducido de gatewayURI: ${gatewayFromToken}`);
          }
          
        } catch (error) {
          console.log(`Error obteniendo URIs para token ${i}:`, error.message);
        }
      }
    }
    
    // Información del contrato
    console.log("\n=== Información del contrato ===");
    const name = await membersContract.name();
    const symbol = await membersContract.symbol();
    const maxSupply = await membersContract.maxTokenIds();
    const owner = await membersContract.owner();
    const paused = await membersContract._paused();
    const airdropStarted = await membersContract.airdropStarted();
    
    console.log(`Nombre: ${name}`);
    console.log(`Símbolo: ${symbol}`);
    console.log(`Suministro máximo: ${maxSupply}`);
    console.log(`Owner: ${owner}`);
    console.log(`Pausado: ${paused}`);
    console.log(`Airdrop iniciado: ${airdropStarted}`);
    
  } catch (error) {
    console.error("Error general:", error);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
