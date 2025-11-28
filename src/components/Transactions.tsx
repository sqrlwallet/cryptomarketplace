import { useState, useEffect } from 'react';
import { Receipt, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, type Transaction } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from './SEO';

type TransactionWithProduct = Transaction & {
  products?: {
    title: string;
  };
};

export default function Transactions() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchases' | 'sales'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [profile]);

  const fetchTransactions = async () => {
    if (!profile?.wallet_address) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        products (
          title
        )
      `)
      .or(`buyer_wallet.eq.${profile.wallet_address},seller_wallet.eq.${profile.wallet_address}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'purchases') {
      return tx.buyer_wallet === profile?.wallet_address;
    } else if (filter === 'sales') {
      return tx.seller_wallet === profile?.wallet_address;
    }
    return true;
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionType = (tx: Transaction) => {
    return tx.buyer_wallet === profile?.wallet_address ? 'purchase' : 'sale';
  };

  const getTotalStats = () => {
    const purchases = transactions.filter(tx => tx.buyer_wallet === profile?.wallet_address);
    const sales = transactions.filter(tx => tx.seller_wallet === profile?.wallet_address);

    const totalSpent = purchases.reduce((sum, tx) => sum + tx.amount, 0);
    const totalEarned = sales.reduce((sum, tx) => sum + tx.seller_amount, 0);

    return { totalSpent, totalEarned, purchaseCount: purchases.length, salesCount: sales.length };
  };

  const parseTransactionHash = (hashString: string) => {
    const platformMatch = hashString.match(/Platform:\s*([^\s|]+)/);
    const sellerMatch = hashString.match(/Seller:\s*([^\s|]+)/);
    return {
      platform: platformMatch ? platformMatch[1] : null,
      seller: sellerMatch ? sellerMatch[1] : null,
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center text-primary font-mono animate-pulse">LOADING_TRANSACTION_DATA...</div>
      </div>
    );
  }

  if (!profile?.wallet_address) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4 font-display uppercase">No Wallet Connected</h2>
        <p className="text-gray-400 font-mono">
          Please connect your wallet and update your profile to view transactions
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Transactions"
        description="View your transaction history, purchases, and sales."
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-display uppercase">Transactions</h1>
        <p className="text-gray-400 font-mono uppercase">&gt;&gt; TRANSACTION_HISTORY_LOG</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border-2 border-white p-6 shadow-neo-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-mono uppercase">Total Purchases</span>
            <TrendingDown className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.purchaseCount}</div>
          <div className="text-sm text-gray-500 mt-1 font-mono">
            {stats.totalSpent.toFixed(4)} USDC
          </div>
        </div>

        <div className="bg-surface border-2 border-white p-6 shadow-neo-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-mono uppercase">Total Sales</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.salesCount}</div>
          <div className="text-sm text-gray-500 mt-1 font-mono">
            {stats.totalEarned.toFixed(4)} USDC
          </div>
        </div>

        <div className="bg-surface border-2 border-white p-6 shadow-neo-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-mono uppercase">Net Activity</span>
            <Receipt className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {transactions.length}
          </div>
          <div className="text-sm text-gray-500 mt-1 font-mono uppercase">
            Total transactions
          </div>
        </div>

        <div className="bg-surface border-2 border-white p-6 shadow-neo-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-mono uppercase">Balance</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {(stats.totalEarned - stats.totalSpent).toFixed(4)}
          </div>
          <div className="text-sm text-gray-500 mt-1 font-mono">USDC</div>
        </div>
      </div>

      <div className="bg-surface border-2 border-white p-6 mb-6 shadow-neo-white">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 border-2 transition-all font-bold uppercase font-mono ${filter === 'all'
              ? 'bg-primary text-black border-primary shadow-neo'
              : 'bg-black text-white border-white hover:bg-white hover:text-black'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('purchases')}
            className={`px-4 py-2 border-2 transition-all font-bold uppercase font-mono ${filter === 'purchases'
              ? 'bg-secondary text-white border-secondary shadow-neo-pink'
              : 'bg-black text-white border-white hover:bg-white hover:text-black'
              }`}
          >
            Purchases
          </button>
          <button
            onClick={() => setFilter('sales')}
            className={`px-4 py-2 border-2 transition-all font-bold uppercase font-mono ${filter === 'sales'
              ? 'bg-primary text-black border-primary shadow-neo'
              : 'bg-black text-white border-white hover:bg-white hover:text-black'
              }`}
          >
            Sales
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="bg-surface border-2 border-white p-12 text-center shadow-neo-white">
          <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-display uppercase">No transactions yet</h3>
          <p className="text-gray-400 font-mono uppercase">
            Your {filter === 'all' ? 'transactions' : filter} will appear here
          </p>
        </div>
      ) : (
        <div className="bg-black border-2 border-white overflow-hidden shadow-neo-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface border-b-2 border-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider font-mono">
                    TX Hash
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTransactions.map((tx) => {
                  const type = getTransactionType(tx);
                  return (
                    <tr key={tx.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 border-2 text-xs font-bold uppercase font-mono ${type === 'purchase'
                            ? 'bg-secondary/10 border-secondary text-secondary'
                            : 'bg-primary/10 border-primary text-primary'
                            }`}
                        >
                          {type === 'purchase' ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          <span>{type === 'purchase' ? 'Purchase' : 'Sale'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-white font-display uppercase">
                          {tx.products?.title || 'Unknown Product'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white font-mono">
                          {tx.amount.toFixed(4)} {tx.currency}
                        </div>
                        {type === 'sale' && (
                          <div className="text-xs text-primary font-mono">
                            You received: {tx.seller_amount.toFixed(4)} {tx.currency}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {tx.platform_fee.toFixed(4)} {tx.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 border-2 text-xs font-bold uppercase font-mono ${tx.status === 'completed'
                            ? 'bg-green-900/20 border-green-500 text-green-500'
                            : tx.status === 'pending'
                              ? 'bg-yellow-900/20 border-yellow-500 text-yellow-500'
                              : 'bg-red-900/20 border-red-500 text-red-500'
                            }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {tx.transaction_hash ? (
                          <div className="flex flex-col space-y-1">
                            {(() => {
                              const hashes = parseTransactionHash(tx.transaction_hash);
                              return (
                                <>
                                  {hashes.platform && (
                                    <a
                                      href={`https://basescan.org/tx/${hashes.platform}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 text-primary hover:text-white text-xs transition-colors"
                                    >
                                      <span className="text-gray-500 font-mono uppercase">Platform:</span>
                                      <span className="font-mono">{formatAddress(hashes.platform)}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                  {hashes.seller && (
                                    <a
                                      href={`https://basescan.org/tx/${hashes.seller}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 text-secondary hover:text-white text-xs transition-colors"
                                    >
                                      <span className="text-gray-500 font-mono uppercase">Seller:</span>
                                      <span className="font-mono">{formatAddress(hashes.seller)}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-sm font-mono">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
