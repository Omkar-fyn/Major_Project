import { ethers } from 'ethers';

export const AMM_ADDRESS = process.env.NEXT_PUBLIC_AMM_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Default hardhat address
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const AMM_ABI = [
  "function buyTokens() external payable",
  "function sellTokens(uint256 tokenAmount) external"
];

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export async function getWeb3Provider() {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  }
  throw new Error("MetaMask is not installed");
}

export async function getSigner() {
  const provider = await getWeb3Provider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

export function getContracts(signerOrProvider) {
  const ammContract = new ethers.Contract(AMM_ADDRESS, AMM_ABI, signerOrProvider);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signerOrProvider);
  return { ammContract, tokenContract };
}
