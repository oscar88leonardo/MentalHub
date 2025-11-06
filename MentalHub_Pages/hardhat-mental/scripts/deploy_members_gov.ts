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
  const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL, GATEWAY_URI } = await import("../constants/cNFTCol");

  // 1) Deploy MembersAirdrop with DAO functionality
  const MembersAirdrop = await ethers.getContractFactory("MembersAirdrop");
  const [deployer] = await ethers.getSigners();
  const deployTxReq = MembersAirdrop.getDeployTransaction(METADATA_URL, GATEWAY_URI, WHITELIST_CONTRACT_ADDRESS);
  let gasLimitAirdrop;
  try {
    const est = await ethers.provider.estimateGas({ ...deployTxReq, from: deployer.address });
    gasLimitAirdrop = est.mul(12).div(10);
  } catch {
    gasLimitAirdrop = ethers.BigNumber.from(8000000);
  }
  let overrides: any = await withFees({ gasLimit: gasLimitAirdrop });

  const members = await MembersAirdrop.deploy(METADATA_URL, GATEWAY_URI, WHITELIST_CONTRACT_ADDRESS, overrides);
  await members.deployed();
  console.log(`MembersAirdrop=${members.address}`);

  // 2) Mint 1 NFT & autodelegate (ERC721Votes)
  overrides = await withFees();
  const txMint = await members.ownerMint(deployer.address, 1, overrides);
  await txMint.wait();

  const txDel = await (members as any).delegate(deployer.address, overrides);
  await txDel.wait();

  // 3) Deploy MembersGovernor apuntando al IVotes del NFT
  const MembersGovernor = await ethers.getContractFactory("MembersGovernor");
  const govTxReq = MembersGovernor.getDeployTransaction(members.address);
  let gasLimitGov;
  try {
    const estGov = await ethers.provider.estimateGas({ ...govTxReq, from: deployer.address });
    gasLimitGov = estGov.mul(12).div(10);
  } catch {
    gasLimitGov = ethers.BigNumber.from(8000000);
  }
  overrides = await withFees({ gasLimit: gasLimitGov });

  const governor = await MembersGovernor.deploy(members.address, overrides);
  await governor.deployed();
  console.log(`MembersGovernor=${governor.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


