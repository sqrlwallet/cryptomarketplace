import { useState, useEffect } from 'react';
import { Download, File, Image, Video, FileText, Music, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProductFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
}

interface PurchasedFilesProps {
  productId: string;
  productTitle: string;
}

export default function PurchasedFiles({ productId, productTitle }: PurchasedFilesProps) {
  const { profile } = useAuth();
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [productId]);

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from('product_files')
      .select('*')
      .eq('product_id', productId);

    if (!error && data) {
      setFiles(data);
    }
    setLoading(false);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-600" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-600" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-green-600" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-5 h-5 text-red-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (file: ProductFile) => {
    setDownloading(file.id);

    try {
      const { data, error } = await supabase.storage
        .from('product-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (profile?.wallet_address) {
        await supabase
          .from('purchase_access')
          .update({
            last_accessed_at: new Date().toISOString(),
            download_count: supabase.sql`download_count + 1`,
          })
          .eq('product_id', productId)
          .eq('buyer_wallet', profile.wallet_address);
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No files available for this product
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-green-800 font-medium">Purchase Successful!</p>
          <p className="text-sm text-green-700">
            You now have access to {files.length} file{files.length !== 1 ? 's' : ''} for "{productTitle}"
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {getFileIcon(file.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.file_size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(file)}
              disabled={downloading === file.id}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0 ml-4"
            >
              {downloading === file.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-600 mb-2 font-medium">Important Notes:</p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Files are accessible anytime from your purchases</li>
          <li>Download limits may apply depending on the seller</li>
          <li>Keep your files safe - downloads are tracked</li>
        </ul>
      </div>
    </div>
  );
}
