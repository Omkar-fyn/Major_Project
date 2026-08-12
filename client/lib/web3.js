import { ethers } from 'ethers';

export const AMM_ADDRESS = process.env.NEXT_PUBLIC_AMM_ADDRESS || "0x6EAaa5074500BFC72D1b488a83eF393f31d3d02B";
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x3c4B0c7E9307629c25D3015EE449Ad656B1A00aa";

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
    
    // Auto-switch to Sepolia Testnet
    const chainId = '0xaa36a7'; // Sepolia chain ID in hex
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
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://rpc.sepolia.org'],
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Sepolia network to MetaMask", addError);
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
