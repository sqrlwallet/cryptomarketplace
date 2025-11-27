import { useState, useEffect } from 'react';
import { ShoppingBag, Download, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PurchasedFiles from './PurchasedFiles';

interface Purchase {
  id: string;
  product_id: string;
  access_granted_at: string;
  download_count: number;
  products: {
    title: string;
    description: string;
    image_url: string | null;
    has_files: boolean;
    file_count: number;
  };
}

import SEO from './SEO';

export default function MyPurchases() {
  const { profile } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, [profile]);

  const fetchPurchases = async () => {
    if (!profile?.wallet_address) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('purchase_access')
      .select(`
        *,
        products (
          title,
          description,
          image_url,
          has_files,
          file_count
        )
      `)
      .eq('buyer_wallet', profile.wallet_address)
      .order('access_granted_at', { ascending: false });

    if (!error && data) {
      setPurchases(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading your purchases...</div>
      </div>
    );
  }

  if (!profile?.wallet_address) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Wallet Connected</h2>
        <p className="text-gray-600">
          Please connect your wallet and update your profile to view purchases
        </p>
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedProduct(null)}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
        >
          <span>← Back to Purchases</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Download Files</h1>
        <PurchasedFiles productId={selectedProduct.id} productTitle={selectedProduct.title} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="My Purchases"
        description="Access and download your purchased digital assets."
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-display uppercase">My Purchases</h1>
        <p className="text-gray-400 font-mono uppercase">&gt;&gt; ACCESS_ACQUIRED_ASSETS</p>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-surface border-2 border-white p-12 text-center shadow-neo-white">
          <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">No purchases yet</h3>
          <p className="text-gray-400 font-mono uppercase">&gt;&gt; INITIATE_TRANSACTION_PROTOCOL</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-black border-2 border-white overflow-hidden shadow-neo hover:shadow-neo-white transition-all"
            >
              {purchase.products.image_url ? (
                <img
                  src={purchase.products.image_url}
                  alt={purchase.products.title}
                  className="w-full h-48 object-cover border-b-2 border-white filter grayscale hover:grayscale-0 transition-all"
                />
              ) : (
                <div className="w-full h-48 bg-surface flex items-center justify-center border-b-2 border-white">
                  <ShoppingBag className="w-12 h-12 text-gray-600" />
                </div>
              )}

              <div className="p-5">
                <h3 className="font-bold text-white text-lg mb-2 font-display uppercase tracking-wide">
                  {purchase.products.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-mono">
                  {purchase.products.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 font-mono uppercase">
                  <span>
                    ACQUIRED: {new Date(purchase.access_granted_at).toLocaleDateString()}
                  </span>
                  {purchase.products.has_files && (
                    <span className="flex items-center space-x-1 text-primary">
                      <FileText className="w-3 h-3" />
                      <span>{purchase.products.file_count} FILES</span>
                    </span>
                  )}
                </div>

                {purchase.products.has_files ? (
                  <button
                    onClick={() =>
                      setSelectedProduct({
                        id: purchase.product_id,
                        title: purchase.products.title,
                      })
                    }
                    className="w-full flex items-center justify-center space-x-2 bg-primary text-black border-2 border-primary px-4 py-2.5 hover:bg-white hover:border-white hover:text-black transition-all font-bold uppercase font-mono shadow-neo"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD_FILES</span>
                  </button>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-2 font-mono uppercase border-2 border-gray-800">
                    NO_DOWNLOADABLE_FILES
                  </div>
                )}

                {purchase.download_count > 0 && (
                  <div className="mt-3 text-xs text-gray-500 text-center font-mono uppercase">
                    DOWNLOADED {purchase.download_count} TIME{purchase.download_count !== 1 ? 'S' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
