import { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
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
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'product' as 'product' | 'service',
    price: '',
    currency: 'USDC',
    seller_wallet: walletAddress || '',
    unique_link: '',
    tags: '',
    image_url: '',
    has_files: false,
    secret_text: '',
    youtube_url: '',
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
        secret_text: (product as any).secret_text || '',
        youtube_url: (product as any).youtube_url || '',
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

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('All files must be images');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setGalleryPreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setGalleryImages(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
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

  const uploadGalleryImages = async (productId: string) => {
    if (galleryImages.length === 0) return;

    for (let i = 0; i < galleryImages.length; i++) {
      const file = galleryImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery_${Date.now()}_${i}.${fileExt}`;
      const filePath = `${user!.id}/${productId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: data.publicUrl,
          display_order: i,
        });
    }
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
        secret_text: formData.secret_text || null,
        youtube_url: formData.youtube_url || null,
      };

      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (updateError) throw updateError;

      if (galleryImages.length > 0) {
        await uploadGalleryImages(productId);
      }

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border-2 border-white shadow-neo-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-black border-b-2 border-white px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white font-display uppercase">
            {product ? 'Edit Listing' : 'Create New Listing'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:text-black text-white transition-colors border-2 border-transparent hover:border-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none font-mono uppercase"
              placeholder="ENTER_TITLE"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none resize-none font-mono"
              placeholder="DESCRIBE_OFFERING..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'product' | 'service' })}
                className="w-full px-4 py-2 bg-black border-2 border-white text-white focus:border-primary focus:shadow-neo outline-none font-mono uppercase"
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
                Price
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none font-mono"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 bg-black border-2 border-white text-white focus:border-primary focus:shadow-neo outline-none font-mono uppercase"
            >
              <option value="USDC">USDC (Base)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1 font-mono uppercase">
              &gt;&gt; SELECT_PAYMENT_CURRENCY
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
              Payment Wallet Address
            </label>
            <input
              type="text"
              value={formData.seller_wallet}
              onChange={(e) => setFormData({ ...formData, seller_wallet: e.target.value })}
              className="w-full px-4 py-2 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none font-mono text-sm"
              placeholder="0x..."
              required
            />
            <p className="text-xs text-gray-500 mt-1 font-mono uppercase">
              &gt;&gt; 90%_PAYOUT_TO_THIS_WALLET (10%_PLATFORM_FEE)
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
              Unique Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.unique_link}
                onChange={(e) => setFormData({ ...formData, unique_link: e.target.value })}
                className="flex-1 px-4 py-2 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none font-mono text-sm"
                placeholder="my-product-abc123"
                required
              />
              <button
                type="button"
                onClick={generateUniqueLink}
                className="px-4 py-2 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors font-mono uppercase font-bold"
              >
                GENERATE
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none font-mono uppercase"
              placeholder="WEB3, NFT, DESIGN"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-3 font-mono uppercase">
              Cover Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-64 object-cover border-2 border-white filter grayscale"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-black border-2 border-black hover:bg-red-400 transition-colors shadow-neo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors group"
              >
                <Upload className="w-12 h-12 text-gray-600 group-hover:text-primary mx-auto mb-3 transition-colors" />
                <p className="text-gray-400 font-bold mb-1 font-mono uppercase group-hover:text-primary transition-colors">
                  CLICK_TO_UPLOAD_COVER
                </p>
                <p className="text-sm text-gray-600 font-mono uppercase">
                  PNG, JPG, GIF UP TO 5MB
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

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-3 font-mono uppercase">
              Additional Images (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3 font-mono uppercase">
              &gt;&gt; ADD_MORE_PRODUCT_IMAGES
            </p>
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover border-2 border-white filter grayscale"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-black border border-black hover:bg-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors group"
            >
              <Upload className="w-8 h-8 text-gray-600 group-hover:text-primary mx-auto mb-2 transition-colors" />
              <p className="text-gray-400 text-sm font-bold mb-1 font-mono uppercase group-hover:text-primary transition-colors">
                ADD_GALLERY_IMAGES
              </p>
              <p className="text-xs text-gray-600 font-mono uppercase">
                MULTIPLE_IMAGES_SUPPORTED
              </p>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGallerySelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
              YouTube Video URL (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3 font-mono uppercase">
              &gt;&gt; SHOWCASE_YOUR_PRODUCT_WITH_VIDEO
            </p>
            <input
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              className="w-full px-4 py-2 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none font-mono"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="border-t-2 border-white/20 pt-5">
            <label className="block text-sm font-bold text-gray-400 mb-1 font-mono uppercase">
              Secret Text (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3 font-mono uppercase">
              &gt;&gt; REVEALED_ONLY_TO_BUYERS_AFTER_PURCHASE
            </p>
            <textarea
              value={formData.secret_text}
              onChange={(e) => setFormData({ ...formData, secret_text: e.target.value })}
              className="w-full px-4 py-2 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none resize-none font-mono"
              placeholder="ENTER_SECRET_LINKS, CODES, OR_INSTRUCTIONS..."
              rows={4}
            />
          </div>

          <div className="border-t-2 border-white/20 pt-5">
            <label className="block text-sm font-bold text-gray-400 mb-3 font-mono uppercase">
              Digital Files (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3 font-mono uppercase">
              &gt;&gt; UPLOAD_DELIVERABLE_ASSETS
            </p>
            <FileUpload
              onFilesSelected={setSelectedFiles}
              maxFiles={10}
              maxSizeInMB={100}
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border-2 border-red-500 text-red-500 px-4 py-3 text-sm font-mono font-bold uppercase">
              {error}
            </div>
          )}

          {uploadingFiles && (
            <div className="bg-black border-2 border-primary text-primary px-4 py-3 text-sm flex items-center space-x-2 font-mono font-bold uppercase">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>UPLOADING_FILES...</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploadingFiles}
              className="flex-1 px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 font-bold uppercase font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="flex-1 px-6 py-3 bg-primary text-black border-2 border-primary hover:bg-white hover:border-white hover:text-black transition-colors disabled:opacity-50 font-bold uppercase font-mono shadow-neo hover:shadow-neo-white"
            >
              {loading ? (uploadingFiles ? 'UPLOADING...' : 'SAVING...') : product ? 'UPDATE' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
