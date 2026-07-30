/**
 * On-chain anchoring via GreenAgentLedger.
 *
 * Prefers Base mainnet if BASE_CONTRACT_ADDRESS + BASE_RPC_URL are set.
 * Falls back to Sepolia for local dev / pre-migration.
 *
 * Deploy to Base: npx tsx scripts/deploy-contract.ts
 */

import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import solc from "solc";

const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedAbi: any[] | null = null;

function getAbi(): any[] {
  if (cachedAbi) return cachedAbi;
  const source = readFileSync(join(__dirname, "../contracts/GreenAgentLedger.sol"), "utf8");
  const input = {
    language: "Solidity",
    sources: { "GreenAgentLedger.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi"] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  cachedAbi = output.contracts["GreenAgentLedger.sol"]["GreenAgentLedger"].abi;
  return cachedAbi!;
}

export interface AnchorResult {
  txHash: string;
  chainId: number;
  chainName: string;
  explorerUrl: string;
  dataHash: string;
}

function chainConfig(): { contractAddress: string; rpcUrl: string; chainId: number; chainName: string; explorerBase: string } | null {
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
  if (!privateKey) return null;

  // Base mainnet — preferred for production
  if (process.env.BASE_CONTRACT_ADDRESS && process.env.BASE_RPC_URL) {
    return {
      contractAddress: process.env.BASE_CONTRACT_ADDRESS,
      rpcUrl: process.env.BASE_RPC_URL,
      chainId: 8453,
      chainName: "Base",
      explorerBase: "https://basescan.org",
    };
  }

  // Sepolia — fallback / dev
  if (process.env.GREENAGENT_CONTRACT_ADDRESS) {
    return {
      contractAddress: process.env.GREENAGENT_CONTRACT_ADDRESS,
      rpcUrl: process.env.SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org",
      chainId: 11155111,
      chainName: "Sepolia (testnet)",
      explorerBase: "https://sepolia.etherscan.io",
    };
  }

  return null;
}

export async function anchorBatch(
  batchCode: string,
  skin: string,
  verificationDetails: object,
): Promise<AnchorResult | null> {
  const chain = chainConfig();
  if (!chain) {
    console.warn("[anchor] Skipped — no chain config. Set BASE_CONTRACT_ADDRESS + BASE_RPC_URL in .env");
    return null;
  }

  const privateKey = process.env.SEPOLIA_PRIVATE_KEY!;
  console.log(`[anchor] Using ${chain.chainName} (${chain.chainId})`);

  const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const abi = getAbi();
  const contract = new ethers.Contract(chain.contractAddress, abi, wallet);

  const payload = JSON.stringify({ batchCode, skin, ...verificationDetails });
  const dataHash = ethers.keccak256(ethers.toUtf8Bytes(payload));

  console.log(`[anchor] Anchoring ${batchCode} → ${dataHash}`);
  const tx = await contract.anchor(batchCode, dataHash, skin);
  await tx.wait(1);

  return {
    txHash: tx.hash,
    chainId: chain.chainId,
    chainName: chain.chainName,
    explorerUrl: `${chain.explorerBase}/tx/${tx.hash}`,
    dataHash,
  };
}
