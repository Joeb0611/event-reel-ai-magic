
import React from 'react';
import { Video, X, CheckCircle, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThumbnailImage from '@/components/ui/ThumbnailImage';

interface VideoFileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  uploading: boolean;
  maxFiles: number;
}

const VideoFileList = ({ 
  files, 
  onRemoveFile, 
  uploading, 
  maxFiles 
}: VideoFileListProps) => {
  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const FilePreview = ({ file }: { file: File }) => {
    const [imagePreview, setImagePreview] = React.useState<string>('');
    
    React.useEffect(() => {
      if (file.type.startsWith('image/')) {
        createImagePreview(file).then(setImagePreview).catch(() => {
          // Ignore preview errors
        });
      }
      
      return () => {
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
      };
    }, [file]);

    if (file.type.startsWith('image/') && imagePreview) {
      return (
        <ThumbnailImage
          src={imagePreview}
          alt={file.name}
          className="w-full h-full"
          fallbackIcon="image"
          showRetry={false}
        />
      );
    }

    // Show simple icons for videos (no loading states during selection)
    return (
      <ThumbnailImage
        alt={file.name}
        className="w-full h-full"
        fallbackIcon={file.type.startsWith('video/') ? 'video' : 'image'}
        showRetry={false}
      />
    );
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        Selected Files ({files.length}/{maxFiles})
      </h3>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Mobile-optimized thumbnail size */}
              <div className="w-16 h-10 md:w-20 md:h-12 flex-shrink-0 overflow-hidden rounded">
                <FilePreview file={file} />
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{file.type.startsWith('video/') ? 'Video' : 'Image'}</span>
                  
                  {/* Only show uploading state when actually uploading */}
                  {uploading && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">Uploading...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobile-friendly touch target */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFile(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 min-w-[44px] min-h-[44px] p-2"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* Upload status */}
      {uploading && (
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">
            Uploading files to Cloudflare...
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Processing will begin after upload completes
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoFileList;
