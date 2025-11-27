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
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin (Base)',
    decimals: 6,
    type: 'erc20',
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    chainId: 8453,
    chainName: 'Base Mainnet',
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
