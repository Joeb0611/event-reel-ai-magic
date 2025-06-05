
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileVideo, CheckCircle, AlertCircle, X, Play } from 'lucide-react';
import { CompressionProgress, formatFileSize } from '@/utils/videoCompression';

export interface FileCompressionStatus {
  id: string;
  file: File;
  originalFile: File;
  progress: CompressionProgress;
  status: 'pending' | 'compressing' | 'completed' | 'error' | 'cancelled';
}

interface CompressionPreviewProps {
  files: FileCompressionStatus[];
  onCancel: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  onRemove: (fileId: string) => void;
}

const CompressionPreview = ({ files, onCancel, onRetry, onRemove }: CompressionPreviewProps) => {
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    if (files.length === 0) return;
    
    const avgProgress = files.reduce((sum, file) => sum + file.progress.progress, 0) / files.length;
    setTotalProgress(avgProgress);
  }, [files]);

  const completedFiles = files.filter(f => f.status === 'completed').length;
  const totalSavings = files.reduce((sum, file) => {
    if (file.status === 'completed') {
      return sum + (file.originalFile.size - file.file.size);
    }
    return sum;
  }, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'compressing':
        return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <FileVideo className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'compressing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (files.length === 0) return null;

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Compression Progress ({completedFiles}/{files.length})</span>
          {totalSavings > 0 && (
            <span className="text-sm font-normal text-green-600">
              Saved {formatFileSize(totalSavings)}
            </span>
          )}
        </CardTitle>
        <Progress value={totalProgress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-3 max-h-64 overflow-y-auto">
        {files.map((fileStatus) => (
          <div
            key={fileStatus.id}
            className={`p-3 rounded-lg border ${getStatusColor(fileStatus.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getStatusIcon(fileStatus.status)}
                <span className="text-sm font-medium truncate">
                  {fileStatus.originalFile.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {fileStatus.status === 'error' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRetry(fileStatus.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Retry
                  </Button>
                )}
                {fileStatus.status === 'compressing' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCancel(fileStatus.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(fileStatus.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  {formatFileSize(fileStatus.originalFile.size)} → {formatFileSize(fileStatus.progress.estimatedSize)}
                </span>
                <span>{Math.round(fileStatus.progress.progress)}%</span>
              </div>
              
              {fileStatus.status === 'compressing' && (
                <Progress value={fileStatus.progress.progress} className="h-1" />
              )}

              {fileStatus.status === 'completed' && (
                <div className="text-xs text-green-600">
                  Saved {formatFileSize(fileStatus.originalFile.size - fileStatus.file.size)} 
                  ({Math.round((1 - fileStatus.file.size / fileStatus.originalFile.size) * 100)}% reduction)
                </div>
              )}

              {fileStatus.status === 'error' && (
                <div className="text-xs text-red-600">
                  Compression failed. Click retry or remove to upload original.
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CompressionPreview;
