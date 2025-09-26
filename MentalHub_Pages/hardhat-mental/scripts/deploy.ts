import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  // Parámetros fijos existentes para MembersAirdrop
  const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL, GATEWAY_URI } = await import("../constants/cNFTCol");

  // Preparar overrides EIP-1559 para evitar mempool "already known" y reemplazos
  const fee = await ethers.provider.getFeeData();
  const bump = ethers.utils.parseUnits('10', 'gwei');
  const gasLimit = ethers.BigNumber.from(8000000);
  let overrides: any = { gasLimit };
  if (fee.maxFeePerGas && fee.maxPriorityFeePerGas) {
    const maxPriorityFeePerGas = fee.maxPriorityFeePerGas.add(bump);
    const maxFeePerGas = fee.maxFeePerGas.add(bump.mul(2));
    overrides = { ...overrides, maxPriorityFeePerGas, maxFeePerGas };
  } else {
    const gasPrice = (await ethers.provider.getGasPrice()).add(bump);
    overrides = { ...overrides, gasPrice };
  }

  // Desplegar MembersAirdrop si es necesario
  const MembersAirdrop = await ethers.getContractFactory("MembersAirdrop");

  // En MVP, siempre desplegamos una nueva instancia en Shibuya
  const members = await MembersAirdrop.deploy(METADATA_URL, GATEWAY_URI, WHITELIST_CONTRACT_ADDRESS, overrides);
  await members.deployed();
  console.log(`Members=${members.address}`);

  // Mint 1 NFT al deployer y autodelegatear para tener poder de voto
  const [deployer] = await ethers.getSigners();
  const txMint = await members.ownerMint(deployer.address, 1, overrides);
  await txMint.wait();

  // Delegación de votos (ERC721Votes): imprescindible
  const delegateTx = await (members as any).delegate(deployer.address, overrides);
  await delegateTx.wait();

  // Desplegar Governor apuntando al NFT como IVotes
  const MembersGovernor = await ethers.getContractFactory("MembersGovernor");
  const governor = await MembersGovernor.deploy(members.address, overrides);
  await governor.deployed();
  console.log(`Governor=${governor.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


