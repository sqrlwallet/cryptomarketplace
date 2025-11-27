import { useState, useEffect } from 'react';
import { Plus, Package, Edit2, Trash2, Copy, ExternalLink } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CreateProductModal from './CreateProductModal';

import SEO from './SEO';

export default function SellerDashboard() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [profile]);

  const fetchProducts = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
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
    const url = `${window.location.origin}/?product=${uniqueLink}`;
    navigator.clipboard.writeText(url);
    alert('Product link copied to clipboard!');
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
    fetchProducts();
  };

  if (!profile?.is_seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Become a Seller</h2>
        <p className="text-gray-600 mb-6">
          You need to enable seller mode in your profile to create listings
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading your products...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Seller Dashboard"
        description="Manage your inventory, create listings, and track your sales."
        type="dashboard"
      />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-display uppercase">My Store</h1>
          <p className="text-gray-400 mt-1 font-mono uppercase">&gt;&gt; MANAGE_INVENTORY_SYSTEM</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="neo-button-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>CREATE LISTING</span>
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

      {showCreateModal && (
        <CreateProductModal
          product={editingProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
