import { ethers } from "hardhat";

// Propuesta dummy: llamada sin efecto a la propia dirección del governor con calldata vacía
async function main() {
  const governorAddress = process.env.GOVERNOR_ADDRESS as string;
  if (!governorAddress) {
    throw new Error("Falta GOVERNOR_ADDRESS en .env");
  }

  const governor = await ethers.getContractAt("MembersGovernor", governorAddress);

  const targets = [governorAddress];
  const values = [0];
  const calldatas = ["0x"]; // no-op
  const description = "Demo proposal";

  const tx = await (governor as any).propose(targets, values, calldatas, description);
  const receipt = await tx.wait();

  const event = receipt.logs.find((l: any) => l.fragment && l.fragment.name === "ProposalCreated");
  if (event) {
    const proposalId = event.args.proposalId.toString();
    console.log(`proposalId=${proposalId}`);
  } else {
    console.log("Propuesta enviada. Revisar logs/tx en explorer.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});





