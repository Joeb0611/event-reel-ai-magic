
import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface VideoDropZoneProps {
  onFileSelect: (files: FileList | null) => void;
  maxFiles: number;
}

const VideoDropZone = ({ onFileSelect, maxFiles }: VideoDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
        isDragging 
          ? 'border-purple-400 bg-purple-50' 
          : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
      <p className="text-lg font-medium mb-2">
        {isDragging ? 'Drop files here' : 'Drag & drop photos & videos or click to browse'}
      </p>
      <p className="text-sm text-gray-500">
        Images (JPG, PNG, GIF, WEBP, HEIC) and Videos (MP4, MOV, QuickTime, AVI) up to 500MB each (max {maxFiles} files)
      </p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,video/mp4,video/mov,video/quicktime,video/avi"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files)}
      />
    </div>
  );
};

export default VideoDropZone;
