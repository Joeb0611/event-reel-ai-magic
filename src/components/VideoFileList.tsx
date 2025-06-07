
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
              {file.type.startsWith('video/') ? (
                <Video className="w-5 h-5 text-blue-500 flex-shrink-0" />
              ) : (
                <FileImage className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
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
