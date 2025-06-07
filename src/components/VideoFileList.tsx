
import { Video, X, CheckCircle, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoFileListProps {
  files: File[];
  compressionProgress: { [key: string]: number };
  onRemoveFile: (index: number) => void;
  uploading: boolean;
  maxFiles: number;
}

const VideoFileList = ({ 
  files, 
  compressionProgress, 
  onRemoveFile, 
  uploading, 
  maxFiles 
}: VideoFileListProps) => {
  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const hasFilesInProgress = Object.keys(compressionProgress).length > 0;

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
                {compressionProgress[file.name] !== undefined && (
                  <div className="mt-1">
                    <div className="flex justify-between text-xs text-blue-600">
                      <span>{file.type.startsWith('video/') ? 'Compressing...' : 'Processing...'}</span>
                      <span>{Math.round(compressionProgress[file.name])}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                        style={{ width: `${compressionProgress[file.name]}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFile(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              disabled={uploading || hasFilesInProgress}
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
