import { ethers } from "hardhat";

// Votar "For" sobre un proposalId
async function main() {
  const governorAddress = process.env.GOVERNOR_ADDRESS as string;
  const proposalId = process.env.PROPOSAL_ID as string;
  if (!governorAddress || !proposalId) {
    throw new Error("Falta GOVERNOR_ADDRESS o PROPOSAL_ID en .env");
  }

  const governor = await ethers.getContractAt("MembersGovernor", governorAddress);

  const tx = await (governor as any).castVote(proposalId, 1); // 1 = For
  const receipt = await tx.wait();
  console.log(`Voto emitido. TxHash=${receipt.transactionHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});





