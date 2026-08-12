import { ethers } from 'ethers';

export const AMM_ADDRESS = process.env.NEXT_PUBLIC_AMM_ADDRESS || "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa"; // Default hardhat address
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xD1fD5571D7358c7e7b70df11BF6e8ef02CB463F0";

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
    
    // Auto-switch to Localhost 8545
    const chainId = '0x7a69'; // 31337 in hex
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainId,
                chainName: 'Hardhat Localhost',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Hardhat network to MetaMask", addError);
        }
      }
    }

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
