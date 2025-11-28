import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Package, Shield, CheckCircle, Eye, Copy } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from './SEO';
import PaymentModal from './PaymentModal';

interface ProductPageProps {
  uniqueLink: string;
  onNavigate: (view: string, username?: string) => void;
}

export default function ProductPage({ uniqueLink, onNavigate }: ProductPageProps) {
  const { user, profile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [secretText, setSecretText] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<{ id: string; image_url: string; display_order: number }>>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');

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
    setSelectedImage(productData.image_url || '');

    const { data: galleryData } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productData.id)
      .order('display_order', { ascending: true });

    if (galleryData) {
      setGalleryImages(galleryData);
    }

    // Track product view
    await supabase
      .from('product_views')
      .insert({
        product_id: productData.id,
        viewer_id: user?.id || null,
      });

    if (user && profile?.wallet_address) {
      const { data: purchaseData } = await supabase
        .from('purchase_access')
        .select('id')
        .eq('product_id', productData.id)
        .eq('buyer_wallet', profile.wallet_address)
        .maybeSingle();

      if (purchaseData) {
        setHasPurchased(true);

        if ((productData as any).secret_text) {
          setSecretText((productData as any).secret_text);
        }
      }
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

  const copySecretText = () => {
    if (secretText) {
      navigator.clipboard.writeText(secretText);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md glass p-8 rounded-2xl">
          <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6">
            The product you're looking for doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={product.title}
        description={product.description}
        image={product.image_url || undefined}
        type="product"
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate('marketplace')}
          className="mb-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group font-mono uppercase"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>&lt;&lt; BACK_TO_MARKETPLACE</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-surface border-2 border-white p-2 mb-4 shadow-neo-white">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-96 object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-96 bg-black border-2 border-white flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-white/20" />
                </div>
              )}
            </div>

            {(product.image_url || galleryImages.length > 0) && (
              <div className="grid grid-cols-5 gap-2 mb-8">
                {product.image_url && (
                  <button
                    onClick={() => setSelectedImage(product.image_url || '')}
                    className={`border-2 ${selectedImage === product.image_url ? 'border-primary' : 'border-white'} hover:border-primary transition-colors overflow-hidden`}
                  >
                    <img
                      src={product.image_url}
                      alt="Cover"
                      className="w-full h-20 object-cover filter grayscale hover:grayscale-0 transition-all"
                    />
                  </button>
                )}
                {galleryImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`border-2 ${selectedImage === img.image_url ? 'border-primary' : 'border-white'} hover:border-primary transition-colors overflow-hidden`}
                  >
                    <img
                      src={img.image_url}
                      alt={`Gallery ${img.display_order + 1}`}
                      className="w-full h-20 object-cover filter grayscale hover:grayscale-0 transition-all"
                    />
                  </button>
                ))}
              </div>
            )}

            {(product as any).youtube_url && getYouTubeEmbedUrl((product as any).youtube_url) && (
              <div className="bg-black border-2 border-white p-2 mb-8 shadow-neo">
                <iframe
                  src={getYouTubeEmbedUrl((product as any).youtube_url) || ''}
                  title="Product Video"
                  className="w-full h-80"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {(product as any).has_files && (
              <div className="bg-black p-6 border-2 border-primary shadow-neo">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary border-2 border-black">
                    <Package className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 text-lg font-mono uppercase">
                      Digital Product
                    </h3>
                    <p className="text-sm text-gray-300 font-mono">
                      Includes {(product as any).file_count} downloadable file{(product as any).file_count !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-primary mt-2 font-bold font-mono uppercase">
                      &gt;&gt; IMMEDIATE_ACCESS_GRANTED
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 ${product.type === 'product'
                  ? 'bg-black text-blue-400 border-blue-400'
                  : 'bg-black text-emerald-400 border-emerald-400'
                  }`}>
                  {product.type === 'product' ? 'Product' : 'Service'}
                </span>
              </div>
              <h1 className="text-5xl font-bold font-display text-white mb-6 leading-tight uppercase">
                {product.title}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed font-mono border-l-4 border-white pl-4">
                {product.description}
              </p>
            </div>

            <div className="bg-surface border-2 border-white p-8 shadow-neo-white">
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-6xl font-bold text-white font-mono">
                  {product.price}
                </span>
                <span className="text-2xl text-gray-400 font-bold font-mono">
                  {product.currency}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6 font-mono uppercase">
                + 10% PLATFORM FEE
              </p>

              {hasPurchased ? (
                <>
                  <div className="bg-emerald-900/20 border-2 border-emerald-500 p-6 mb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-2 bg-emerald-500 border-2 border-black">
                        <CheckCircle className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-400 text-lg font-mono uppercase">Already Purchased</p>
                        <p className="text-sm text-emerald-300/80 font-mono">
                          &gt;&gt; CHECK_MY_PURCHASES
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('my-purchases')}
                      className="w-full px-6 py-4 bg-emerald-500 text-black border-2 border-emerald-500 hover:bg-emerald-400 transition-all font-bold uppercase shadow-neo"
                    >
                      View My Purchases
                    </button>
                  </div>

                  {secretText && (
                    <div className="bg-primary/10 border-2 border-primary p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="p-2 bg-primary border-2 border-black flex-shrink-0">
                          <Eye className="w-5 h-5 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-primary text-sm font-mono uppercase mb-1">
                            Secret Content Unlocked
                          </p>
                          <p className="text-xs text-gray-400 font-mono uppercase">
                            &gt;&gt; EXCLUSIVE_ACCESS_GRANTED
                          </p>
                        </div>
                      </div>
                      <div className="bg-black border-2 border-primary p-4 mb-3">
                        <p className="text-white font-mono text-sm whitespace-pre-wrap break-words">
                          {secretText}
                        </p>
                      </div>
                      <button
                        onClick={copySecretText}
                        className="w-full px-4 py-2 bg-primary text-black border-2 border-primary hover:bg-white hover:border-white transition-all font-bold uppercase font-mono flex items-center justify-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>{copiedSecret ? 'Copied!' : 'Copy to Clipboard'}</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={handleBuyClick}
                  className="w-full px-6 py-4 bg-primary text-black border-2 border-primary text-xl font-bold hover:bg-white hover:border-white hover:text-black transition-all shadow-neo hover:shadow-neo-white uppercase"
                >
                  Buy Now
                </button>
              )}
            </div>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-black text-primary text-sm border border-primary font-mono uppercase"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t-2 border-white pt-8">
              {sellerProfile && (
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-mono uppercase">Sold by</p>
                    <button
                      onClick={() => onNavigate('user-profile', sellerProfile.username)}
                      className="font-bold text-white text-lg font-display uppercase hover:text-primary transition-colors text-left"
                    >
                      {sellerProfile.username || 'Anonymous Seller'}
                    </button>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {sellerProfile.wallet_address.slice(0, 10)}...{sellerProfile.wallet_address.slice(-8)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-primary border-2 border-white flex items-center justify-center text-black font-bold text-xl shadow-neo-white">
                    {(sellerProfile.username || 'A')[0].toUpperCase()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black border-2 border-white p-4 flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white font-mono uppercase">Secure Payment</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      BLOCKCHAIN_VERIFIED
                    </p>
                  </div>
                </div>
                <div className="bg-black border-2 border-white p-4 flex items-start space-x-3">
                  <Package className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white font-mono uppercase">Instant Delivery</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      IMMEDIATE_ACCESS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-black border border-white/20 p-4 font-mono break-all">
              <p className="mb-2">
                <strong className="text-white">UNIQUE_LINK:</strong> {product.unique_link}
              </p>
              <p>
                <strong className="text-white">SHARE_URL:</strong> {window.location.origin}?product={product.unique_link}
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
