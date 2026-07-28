/**
 * Deploy GreenAgentLedger.sol to Sepolia.
 *
 * Usage:
 *   npx tsx scripts/deploy.ts
 *
 * Required in .env:
 *   SEPOLIA_PRIVATE_KEY=0x...
 *   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<key>   (optional — defaults to public RPC)
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { ethers } from "ethers";
import solc from "solc";

const SOURCE = readFileSync(new URL("../contracts/GreenAgentLedger.sol", import.meta.url), "utf8");

function compile() {
  const input = {
    language: "Solidity",
    sources: { "GreenAgentLedger.sol": { content: SOURCE } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter((e: any) => e.severity === "error");
    if (errors.length) {
      console.error("Compilation errors:", errors.map((e: any) => e.formattedMessage).join("\n"));
      process.exit(1);
    }
  }

  const contract = output.contracts["GreenAgentLedger.sol"]["GreenAgentLedger"];
  return {
    abi: contract.abi,
    bytecode: "0x" + contract.evm.bytecode.object,
  };
}

async function main() {
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
  if (!privateKey) {
    console.error("SEPOLIA_PRIVATE_KEY not set in .env");
    process.exit(1);
  }

  const rpcUrl = process.env.SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying from:", wallet.address);

  const { abi, bytecode } = compile();
  console.log("Contract compiled OK");

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nGreenAgentLedger deployed at:", address);
  console.log("Add this to your .env:");
  console.log(`GREENAGENT_CONTRACT_ADDRESS=${address}`);
  console.log(`GREENAGENT_CHAIN_ID=11155111`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
