
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { VideoFile } from '@/hooks/useVideos';
import { useFileValidation } from '@/hooks/useFileValidation';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import VideoDropZone from './VideoDropZone';
import VideoFileList from './VideoFileList';
import VideoUploadActions from './VideoUploadActions';

interface VideoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  projectId: string;
  projectName: string;
}

const VideoUploadDialog = ({ 
  isOpen, 
  onClose, 
  onVideosUploaded, 
  projectId, 
  projectName 
}: VideoUploadDialogProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { validateFiles, MAX_FILES_PER_UPLOAD } = useFileValidation();
  const { uploading, uploadFiles } = useVideoUpload(projectId, projectName);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = validateFiles(files, selectedFiles);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const uploadedVideos = await uploadFiles(selectedFiles);
    if (uploadedVideos.length > 0) {
      onVideosUploaded(uploadedVideos);
      setSelectedFiles([]);
      onClose();
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Media Upload</DialogTitle>
          <DialogDescription>
            Upload photos and videos to {projectName}. Your media will be automatically processed for optimal quality and performance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Notice */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <AlertTriangle className="h-4 w-4" />
            <span>All uploads are scanned for security and automatically optimized for the best viewing experience.</span>
          </div>

          {/* Drop Zone */}
          <VideoDropZone 
            onFileSelect={handleFileSelect}
            maxFiles={MAX_FILES_PER_UPLOAD}
          />

          {/* Processing Info */}
          {selectedFiles.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Auto-Processing:</strong> Your media will be automatically optimized during upload.
              </p>
              <p className="text-xs text-green-600 mt-1">
                This ensures the best quality and fast loading times for your project.
              </p>
            </div>
          )}

          {/* Selected Files */}
          <VideoFileList
            files={selectedFiles}
            onRemoveFile={removeFile}
            uploading={uploading}
            maxFiles={MAX_FILES_PER_UPLOAD}
          />

          {/* Actions */}
          <VideoUploadActions
            onCancel={handleClose}
            onUpload={handleUpload}
            uploading={uploading}
            fileCount={selectedFiles.length}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUploadDialog;
