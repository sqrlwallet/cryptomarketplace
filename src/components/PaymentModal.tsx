import { useState } from 'react';
import { X, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { PLATFORM_FEE_WALLET, getCurrencyConfig, formatCurrencyAmount } from '../lib/currencies';

interface PaymentModalProps {
  product: Product;
  onClose: () => void;
}

export default function PaymentModal({ product, onClose }: PaymentModalProps) {
  const { walletAddress } = useWallet();
  const { user, refreshProfile } = useAuth();
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

    // Check if connected to Avalanche C-Chain
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0xa86a') { // 43114 in hex
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa86a' }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xa86a',
                  chainName: 'Avalanche C-Chain',
                  nativeCurrency: {
                    name: 'AVAX',
                    symbol: 'AVAX',
                    decimals: 18,
                  },
                  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                  blockExplorerUrls: ['https://snowtrace.io/'],
                },
              ],
            });
          } catch (addError) {
            setError('Please switch to Avalanche C-Chain to continue');
            return;
          }
        } else {
          setError('Please switch to Avalanche C-Chain to continue');
          return;
        }
      }
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

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ wallet_address: walletAddress })
          .eq('id', user.id);

        if (profileError) {
          console.error('Failed to update wallet address:', profileError);
        }
      }

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

      await refreshProfile();

      // Send email notifications
      const { data: { user: authUser } } = await supabase.auth.getUser();

      let buyerProfile = null;
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();
        buyerProfile = data;
      }

      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('username, id')
        .eq('id', product.seller_id)
        .maybeSingle();

      // Get seller email via edge function
      const sellerEmailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: product.seller_id }),
      });
      const { email: sellerEmail } = await sellerEmailResponse.json();

      // Send buyer email
      if (authUser?.email) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-transaction-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'buyer',
              recipientEmail: authUser.email,
              recipientName: buyerProfile?.username || 'Buyer',
              productTitle: product.title,
              productPrice: totalAmount,
              currency: product.currency,
              transactionId: transactionData.id,
              sellerName: sellerProfile?.username || 'Seller',
            }),
          });
        } catch (emailError) {
          console.error('Failed to send buyer email:', emailError);
        }
      }

      // Send seller email
      if (sellerEmail) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-transaction-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'seller',
              recipientEmail: sellerEmail,
              recipientName: sellerProfile?.username || 'Seller',
              productTitle: product.title,
              productPrice: totalAmount,
              currency: product.currency,
              transactionId: transactionData.id,
              buyerName: buyerProfile?.username || 'Anonymous',
            }),
          });
        } catch (emailError) {
          console.error('Failed to send seller email:', emailError);
        }
      }

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border-2 border-white shadow-neo-white max-w-md w-full">
        <div className="border-b-2 border-white px-6 py-4 flex items-center justify-between bg-black">
          <h2 className="text-xl font-bold text-white font-display uppercase">Complete Purchase</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white hover:text-black text-white transition-colors disabled:opacity-50 border-2 border-transparent hover:border-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-32 object-cover border-2 border-white filter grayscale"
            />
          )}

          <div>
            <h3 className="font-bold text-white text-lg mb-1 font-display uppercase">{product.title}</h3>
            <p className="text-gray-400 text-sm font-mono">{product.description}</p>
          </div>

          <div className="bg-black border-2 border-white p-4 space-y-2">
            <div className="flex justify-between text-sm font-mono">
              <span className="text-gray-400 uppercase">Product Price</span>
              <span className="font-bold text-white">
                {product.price} {product.currency}
              </span>
            </div>
            <div className="pt-2 border-t border-white/20">
              <div className="flex justify-between text-sm mb-2 font-mono">
                <span className="text-gray-400 uppercase">Platform Fee (10%)</span>
                <span className="font-bold text-primary">
                  {platformFee.toFixed(6)} {product.currency}
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-1 font-mono">To: {PLATFORM_FEE_WALLET.slice(0, 10)}...{PLATFORM_FEE_WALLET.slice(-8)}</div>
            </div>
            <div className="pt-2 border-t border-white/20">
              <div className="flex justify-between text-sm mb-2 font-mono">
                <span className="text-gray-400 uppercase">To Seller (90%)</span>
                <span className="font-bold text-secondary">
                  {sellerAmount.toFixed(6)} {product.currency}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono">To: {product.seller_wallet.slice(0, 10)}...{product.seller_wallet.slice(-8)}</div>
            </div>
            <div className="pt-3 border-t-2 border-white flex justify-between">
              <span className="font-bold text-white uppercase font-mono">Total Amount</span>
              <span className="font-bold text-primary text-lg font-mono">
                {totalAmount.toFixed(6)} {product.currency}
              </span>
            </div>
          </div>

          {loading && (
            <div className="bg-black border-2 border-primary p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-primary uppercase font-mono">Processing Payment...</span>
              </div>
              <div className="space-y-2 font-mono uppercase">
                <div className={`flex items-center space-x-2 text-sm ${step === 'platform-fee' || step === 'seller-payment' || step === 'complete' ? 'text-primary' : 'text-gray-600'}`}>
                  {step === 'platform-fee' || step === 'seller-payment' || step === 'complete' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-600"></div>
                  )}
                  <span>Platform fee payment</span>
                </div>
                <div className={`flex items-center space-x-2 text-sm ${step === 'seller-payment' || step === 'complete' ? 'text-primary' : 'text-gray-600'}`}>
                  {step === 'seller-payment' || step === 'complete' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-600"></div>
                  )}
                  <span>Seller payment</span>
                </div>
                <div className={`flex items-center space-x-2 text-sm ${step === 'complete' ? 'text-primary' : 'text-gray-600'}`}>
                  {step === 'complete' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-600"></div>
                  )}
                  <span>Recording transaction</span>
                </div>
              </div>
            </div>
          )}

          {!loading && walletAddress && (
            <div className="bg-black border border-white/20 p-3 flex items-start space-x-2">
              <Wallet className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1 font-mono">Connected Wallet</p>
                <p className="text-xs text-white font-mono break-all">{walletAddress}</p>
              </div>
            </div>
          )}

          {!walletAddress && (
            <div className="bg-secondary/10 border-2 border-secondary p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-secondary mt-0.5" />
              <p className="text-sm text-secondary font-bold font-mono uppercase">
                Please connect your wallet to complete the purchase
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border-2 border-red-500 text-red-500 px-4 py-3 text-sm font-mono font-bold uppercase">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-primary/10 border-2 border-primary text-primary px-4 py-3 text-sm font-mono font-bold uppercase">
              Payment successful! Both transactions completed and recorded.
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 font-bold uppercase font-mono"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading || !walletAddress || success}
              className="flex-1 px-6 py-3 bg-primary text-black border-2 border-primary hover:bg-white hover:border-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase font-mono shadow-neo hover:shadow-neo-white"
            >
              {loading ? 'Processing...' : success ? 'Completed' : 'Pay Now'}
            </button>
          </div>

          <div className="bg-black border border-white/20 p-3">
            <p className="text-xs text-gray-400 mb-2 font-bold uppercase font-mono">Payment Process:</p>
            <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside font-mono">
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
