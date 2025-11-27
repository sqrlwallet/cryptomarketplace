import { useState, useEffect } from 'react';
import { Receipt, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, type Transaction } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading transactions...</div>
      </div>
    );
  }

  if (!profile?.wallet_address) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Wallet Connected</h2>
        <p className="text-gray-600">
          Please connect your wallet and update your profile to view transactions
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">Your purchase and sales history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Purchases</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.purchaseCount}</div>
          <div className="text-sm text-gray-500 mt-1">
            {stats.totalSpent.toFixed(4)} ETH
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Total Sales</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.salesCount}</div>
          <div className="text-sm text-gray-500 mt-1">
            {stats.totalEarned.toFixed(4)} ETH
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Net Activity</span>
            <Receipt className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {transactions.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Total transactions
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Balance</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(stats.totalEarned - stats.totalSpent).toFixed(4)}
          </div>
          <div className="text-sm text-gray-500 mt-1">ETH</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('purchases')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'purchases'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Purchases
          </button>
          <button
            onClick={() => setFilter('sales')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'sales'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sales
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">
            Your {filter === 'all' ? 'transactions' : filter} will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TX Hash
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((tx) => {
                  const type = getTransactionType(tx);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-medium ${
                            type === 'purchase'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
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
                        <div className="text-sm font-medium text-gray-900">
                          {tx.products?.title || 'Unknown Product'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {tx.amount.toFixed(4)} {tx.currency}
                        </div>
                        {type === 'sale' && (
                          <div className="text-xs text-gray-500">
                            You received: {tx.seller_amount.toFixed(4)} {tx.currency}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tx.platform_fee.toFixed(4)} {tx.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                            tx.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.transaction_hash ? (
                          <a
                            href={`https://etherscan.io/tx/${tx.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <span className="font-mono">{formatAddress(tx.transaction_hash)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
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
