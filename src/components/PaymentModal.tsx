import { useState } from 'react';
import { X, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useWallet } from '../contexts/WalletContext';
import { PLATFORM_FEE_WALLET, getCurrencyConfig, formatCurrencyAmount, ERC20_ABI } from '../lib/currencies';

interface PaymentModalProps {
  product: Product;
  onClose: () => void;
}

export default function PaymentModal({ product, onClose }: PaymentModalProps) {
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'confirming' | 'platform-fee' | 'seller-payment' | 'complete'>('confirming');

  const platformFee = product.price * 0.1;
  const sellerAmount = product.price * 0.9;
  const totalAmount = product.price;

  const currencyConfig = getCurrencyConfig(product.currency);

  const sendNativeTransaction = async (to: string, amount: number) => {
    const amountInWei = formatCurrencyAmount(amount, currencyConfig?.decimals || 18);
    const amountHex = '0x' + BigInt(amountInWei).toString(16);

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: walletAddress,
          to: to,
          value: amountHex,
        },
      ],
    });

    return txHash;
  };

  const sendERC20Transaction = async (to: string, amount: number) => {
    if (!currencyConfig?.contractAddress) {
      throw new Error('Token contract address not found');
    }

    const amountInTokenUnits = formatCurrencyAmount(amount, currencyConfig.decimals);

    const web3 = (window as any).ethereum;
    const tokenContract = currencyConfig.contractAddress;

    const data = web3.utils?.encodeFunctionCall?.(
      {
        name: 'transfer',
        type: 'function',
        inputs: [
          { type: 'address', name: '_to' },
          { type: 'uint256', name: '_value' },
        ],
      },
      [to, amountInTokenUnits]
    );

    const dataHex = data || (
      '0xa9059cbb' +
      to.slice(2).padStart(64, '0') +
      BigInt(amountInTokenUnits).toString(16).padStart(64, '0')
    );

    const txHash = await web3.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: walletAddress,
          to: tokenContract,
          data: dataHex,
        },
      ],
    });

    return txHash;
  };

  const handlePayment = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!window.ethereum) {
      setError('Web3 wallet not detected');
      return;
    }

    if (!currencyConfig) {
      setError('Unsupported currency');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let platformTxHash = '';
      let sellerTxHash = '';

      setStep('platform-fee');
      if (currencyConfig.type === 'native') {
        platformTxHash = await sendNativeTransaction(PLATFORM_FEE_WALLET, platformFee);
      } else {
        platformTxHash = await sendERC20Transaction(PLATFORM_FEE_WALLET, platformFee);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep('seller-payment');
      if (currencyConfig.type === 'native') {
        sellerTxHash = await sendNativeTransaction(product.seller_wallet, sellerAmount);
      } else {
        sellerTxHash = await sendERC20Transaction(product.seller_wallet, sellerAmount);
      }

      setStep('complete');

      const { data: transactionData, error: dbError } = await supabase
        .from('transactions')
        .insert({
          product_id: product.id,
          buyer_wallet: walletAddress,
          seller_wallet: product.seller_wallet,
          amount: totalAmount,
          platform_fee: platformFee,
          seller_amount: sellerAmount,
          currency: product.currency,
          transaction_hash: `Platform: ${platformTxHash} | Seller: ${sellerTxHash}`,
          status: 'completed',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const { error: accessError } = await supabase
        .from('purchase_access')
        .insert({
          transaction_id: transactionData.id,
          product_id: product.id,
          buyer_wallet: walletAddress,
        });

      if (accessError) throw accessError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Transaction rejected by user');
      } else {
        setError(err.message || 'Payment failed. Please try again.');
      }
      setStep('confirming');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Complete Purchase</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-32 object-cover rounded-lg"
            />
          )}

          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.title}</h3>
            <p className="text-gray-600 text-sm">{product.description}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Product Price</span>
              <span className="font-medium text-gray-900">
                {product.price} {product.currency}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Platform Fee (10%)</span>
                <span className="font-medium text-blue-600">
                  {platformFee.toFixed(6)} {product.currency}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-1">To: {PLATFORM_FEE_WALLET.slice(0, 10)}...{PLATFORM_FEE_WALLET.slice(-8)}</div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">To Seller (90%)</span>
                <span className="font-medium text-green-600">
                  {sellerAmount.toFixed(6)} {product.currency}
                </span>
              </div>
              <div className="text-xs text-gray-500">To: {product.seller_wallet.slice(0, 10)}...{product.seller_wallet.slice(-8)}</div>
            </div>
            <div className="pt-3 border-t-2 border-gray-300 flex justify-between">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="font-bold text-gray-900 text-lg">
                {totalAmount.toFixed(6)} {product.currency}
              </span>
            </div>
          </div>

          {loading && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-blue-900">Processing Payment...</span>
              </div>
              <div className="space-y-2">
                <div className={`flex items-center space-x-2 text-sm ${step === 'platform-fee' || step === 'seller-payment' || step === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                  {step === 'platform-fee' || step === 'seller-payment' || step === 'complete' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span>Platform fee payment</span>
                </div>
                <div className={`flex items-center space-x-2 text-sm ${step === 'seller-payment' || step === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                  {step === 'seller-payment' || step === 'complete' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span>Seller payment</span>
                </div>
                <div className={`flex items-center space-x-2 text-sm ${step === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                  {step === 'complete' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <span>Recording transaction</span>
                </div>
              </div>
            </div>
          )}

          {!loading && walletAddress && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-start space-x-2">
              <Wallet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-800 font-medium mb-1">Connected Wallet</p>
                <p className="text-xs text-blue-600 font-mono break-all">{walletAddress}</p>
              </div>
            </div>
          )}

          {!walletAddress && (
            <div className="bg-yellow-50 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Please connect your wallet to complete the purchase
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              Payment successful! Both transactions completed and recorded.
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || !walletAddress || success}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : success ? 'Completed' : 'Pay Now'}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-2 font-medium">Payment Process:</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>10% platform fee sent to platform wallet</li>
              <li>90% payment sent directly to seller</li>
              <li>Both transactions recorded on blockchain</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
