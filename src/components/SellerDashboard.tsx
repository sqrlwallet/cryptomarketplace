import { useState, useEffect } from 'react';
import { Plus, Package, Edit2, Trash2, Copy, ExternalLink, TrendingUp, Eye, ShoppingBag, DollarSign, BarChart3 } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CreateProductModal from './CreateProductModal';
import SEO from './SEO';

interface ProductAnalytics {
  product_id: string;
  seller_id: string;
  title: string;
  price: number;
  currency: string;
  total_views: number;
  total_sales: number;
  total_revenue: number;
  conversion_rate: number;
  last_sale_at: string | null;
}

export default function SellerDashboard() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'products'>('analytics');

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    // Fetch products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', profile.id)
      .order('created_at', { ascending: false });

    if (!productsError && productsData) {
      setProducts(productsData);
    }

    // Fetch analytics
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('product_analytics')
      .select('*')
      .eq('seller_id', profile.id)
      .order('total_revenue', { ascending: false });

    if (!analyticsError && analyticsData) {
      setAnalytics(analyticsData as ProductAnalytics[]);
    }

    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      setProducts(products.filter(p => p.id !== id));
      setAnalytics(analytics.filter(a => a.product_id !== id));
    }
  };

  const toggleProductStatus = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);

    if (!error) {
      setProducts(products.map(p =>
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ));
    }
  };

  const copyProductLink = (uniqueLink: string) => {
    const url = `${window.location.origin}/product/${uniqueLink}`;
    navigator.clipboard.writeText(url);
    alert('Product link copied to clipboard!');
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
    fetchData();
  };

  const getOverallStats = () => {
    const totalRevenue = analytics.reduce((sum, a) => sum + a.total_revenue, 0);
    const totalSales = analytics.reduce((sum, a) => sum + a.total_sales, 0);
    const totalViews = analytics.reduce((sum, a) => sum + a.total_views, 0);
    const avgConversionRate = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.conversion_rate, 0) / analytics.length
      : 0;
    const activeProducts = products.filter(p => p.is_active).length;

    return {
      totalRevenue,
      totalSales,
      totalViews,
      avgConversionRate,
      activeProducts,
    };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No sales yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!profile?.is_seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4 font-display uppercase">Become a Seller</h2>
        <p className="text-gray-400 mb-6 font-mono uppercase">
          &gt;&gt; ENABLE_SELLER_MODE_IN_PROFILE
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center text-white font-mono uppercase">LOADING_ANALYTICS...</div>
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Seller Dashboard"
        description="Manage your inventory, create listings, and track your sales analytics."
        type="dashboard"
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-display uppercase">Seller Dashboard</h1>
          <p className="text-gray-400 mt-1 font-mono uppercase">&gt;&gt; ANALYTICS_&amp;_INVENTORY_SYSTEM</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="neo-button-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE LISTING</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-black border-2 border-primary p-6 shadow-neo">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-mono uppercase">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-primary mt-1 font-mono uppercase">USDC</div>
        </div>

        <div className="bg-black border-2 border-white p-6 shadow-neo">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-mono uppercase">Total Sales</span>
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.totalSales}
          </div>
          <div className="text-xs text-gray-400 mt-1 font-mono uppercase">TRANSACTIONS</div>
        </div>

        <div className="bg-black border-2 border-white p-6 shadow-neo">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-mono uppercase">Total Views</span>
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.totalViews}
          </div>
          <div className="text-xs text-gray-400 mt-1 font-mono uppercase">IMPRESSIONS</div>
        </div>

        <div className="bg-black border-2 border-white p-6 shadow-neo">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-mono uppercase">Avg Conv Rate</span>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.avgConversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-1 font-mono uppercase">VIEW_TO_SALE</div>
        </div>

        <div className="bg-black border-2 border-white p-6 shadow-neo">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs font-mono uppercase">Active Products</span>
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.activeProducts}
          </div>
          <div className="text-xs text-gray-400 mt-1 font-mono uppercase">OF {products.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b-2 border-white/20">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-bold font-mono uppercase transition-colors ${activeTab === 'analytics'
              ? 'text-primary border-b-2 border-primary -mb-0.5'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-bold font-mono uppercase transition-colors ${activeTab === 'products'
              ? 'text-primary border-b-2 border-primary -mb-0.5'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Products
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-surface border-2 border-white p-12 text-center shadow-neo-white">
          <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">No products yet</h3>
          <p className="text-gray-400 mb-6 font-mono uppercase">&gt;&gt; INITIATE_FIRST_LISTING</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neo-button-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>CREATE LISTING</span>
          </button>
        </div>
      ) : (
        <>
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-black border-2 border-white shadow-neo-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface border-b-2 border-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider font-mono">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider font-mono">
                        Views
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider font-mono">
                        Sales
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider font-mono">
                        Revenue
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider font-mono">
                        Conv Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider font-mono">
                        Last Sale
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-primary uppercase tracking-wider font-mono">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-white/20">
                    {analytics.map((item) => {
                      const product = products.find(p => p.id === item.product_id);
                      if (!product) return null;

                      return (
                        <tr key={item.product_id} className="hover:bg-surface transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={item.title}
                                  className="w-12 h-12 object-cover border-2 border-white filter grayscale"
                                />
                              )}
                              <div>
                                <div className="text-sm font-bold text-white font-mono uppercase">
                                  {item.title}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                  {item.price} {item.currency}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-white font-mono font-bold">{item.total_views}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <ShoppingBag className="w-4 h-4 text-gray-400" />
                              <span className="text-white font-mono font-bold">{item.total_sales}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-mono font-bold">
                              {item.total_revenue.toFixed(2)} {item.currency}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              After fees: {(item.total_revenue * 0.9).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 border-2 ${item.conversion_rate > 5
                                ? 'border-primary text-primary'
                                : item.conversion_rate > 2
                                  ? 'border-white text-white'
                                  : 'border-gray-600 text-gray-400'
                              }`}>
                              <TrendingUp className="w-3 h-3" />
                              <span className="font-mono font-bold text-xs">
                                {item.conversion_rate.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-400 font-mono">
                              {formatDate(item.last_sale_at)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyProductLink(product.unique_link)}
                                className="p-1.5 bg-black text-white border border-white hover:bg-white hover:text-black transition-colors"
                                title="Copy Link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowCreateModal(true);
                                }}
                                className="p-1.5 bg-black text-white border border-white hover:bg-white hover:text-black transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-black border-2 border-white overflow-hidden shadow-neo hover:shadow-neo-white transition-all"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-48 object-cover border-b-2 border-white filter grayscale hover:grayscale-0 transition-all"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1 font-display uppercase tracking-wide">{product.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2 font-mono">{product.description}</p>
                      </div>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-bold border-2 uppercase ${product.is_active
                          ? 'bg-primary text-black border-primary'
                          : 'bg-black text-gray-500 border-gray-500'
                          }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-white font-mono">
                        {product.price} {product.currency}
                      </div>
                      <span className="text-xs bg-black text-primary border border-primary px-2 py-1 font-mono uppercase">
                        {product.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-black text-gray-300 border border-gray-600 px-2 py-1 font-mono uppercase"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyProductLink(product.unique_link)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors text-sm font-bold uppercase font-mono"
                      >
                        <Copy className="w-4 h-4" />
                        <span>COPY</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowCreateModal(true);
                        }}
                        className="p-2 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className="p-2 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 bg-black text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-black transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateProductModal
          product={editingProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
