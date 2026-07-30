/**
 * Deploy GreenAgentLedger.sol to any EVM-compatible chain.
 *
 * Usage:
 *   # Base mainnet (chain 8453) — default
 *   npx tsx scripts/deploy-contract.ts
 *
 *   # Override chain
 *   DEPLOY_RPC_URL=https://sepolia.base.org npx tsx scripts/deploy-contract.ts
 *
 * Required env vars (read from .env):
 *   SEPOLIA_PRIVATE_KEY   — the deployer private key (same key works on Base)
 *
 * Optional env vars:
 *   DEPLOY_RPC_URL        — defaults to https://mainnet.base.org
 *
 * Gas cost on Base mainnet: ~0.0001 ETH (~$0.03 at $3,000/ETH)
 * Bridge ETH to Base: https://bridge.base.org
 *
 * After deploy, set in .env and on Render:
 *   BASE_CONTRACT_ADDRESS=<printed address>
 *   BASE_RPC_URL=https://mainnet.base.org
 */

import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import solc from "solc";

const __dirname = dirname(fileURLToPath(import.meta.url));

function compileContract() {
  const source = readFileSync(join(__dirname, "../contracts/GreenAgentLedger.sol"), "utf8");
  const input = {
    language: "Solidity",
    sources: { "GreenAgentLedger.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors?.some((e: any) => e.severity === "error")) {
    console.error("Solidity compilation errors:");
    output.errors.forEach((e: any) => console.error(e.formattedMessage));
    process.exit(1);
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
    console.error("SEPOLIA_PRIVATE_KEY is required in .env");
    process.exit(1);
  }

  const rpcUrl = process.env.DEPLOY_RPC_URL ?? "https://mainnet.base.org";
  console.log(`\nConnecting to: ${rpcUrl}`);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  console.log(`Chain ID: ${network.chainId} (${network.name})`);

  const wallet = new ethers.Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error("\n❌ No ETH balance on this chain.");
    if (String(network.chainId) === "8453") {
      console.error("Bridge ETH to Base at: https://bridge.base.org");
    }
    process.exit(1);
  }

  console.log("\nCompiling GreenAgentLedger.sol…");
  const { abi, bytecode } = compileContract();
  console.log("✅ Compiled");

  console.log("Deploying…");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const receipt = await provider.getTransactionReceipt(contract.deploymentTransaction()!.hash);
  const chainId = Number(network.chainId);

  const explorerBase = chainId === 8453
    ? "https://basescan.org"
    : chainId === 84532
      ? "https://sepolia.basescan.org"
      : `https://blockscout.com/${chainId}`;

  console.log("\n✅ DEPLOYED");
  console.log("═══════════════════════════════════════════");
  console.log(`Contract address: ${address}`);
  console.log(`Tx hash:          ${receipt?.transactionHash}`);
  console.log(`Gas used:         ${receipt?.gasUsed.toString()}`);
  console.log(`Explorer:         ${explorerBase}/address/${address}`);
  console.log("═══════════════════════════════════════════");
  console.log("\nAdd these to your .env and Render environment variables:");
  console.log(`BASE_CONTRACT_ADDRESS=${address}`);
  console.log(`BASE_RPC_URL=https://mainnet.base.org`);
  console.log(`BASE_CHAIN_ID=8453`);
}

main().catch(e => { console.error(e); process.exit(1); });
