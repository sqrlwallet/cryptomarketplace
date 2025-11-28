import { useState, useEffect } from 'react';
import { User, ShoppingBag, Copy, ShoppingCart } from 'lucide-react';
import { supabase, type Product, type Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from './SEO';
import PaymentModal from './PaymentModal';

interface UserProfilePageProps {
  username: string;
  onNavigate: (view: string) => void;
}

export default function UserProfilePage({ username, onNavigate }: UserProfilePageProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchProfileAndProducts();
  }, [username]);

  const fetchProfileAndProducts = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('User not found');

      setProfile(profileData);

      // 2. Fetch Products if user is a seller
      if (profileData.is_seller) {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', profileData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = (product: Product) => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    setSelectedProduct(product);
    setShowPaymentModal(true);
  };

  const copyProfileLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
        <p className="text-gray-600 mb-6">
          The user "{username}" does not exist or has been removed.
        </p>
        <button
          onClick={() => onNavigate('marketplace')}
          className="neo-button-primary uppercase"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title={`${profile.username}'s Store`}
        description={`Check out ${profile.username}'s products on Ripework.`}
      />

      {/* Profile Header */}
      <div className="relative mb-12">
        {/* Banner */}
        <div className="h-64 w-full relative overflow-hidden border-2 border-white shadow-neo-white group">
          <img
            src="/profile-banner.png"
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
        </div>

        {/* Profile Info Overlay */}
        <div className="max-w-7xl mx-auto px-4 relative -mt-20 z-10">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="bg-black border-2 border-white p-1 shadow-neo">
              <div className="w-40 h-40 bg-surface flex items-center justify-center border-2 border-white relative overflow-hidden group">
                <User className="w-20 h-20 text-primary relative z-10" />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
              </div>
            </div>

            <div className="flex-1 mb-4 bg-black/80 backdrop-blur-sm border-2 border-white p-6 shadow-neo-white transform translate-y-4 md:translate-y-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white font-display uppercase tracking-wide mb-2 glitch-text" data-text={profile.username}>
                    {profile.username}
                  </h1>
                  {profile.bio && (
                    <p className="text-gray-300 font-mono text-sm max-w-xl line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center space-x-2">
                    {profile.is_seller && (
                      <span className="px-3 py-1 text-xs font-bold bg-primary text-black border-2 border-black uppercase shadow-neo animate-pulse">
                        Verified Seller
                      </span>
                    )}
                    <button
                      onClick={copyProfileLink}
                      className="neo-button px-3 py-1 text-xs"
                    >
                      <Copy className="w-3 h-3 inline mr-1" />
                      SHARE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Products */}
      {profile.is_seller && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8 border-b-2 border-white pb-4">
            <div className="flex items-center space-x-4">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-white font-display uppercase">
                Store Inventory
              </h2>
            </div>
            <span className="text-primary font-mono text-xl font-bold">
              {products.length} ITEMS
            </span>
          </div>

          {products.length === 0 ? (
            <div className="bg-surface border-2 border-white p-12 text-center shadow-neo-white">
              <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">No active listings</h3>
              <p className="text-gray-400 font-mono uppercase">&gt;&gt; THIS_SELLER_HAS_NO_ITEMS</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="neo-card group cursor-pointer relative bg-black hover:-translate-y-2 transition-transform duration-200"
                  onClick={() => {
                    window.history.pushState({}, '', `?product=${product.unique_link}`);
                    window.location.href = `?product=${product.unique_link}`;
                  }}
                >
                  <div className="relative h-64 overflow-hidden border-b-2 border-white">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center border-b-2 border-white">
                        <ShoppingCart className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3 py-1 text-xs font-bold bg-primary text-black border-2 border-black uppercase shadow-neo">
                        {product.type}
                      </span>
                    </div>
                    {/* Quick Buy Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="neo-button-primary transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200">
                        VIEW DETAILS
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-white mb-2 group-hover:text-primary transition-colors line-clamp-1 font-display uppercase tracking-wide">
                        {product.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 h-10 font-mono">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {product.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-black text-primary border border-primary font-mono uppercase"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-white/20">
                      <div>
                        <div className="text-2xl font-bold text-white font-mono">
                          {product.price} <span className="text-sm text-gray-400 font-normal">{product.currency}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyClick(product);
                        }}
                        className="neo-button-primary flex items-center space-x-2 scale-90 hover:scale-100 transition-transform"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>BUY</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
