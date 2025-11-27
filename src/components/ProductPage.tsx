import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Package, Shield, CheckCircle } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './PaymentModal';

interface ProductPageProps {
  uniqueLink: string;
  onNavigate: (view: string) => void;
}

export default function ProductPage({ uniqueLink, onNavigate }: ProductPageProps) {
  const { user, profile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  useEffect(() => {
    fetchProduct();
  }, [uniqueLink]);

  const fetchProduct = async () => {
    setLoading(true);

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        profiles:seller_id (
          username,
          wallet_address
        )
      `)
      .eq('unique_link', uniqueLink)
      .eq('is_active', true)
      .single();

    if (productError || !productData) {
      setLoading(false);
      return;
    }

    setProduct(productData as any);
    setSellerProfile((productData as any).profiles);

    if (user && profile?.wallet_address) {
      const { data: purchaseData } = await supabase
        .from('purchase_access')
        .select('id')
        .eq('product_id', productData.id)
        .eq('buyer_wallet', profile.wallet_address)
        .maybeSingle();

      setHasPurchased(!!purchaseData);
    }

    setLoading(false);
  };

  const handleBuyClick = () => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate('marketplace')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Marketplace</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-lg flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 text-blue-400" />
              </div>
            )}

            {(product as any).has_files && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Digital Product
                    </h3>
                    <p className="text-sm text-blue-800">
                      Includes {(product as any).file_count} downloadable file{(product as any).file_count !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      Files will be available immediately after purchase
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.type === 'product'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {product.type === 'product' ? 'Product' : 'Service'}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {product.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  {product.price}
                </span>
                <span className="text-2xl text-gray-600">
                  {product.currency}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Includes 10% platform fee
              </p>
            </div>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              {sellerProfile && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Sold by</p>
                  <p className="font-semibold text-gray-900">
                    {sellerProfile.username || 'Anonymous Seller'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {sellerProfile.wallet_address.slice(0, 10)}...{sellerProfile.wallet_address.slice(-8)}
                  </p>
                </div>
              )}

              {hasPurchased ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Already Purchased</p>
                      <p className="text-sm text-green-700">
                        View your files in My Purchases
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('my-purchases')}
                    className="w-full mt-3 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View My Purchases
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBuyClick}
                  className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Buy Now
                </button>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-600">
                    Blockchain-verified transactions with instant access
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Instant Delivery</p>
                  <p className="text-xs text-gray-600">
                    Access your purchase immediately after payment
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p className="mb-1">
                <strong>Unique Link:</strong> {product.unique_link}
              </p>
              <p>
                Share this link: {window.location.origin}?product={product.unique_link}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          product={product}
          onClose={() => {
            setShowPaymentModal(false);
            fetchProduct();
          }}
        />
      )}
    </div>
  );
}
