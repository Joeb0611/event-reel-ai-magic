
import React from 'react';
import { Video, X, CheckCircle, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const createVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = 160;
        canvas.height = 90;
        video.currentTime = 1; // Seek to 1 second for thumbnail
      });
      
      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL());
        }
      });
      
      video.addEventListener('error', () => {
        resolve(''); // Return empty string on error
      });
      
      video.src = URL.createObjectURL(file);
      video.load();
    });
  };

  const createImageThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = 160;
        canvas.height = 90;
        
        if (ctx) {
          // Calculate aspect ratio to maintain proportions
          const aspectRatio = img.width / img.height;
          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;
          
          if (aspectRatio > canvas.width / canvas.height) {
            drawHeight = canvas.width / aspectRatio;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawWidth = canvas.height * aspectRatio;
            offsetX = (canvas.width - drawWidth) / 2;
          }
          
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          resolve(canvas.toDataURL());
        }
      };
      
      img.onerror = () => {
        resolve(''); // Return empty string on error
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const FilePreview = ({ file }: { file: File }) => {
    const [thumbnail, setThumbnail] = React.useState<string>('');
    
    React.useEffect(() => {
      if (file.type.startsWith('video/')) {
        createVideoThumbnail(file).then(setThumbnail);
      } else if (file.type.startsWith('image/')) {
        createImageThumbnail(file).then(setThumbnail);
      }
      
      return () => {
        if (thumbnail) {
          URL.revokeObjectURL(thumbnail);
        }
      };
    }, [file]);

    if (thumbnail) {
      return (
        <img 
          src={thumbnail} 
          alt="Preview" 
          className="w-full h-full object-cover rounded"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
        {file.type.startsWith('video/') ? (
          <Video className="w-6 h-6 text-gray-400" />
        ) : (
          <FileImage className="w-6 h-6 text-gray-400" />
        )}
      </div>
    );
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        Selected Files ({files.length}/{maxFiles})
      </h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-8 flex-shrink-0 overflow-hidden rounded">
                <FilePreview file={file} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.type.startsWith('video/') ? 'Video' : 'Image'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFile(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoFileList;
