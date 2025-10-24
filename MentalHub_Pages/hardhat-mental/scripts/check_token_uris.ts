import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  // Dirección del contrato MembersAirdrop en Arbitrum Sepolia
  const MEMBERS_CONTRACT_ADDRESS = "0xE49AcfF5b7e0C0cc8252F9420a553c61BE02eAf3";
  
  // Obtener la instancia del contrato
  const MembersAirdrop = await ethers.getContractFactory("MembersAirdrop");
  const membersContract = MembersAirdrop.attach(MEMBERS_CONTRACT_ADDRESS);
  
  console.log("=== Verificación de URIs del contrato MembersAirdrop ===");
  console.log(`Dirección del contrato: ${MEMBERS_CONTRACT_ADDRESS}`);
  console.log(`Red: Arbitrum Sepolia`);
  console.log("");
  
  try {
    // Como _baseURI() y _gatewayURI() son funciones internas, vamos a usar tokenURI() para obtener el patrón
    // Primero verificamos si hay tokens minteados
    const totalSupply = await membersContract.getTokenIds();
    
    if (totalSupply > 0) {
      // Obtenemos el tokenURI del primer token para deducir el baseURI
      const tokenURI = await membersContract.tokenURI(1);
      const gatewayURI = await membersContract.gatewayURI(1);
      
      console.log(`tokenURI(1): ${tokenURI}`);
      console.log(`gatewayURI(1): ${gatewayURI}`);
      
      // Extraemos el _baseTokenURI removiendo el "1.json" del final
      const baseTokenURI = tokenURI.replace("1.json", "");
      const gatewayTokenURI = gatewayURI.replace("1.json", "");
      
      console.log(`_baseTokenURI (deducido): ${baseTokenURI}`);
      console.log(`_gatewayTokenURI (deducido): ${gatewayTokenURI}`);
    } else {
      console.log("No hay tokens minteados aún, no se puede deducir el baseURI");
    }
    
    console.log("");
    console.log("=== Información adicional ===");
    
    // Obtener información adicional del contrato
    const name = await membersContract.name();
    const symbol = await membersContract.symbol();
    const maxSupply = await membersContract.maxTokenIds();
    const owner = await membersContract.owner();
    
    console.log(`Nombre del contrato: ${name}`);
    console.log(`Símbolo: ${symbol}`);
    console.log(`Tokens minteados: ${totalSupply}`);
    console.log(`Suministro máximo: ${maxSupply}`);
    console.log(`Owner del contrato: ${owner}`);
    
  } catch (error) {
    console.error("Error al obtener información del contrato:", error);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
