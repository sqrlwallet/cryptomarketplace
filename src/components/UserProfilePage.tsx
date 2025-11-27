import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, User, Calendar, Package } from 'lucide-react';
import { supabase, type Product, type Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './PaymentModal';

interface UserProfilePageProps {
  username: string;
  onNavigate: (view: string, username?: string) => void;
}

export default function UserProfilePage({ username, onNavigate }: UserProfilePageProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    setLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (profileError || !profileData) {
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', profileData.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    setProducts(productsData || []);
    setLoading(false);
  };

  const handleProductClick = (product: Product) => {
    window.history.pushState({}, '', `?product=${product.unique_link}`);
    window.location.href = `?product=${product.unique_link}`;
  };

  const handleBuyClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onNavigate('auth');
      return;
    }
    setSelectedProduct(product);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">
            The user profile you're looking for doesn't exist.
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.username}
              </h1>

              {profile.bio && (
                <p className="text-gray-600 text-lg mb-4">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {profile.wallet_address && (
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span className="font-mono">
                      {profile.wallet_address.slice(0, 10)}...{profile.wallet_address.slice(-8)}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {products.length} {products.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Products by {profile.username}
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600">
              This seller hasn't listed any products yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-blue-400" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg flex-1">
                      {product.title}
                    </h3>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {product.type}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {product.price} {product.currency}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        +10% platform fee
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleBuyClick(product, e)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPaymentModal && selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
