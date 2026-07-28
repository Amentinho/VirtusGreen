/**
 * On-chain anchoring via GreenAgentLedger (Sepolia).
 *
 * Hashes batch verification data and calls anchor() on the contract.
 * Returns the transaction hash + block explorer URL.
 *
 * If GREENAGENT_CONTRACT_ADDRESS or SEPOLIA_PRIVATE_KEY are absent,
 * returns null gracefully so the rest of the verification flow still works.
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
  explorerUrl: string;
  dataHash: string;
}

export async function anchorBatch(
  batchCode: string,
  skin: string,
  verificationDetails: object,
): Promise<AnchorResult | null> {
  const contractAddress = process.env.GREENAGENT_CONTRACT_ADDRESS;
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

  if (!contractAddress || !privateKey) {
    console.warn("[anchor] Skipped — GREENAGENT_CONTRACT_ADDRESS or SEPOLIA_PRIVATE_KEY not set");
    return null;
  }

  const rpcUrl = process.env.SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const abi = getAbi();
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  // Deterministic hash: keccak256 of canonical JSON
  const payload = JSON.stringify({ batchCode, skin, ...verificationDetails });
  const dataHash = ethers.keccak256(ethers.toUtf8Bytes(payload));

  console.log(`[anchor] Anchoring ${batchCode} → ${dataHash}`);

  const tx = await contract.anchor(batchCode, dataHash, skin);
  await tx.wait(1);

  const chainId = 11155111; // Sepolia
  return {
    txHash: tx.hash,
    chainId,
    explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
    dataHash,
  };
}
