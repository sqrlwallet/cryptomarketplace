export const PLATFORM_FEE_WALLET = '0x8D9CA82052e90eEd4eC2D8a8f5d489A518a8F9e4';

export interface Currency {
  symbol: string;
  name: string;
  decimals: number;
  type: 'native' | 'erc20';
  contractAddress?: string;
  chainId: number;
  chainName: string;
}

export const SUPPORTED_CURRENCIES: Record<string, Currency> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    type: 'native',
    chainId: 1,
    chainName: 'Ethereum Mainnet',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    type: 'erc20',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chainId: 1,
    chainName: 'Ethereum Mainnet',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    type: 'erc20',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId: 1,
    chainName: 'Ethereum Mainnet',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    type: 'erc20',
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chainId: 1,
    chainName: 'Ethereum Mainnet',
  },
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    type: 'native',
    chainId: 137,
    chainName: 'Polygon Mainnet',
  },
  'USDT-POLYGON': {
    symbol: 'USDT',
    name: 'Tether USD (Polygon)',
    decimals: 6,
    type: 'erc20',
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    chainId: 137,
    chainName: 'Polygon Mainnet',
  },
  'USDC-POLYGON': {
    symbol: 'USDC',
    name: 'USD Coin (Polygon)',
    decimals: 6,
    type: 'erc20',
    contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    chainId: 137,
    chainName: 'Polygon Mainnet',
  },
};

export const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

export function getCurrencyConfig(symbol: string): Currency | undefined {
  return SUPPORTED_CURRENCIES[symbol];
}

export function formatCurrencyAmount(amount: number, decimals: number): string {
  return (amount * Math.pow(10, decimals)).toString();
}

export function parseCurrencyAmount(amount: string, decimals: number): number {
  return parseFloat(amount) / Math.pow(10, decimals);
}
