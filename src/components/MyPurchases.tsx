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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchases</h1>
        <p className="text-gray-600">Access your purchased products and downloads</p>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
          <p className="text-gray-600">Start shopping in the marketplace!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {purchase.products.image_url ? (
                <img
                  src={purchase.products.image_url}
                  alt={purchase.products.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-blue-400" />
                </div>
              )}

              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {purchase.products.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {purchase.products.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>
                    Purchased {new Date(purchase.access_granted_at).toLocaleDateString()}
                  </span>
                  {purchase.products.has_files && (
                    <span className="flex items-center space-x-1 text-blue-600">
                      <FileText className="w-3 h-3" />
                      <span>{purchase.products.file_count} files</span>
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
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Files</span>
                  </button>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-2">
                    No downloadable files
                  </div>
                )}

                {purchase.download_count > 0 && (
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Downloaded {purchase.download_count} time{purchase.download_count !== 1 ? 's' : ''}
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
