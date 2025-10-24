import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  // Dirección del contrato MembersAirdrop en Arbitrum Sepolia
  const MEMBERS_CONTRACT_ADDRESS = "0xE49AcfF5b7e0C0cc8252F9420a553c61BE02eAf3";
  
  // Nuevos valores para las URIs
  const NEW_BASE_TOKEN_URI = "ipfs://bafybeiczmzkr475aziqlckugqveq5q3wpih3korhi3gr2iezxmavb5qcwy/";
  const NEW_GATEWAY_TOKEN_URI = "https://ivory-magnetic-guineafowl-976.mypinata.cloud/ipfs/bafybeiczmzkr475aziqlckugqveq5q3wpih3korhi3gr2iezxmavb5qcwy/";
  
  console.log("=== Actualización de URIs del contrato MembersAirdrop ===");
  console.log(`Dirección del contrato: ${MEMBERS_CONTRACT_ADDRESS}`);
  console.log(`Red: Arbitrum Sepolia`);
  console.log("");
  
  // Obtener la instancia del contrato
  const MembersAirdrop = await ethers.getContractFactory("MembersAirdrop");
  const membersContract = MembersAirdrop.attach(MEMBERS_CONTRACT_ADDRESS);
  
  try {
    // Verificar que somos el owner del contrato
    const owner = await membersContract.owner();
    const [deployer] = await ethers.getSigners();
    
    console.log(`Owner del contrato: ${owner}`);
    console.log(`Cuenta actual: ${deployer.address}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("La cuenta actual no es el owner del contrato");
    }
    
    console.log("✅ Verificación de ownership exitosa");
    console.log("");
    
    // Obtener valores actuales antes de la actualización
    console.log("=== Valores actuales ===");
    const totalSupply = await membersContract.getTokenIds();
    if (totalSupply > 0) {
      const currentTokenURI = await membersContract.tokenURI(1);
      const currentGatewayURI = await membersContract.gatewayURI(1);
      
      console.log(`tokenURI(1) actual: ${currentTokenURI}`);
      console.log(`gatewayURI(1) actual: ${currentGatewayURI}`);
      
      // Extraer base URIs actuales
      const currentBaseURI = currentTokenURI.replace("1.json", "");
      const currentGatewayBaseURI = currentGatewayURI.replace("1.json", "");
      
      console.log(`_baseTokenURI actual: ${currentBaseURI}`);
      console.log(`_gatewayTokenURI actual: ${currentGatewayBaseURI}`);
    }
    
    console.log("");
    console.log("=== Nuevos valores ===");
    console.log(`Nuevo _baseTokenURI: ${NEW_BASE_TOKEN_URI}`);
    console.log(`Nuevo _gatewayTokenURI: ${NEW_GATEWAY_TOKEN_URI}`);
    console.log("");
    
    // Actualizar _baseTokenURI
    console.log("🔄 Actualizando _baseTokenURI...");
    const tx1 = await membersContract.setbaseTokenURI(NEW_BASE_TOKEN_URI);
    console.log(`Transacción enviada: ${tx1.hash}`);
    await tx1.wait();
    console.log("✅ _baseTokenURI actualizado exitosamente");
    
    // Actualizar _gatewayTokenURI
    console.log("🔄 Actualizando _gatewayTokenURI...");
    const tx2 = await membersContract.setgatewayTokenURI(NEW_GATEWAY_TOKEN_URI);
    console.log(`Transacción enviada: ${tx2.hash}`);
    await tx2.wait();
    console.log("✅ _gatewayTokenURI actualizado exitosamente");
    
    console.log("");
    console.log("=== Verificación post-actualización ===");
    
    // Verificar los nuevos valores
    if (totalSupply > 0) {
      const newTokenURI = await membersContract.tokenURI(1);
      const newGatewayURI = await membersContract.gatewayURI(1);
      
      console.log(`tokenURI(1) nuevo: ${newTokenURI}`);
      console.log(`gatewayURI(1) nuevo: ${newGatewayURI}`);
      
      // Verificar que los valores son correctos
      const expectedTokenURI = NEW_BASE_TOKEN_URI + "1.json";
      const expectedGatewayURI = NEW_GATEWAY_TOKEN_URI + "1.json";
      
      console.log("");
      console.log("=== Verificación de resultados ===");
      console.log(`tokenURI esperado: ${expectedTokenURI}`);
      console.log(`tokenURI obtenido: ${newTokenURI}`);
      console.log(`✅ tokenURI correcto: ${newTokenURI === expectedTokenURI}`);
      
      console.log(`gatewayURI esperado: ${expectedGatewayURI}`);
      console.log(`gatewayURI obtenido: ${newGatewayURI}`);
      console.log(`✅ gatewayURI correcto: ${newGatewayURI === expectedGatewayURI}`);
    }
    
    console.log("");
    console.log("🎉 Actualización completada exitosamente!");
    
  } catch (error) {
    console.error("❌ Error durante la actualización:", error);
    throw error;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
