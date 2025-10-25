import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function withFees(overrides: any = {}) {
  const fee = await ethers.provider.getFeeData();
  if (fee.maxFeePerGas && fee.maxPriorityFeePerGas) {
    return { ...overrides, maxFeePerGas: fee.maxFeePerGas, maxPriorityFeePerGas: fee.maxPriorityFeePerGas };
  }
  const gasPrice = await ethers.provider.getGasPrice();
  return { ...overrides, gasPrice };
}

async function main() {
  console.log("🚀 Desplegando SOLO MembersGovernorTimeBased (sin NFT)...");
  console.log("📋 Configuración:");
  console.log("   - Voting Delay: 0 segundos");
  console.log("   - Voting Period: 7 días (cambiable a 3 minutos)");
  console.log("   - Proposal Threshold: 1 voto");
  console.log("   - Quorum: 5%");

  // Usar la dirección del NFT ya desplegado
  const EXISTING_NFT_ADDRESS = "0x0868c53AcD1D4713AbA14F0199C8006e039635D5";
  
  console.log(`\n1️⃣ Usando NFT existente: ${EXISTING_NFT_ADDRESS}`);

  // Solo desplegar MembersGovernorTimeBased
  console.log("\n2️⃣ Desplegando MembersGovernorTimeBased...");
  const MembersGovernorTimeBased = await ethers.getContractFactory("MembersGovernorTimeBased");
  const [deployer] = await ethers.getSigners();
  
  const govTxReq = MembersGovernorTimeBased.getDeployTransaction(EXISTING_NFT_ADDRESS);
  let gasLimitGov;
  try {
    const estGov = await ethers.provider.estimateGas({ ...govTxReq, from: deployer.address });
    gasLimitGov = estGov.mul(12).div(10);
  } catch {
    gasLimitGov = ethers.BigNumber.from(8000000);
  }
  
  const overrides = await withFees({ gasLimit: gasLimitGov });

  const governor = await MembersGovernorTimeBased.deploy(EXISTING_NFT_ADDRESS, overrides);
  await governor.deployed();
  console.log(`✅ MembersGovernorTimeBased desplegado: ${governor.address}`);

  console.log("\n🎉 ¡Despliegue completado exitosamente!");

  console.log("\n📊 Resumen del despliegue:");
  console.log(`   - MembersGovernorTimeBased: ${governor.address}`);
  console.log(`   - NFT usado: ${EXISTING_NFT_ADDRESS}`);
  console.log(`   - Owner: ${deployer.address}`);

  console.log("\n⚙️ Configuración actual:");
  const votingDelay = await governor.votingDelaySeconds();
  const votingPeriod = await governor.votingPeriodSeconds();
  const proposalThreshold = await governor.proposalThreshold();

  console.log(`   - Voting Delay: ${votingDelay} segundos`);
  console.log(`   - Voting Period: ${votingPeriod / (24 * 60 * 60)} días`);
  console.log(`   - Proposal Threshold: ${proposalThreshold} votos`);
  console.log(`   - Quorum: 5% (configurado en constructor)`);

  console.log("\n🔧 Funciones disponibles para el owner:");
  console.log("   - setVotingDelay(uint256 newDelaySeconds)");
  console.log("   - setVotingPeriod(uint256 newPeriodSeconds) - MÍNIMO: 1 minuto");
  console.log("   - setProposalThreshold(uint256 newThreshold)");

  console.log("\n📝 Para usar en my-dapp, actualiza la dirección del contrato en:");
  console.log("   - src/config/contracts.ts");
  console.log(`   - Nueva dirección: ${governor.address}`);
  
  console.log("\n⏰ Para cambiar a 3 minutos de votación:");
  console.log(`   npx hardhat run scripts/change_voting_period.ts --network arbitrum_sepolia`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
