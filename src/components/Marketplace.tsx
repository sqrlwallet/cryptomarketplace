import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from './SEO';
import PaymentModal from './PaymentModal';

interface MarketplaceProps {
  onNavigate?: (view: string) => void;
}

export default function Marketplace({ onNavigate }: MarketplaceProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, typeFilter]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = products;

    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
  };

  const handleBuyClick = (product: Product) => {
    if (!user) {
      if (onNavigate) {
        onNavigate('auth');
      }
      return;
    }
    setSelectedProduct(product);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Marketplace"
        description="Discover premium digital assets, products, and services. Secure crypto payments on Base chain with instant delivery."
      />

      <div className="bg-surface border-2 border-white p-6 mb-12 shadow-neo-white">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH_DATABASE..."
              className="w-full pl-12 pr-4 py-4 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none transition-all font-mono uppercase"
            />
          </div>

          <div className="flex items-center space-x-2 min-w-[200px]">
            <div className="relative w-full">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full pl-12 pr-8 py-4 bg-black border-2 border-white text-white focus:border-primary focus:shadow-neo outline-none appearance-none cursor-pointer transition-all font-mono uppercase"
              >
                <option value="all" className="bg-black">ALL TYPES</option>
                <option value="product" className="bg-black">PRODUCTS</option>
                <option value="service" className="bg-black">SERVICES</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {
        filteredProducts.length === 0 ? (
          <div className="bg-surface border-2 border-white p-16 text-center shadow-neo-white">
            <div className="w-20 h-20 bg-black border-2 border-white flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-mono uppercase">No products found</h3>
            <p className="text-gray-400 font-mono">&gt;&gt; ADJUST_SEARCH_PARAMETERS</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="neo-card group cursor-pointer relative bg-black hover:-translate-y-2 transition-transform duration-200"
                onClick={() => {
                  window.history.pushState({}, '', `?product=${product.unique_link}`);
                  window.location.href = `?product=${product.unique_link}`;
                }}
              >
                <div className="relative h-56 overflow-hidden border-b-2 border-white">
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
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        +10% PLATFORM FEE
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyClick(product);
                      }}
                      className="neo-button-primary flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>BUY</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {
        showPaymentModal && selectedProduct && (
          <PaymentModal
            product={selectedProduct}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedProduct(null);
            }}
          />
        )
      }
    </div >
  );
}
