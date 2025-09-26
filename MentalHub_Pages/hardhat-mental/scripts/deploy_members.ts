import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL, GATEWAY_URI } = await import("../constants/cNFTCol");

  const MembersAirdrop = await ethers.getContractFactory("MembersAirdrop");

  // Estimar gas del deploy para evitar over-provisioning
  const deployTx = MembersAirdrop.getDeployTransaction(METADATA_URL, GATEWAY_URI, WHITELIST_CONTRACT_ADDRESS);
  const estimated = await ethers.provider.estimateGas(deployTx);
  const margin = estimated.mul(12).div(10); // +20%

  const fee = await ethers.provider.getFeeData();
  let overrides: any = { gasLimit: margin };
  if (fee.maxFeePerGas && fee.maxPriorityFeePerGas) {
    overrides = { ...overrides, maxFeePerGas: fee.maxFeePerGas, maxPriorityFeePerGas: fee.maxPriorityFeePerGas };
  } else {
    overrides = { ...overrides, gasPrice: await ethers.provider.getGasPrice() };
  }

  const members = await MembersAirdrop.deploy(METADATA_URL, GATEWAY_URI, WHITELIST_CONTRACT_ADDRESS, overrides);
  await members.deployed();
  console.log(`Members=${members.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


