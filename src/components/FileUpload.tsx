import { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, FileText, Music } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
}

export default function FileUpload({ onFilesSelected, maxFiles = 10, maxSizeInMB = 100 }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const maxSizeBytes = maxSizeInMB * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);

    if (oversizedFiles.length > 0) {
      setError(`Some files exceed ${maxSizeInMB}MB limit`);
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const maxSizeBytes = maxSizeInMB * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);

    if (oversizedFiles.length > 0) {
      setError(`Some files exceed ${maxSizeInMB}MB limit`);
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white rounded-none p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors group"
      >
        <Upload className="w-12 h-12 text-white group-hover:text-primary mx-auto mb-4 transition-colors" />
        <p className="text-white font-bold mb-1 font-mono uppercase group-hover:text-primary transition-colors">
          CLICK_TO_UPLOAD_OR_DRAG_AND_DROP
        </p>
        <p className="text-sm text-gray-400 font-mono uppercase">
          MAX {maxFiles} FILES, UP_TO {maxSizeInMB}MB EACH
        </p>
        <p className="text-xs text-gray-500 mt-2 font-mono uppercase">
          SUPPORTS: IMAGES, VIDEOS, AUDIO, PDFS, DOCUMENTS, ARCHIVES
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-900/20 border-2 border-red-500 text-red-500 px-4 py-3 text-sm font-mono font-bold uppercase">
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-white font-mono uppercase">
            SELECTED_FILES ({selectedFiles.length})
          </p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-black border-2 border-white p-3"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-primary flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate font-mono uppercase">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 hover:bg-red-500 hover:text-black text-red-500 transition-colors flex-shrink-0 ml-2 border border-transparent hover:border-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
