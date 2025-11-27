import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase, type Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import FileUpload from './FileUpload';

interface CreateProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

export default function CreateProductModal({ product, onClose }: CreateProductModalProps) {
  const { profile, user } = useAuth();
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'product' as 'product' | 'service',
    price: '',
    currency: 'ETH',
    seller_wallet: walletAddress || '',
    unique_link: '',
    tags: '',
    image_url: '',
    has_files: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        type: product.type,
        price: product.price.toString(),
        currency: product.currency,
        seller_wallet: product.seller_wallet,
        unique_link: product.unique_link,
        tags: product.tags.join(', '),
        image_url: product.image_url || '',
        has_files: (product as any).has_files || false,
      });
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    } else if (walletAddress) {
      setFormData(prev => ({ ...prev, seller_wallet: walletAddress }));
    }
  }, [product, walletAddress]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setProductImage(null);
    setImagePreview('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const generateUniqueLink = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const random = Math.random().toString(36).substring(2, 8);
    setFormData({ ...formData, unique_link: `${slug}-${random}` });
  };

  const uploadProductImage = async (productId: string): Promise<string | null> => {
    if (!productImage) return null;

    const fileExt = productImage.name.split('.').pop();
    const fileName = `${productId}.${fileExt}`;
    const filePath = `${user!.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, productImage, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const uploadFiles = async (productId: string) => {
    if (selectedFiles.length === 0) return;

    setUploadingFiles(true);

    for (const file of selectedFiles) {
      const filePath = `${user!.id}/${productId}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('product-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('product_files')
        .insert({
          product_id: productId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
        });

      if (dbError) throw dbError;
    }

    await supabase
      .from('products')
      .update({
        has_files: true,
        file_count: selectedFiles.length,
      })
      .eq('id', productId);

    setUploadingFiles(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!profile || !user) return;
    if (!formData.seller_wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      let productId: string;

      if (product) {
        productId = product.id;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({
            seller_id: profile.id,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            price: parseFloat(formData.price),
            currency: formData.currency,
            seller_wallet: formData.seller_wallet,
            unique_link: formData.unique_link,
            tags,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      let imageUrl = formData.image_url;
      if (productImage) {
        const uploadedUrl = await uploadProductImage(productId);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const productData = {
        seller_id: profile.id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: parseFloat(formData.price),
        currency: formData.currency,
        seller_wallet: formData.seller_wallet,
        unique_link: formData.unique_link,
        tags,
        image_url: imageUrl || null,
        is_active: true,
        has_files: selectedFiles.length > 0,
        file_count: selectedFiles.length,
      };

      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (updateError) throw updateError;

      if (selectedFiles.length > 0) {
        await uploadFiles(productId);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Listing' : 'Create New Listing'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter product or service title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Describe your offering"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'product' | 'service' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <optgroup label="Ethereum Mainnet">
                <option value="ETH">ETH (Ethereum)</option>
                <option value="USDT">USDT (Tether USD)</option>
                <option value="USDC">USDC (USD Coin)</option>
                <option value="DAI">DAI (Dai Stablecoin)</option>
              </optgroup>
              <optgroup label="Polygon Network">
                <option value="MATIC">MATIC (Polygon)</option>
                <option value="USDT-POLYGON">USDT (Polygon)</option>
                <option value="USDC-POLYGON">USDC (Polygon)</option>
              </optgroup>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the cryptocurrency you want to receive as payment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Wallet Address
            </label>
            <input
              type="text"
              value={formData.seller_wallet}
              onChange={(e) => setFormData({ ...formData, seller_wallet: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
              placeholder="0x..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              90% of payments will be sent to this wallet (10% platform fee)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unique Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.unique_link}
                onChange={(e) => setFormData({ ...formData, unique_link: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="my-product-abc123"
                required
              />
              <button
                type="button"
                onClick={generateUniqueLink}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="web3, nft, design (comma separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  Click to upload product image
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Digital Files (Optional)
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Upload files that buyers will receive after purchase. Perfect for ebooks, templates, software, media files, etc.
            </p>
            <FileUpload
              onFilesSelected={setSelectedFiles}
              maxFiles={10}
              maxSizeInMB={100}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {uploadingFiles && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading files...</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploadingFiles}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (uploadingFiles ? 'Uploading Files...' : 'Saving...') : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
