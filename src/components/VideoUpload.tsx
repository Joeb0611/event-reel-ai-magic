import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Video, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VideoFile } from '@/hooks/useVideos';
import { validateFileType, validateFileSize, sanitizeFileName } from '@/utils/security';
import CompressionPreview, { FileCompressionStatus } from '@/components/CompressionPreview';
import { compressVideo } from '@/utils/videoCompression';
import { getCompressionSettingsFromQuality } from '@/utils/projectSettings';

interface VideoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  projectId: string;
  projectName: string;
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // Increased to 500MB since we'll compress
const MAX_FILES_PER_UPLOAD = 20;

const VideoUpload = ({ isOpen, onClose, onVideosUploaded, projectId, projectName }: VideoUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressionFiles, setCompressionFiles] = useState<FileCompressionStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get project video quality setting (defaulting to 'good' for now)
  const projectVideoQuality = 'good'; // This would come from project settings in real implementation
  const compressionSettings = getCompressionSettingsFromQuality(projectVideoQuality);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!validateFileType(file, ALLOWED_VIDEO_TYPES)) {
        errors.push(`${file.name}: Only MP4, MOV, QuickTime, and AVI videos are supported.`);
        continue;
      }

      // Validate file size
      if (!validateFileSize(file, MAX_FILE_SIZE)) {
        errors.push(`${file.name}: File too large. Maximum size is 500MB.`);
        continue;
      }

      // Check for duplicate names
      if (selectedFiles.some(existing => existing.name === file.name)) {
        errors.push(`${file.name}: File already selected.`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total file limit
    if (selectedFiles.length + validFiles.length > MAX_FILES_PER_UPLOAD) {
      errors.push(`Too many files. Maximum ${MAX_FILES_PER_UPLOAD} files per upload.`);
      return validFiles.slice(0, MAX_FILES_PER_UPLOAD - selectedFiles.length);
    }

    if (errors.length > 0) {
      toast({
        title: "File Validation Errors",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    return validFiles;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = validateFiles(files);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompress = async () => {
    if (selectedFiles.length === 0) return;

    setCompressing(true);
    const newCompressionFiles: FileCompressionStatus[] = selectedFiles.map((file, index) => ({
      id: `${index}-${Date.now()}`,
      file,
      originalFile: file,
      progress: { progress: 0, originalSize: file.size, estimatedSize: file.size, status: 'preparing' },
      status: 'pending'
    }));

    setCompressionFiles(newCompressionFiles);

    // Compress files one by one using project quality setting
    for (let i = 0; i < newCompressionFiles.length; i++) {
      const fileStatus = newCompressionFiles[i];
      
      try {
        setCompressionFiles(prev => prev.map(f => 
          f.id === fileStatus.id 
            ? { ...f, status: 'compressing' }
            : f
        ));

        const compressedFile = await compressVideo(
          fileStatus.originalFile,
          compressionSettings,
          (progress) => {
            setCompressionFiles(prev => prev.map(f => 
              f.id === fileStatus.id 
                ? { ...f, progress }
                : f
            ));
          }
        );

        setCompressionFiles(prev => prev.map(f => 
          f.id === fileStatus.id 
            ? { ...f, file: compressedFile, status: 'completed' }
            : f
        ));

      } catch (error) {
        console.error('Compression failed for file:', fileStatus.originalFile.name, error);
        setCompressionFiles(prev => prev.map(f => 
          f.id === fileStatus.id 
            ? { ...f, status: 'error' }
            : f
        ));
      }
    }

    setCompressing(false);
  };

  const handleCompressionCancel = (fileId: string) => {
    setCompressionFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'cancelled' }
        : f
    ));
  };

  const handleCompressionRetry = async (fileId: string) => {
    const fileStatus = compressionFiles.find(f => f.id === fileId);
    if (!fileStatus) return;

    try {
      setCompressionFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'compressing', progress: { ...f.progress, progress: 0, status: 'preparing' } }
          : f
      ));

      const compressedFile = await compressVideo(
        fileStatus.originalFile,
        compressionSettings,
        (progress) => {
          setCompressionFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, progress }
              : f
          ));
        }
      );

      setCompressionFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, file: compressedFile, status: 'completed' }
          : f
      ));

    } catch (error) {
      console.error('Retry compression failed:', error);
      setCompressionFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error' }
          : f
      ));
    }
  };

  const handleCompressionRemove = (fileId: string) => {
    setCompressionFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFilesToUpload = (): File[] => {
    // Always use compressed files if available, otherwise use original files
    if (compressionFiles.length > 0) {
      return compressionFiles
        .filter(f => f.status === 'completed')
        .map(f => f.file);
    }
    return selectedFiles;
  };

  const handleUpload = async () => {
    const filesToUpload = getFilesToUpload();
    if (filesToUpload.length === 0 || !user) return;

    setUploading(true);
    const uploadedVideos: VideoFile[] = [];

    try {
      for (const file of filesToUpload) {
        // Create secure file path with user and project validation
        const sanitizedFileName = sanitizeFileName(file.name);
        const fileExt = sanitizedFileName.split('.').pop();
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${user.id}/${projectId}/${timestamp}-${randomId}.${fileExt}`;
        
        // Upload file to secure videos bucket
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Save video metadata with validation
        const { data: videoData, error: dbError } = await supabase
          .from('media_assets')
          .insert([
            {
              user_id: user.id,
              project_id: projectId,
              file_name: sanitizedFileName,
              file_path: fileName,
              file_type: file.type,
              file_size: file.size,
              description: `Video uploaded for ${projectName}`,
            },
          ])
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Clean up uploaded file
          await supabase.storage.from('videos').remove([fileName]);
          throw new Error(`Failed to save ${file.name}: ${dbError.message}`);
        }

        // Get signed URL for immediate display
        const { data: urlData } = await supabase.storage
          .from('videos')
          .createSignedUrl(fileName, 3600);

        // Transform to VideoFile format
        uploadedVideos.push({
          id: videoData.id,
          name: videoData.file_name,
          file_path: videoData.file_path,
          size: videoData.file_size || 0,
          uploaded_at: videoData.upload_date || new Date().toISOString(),
          created_at: videoData.upload_date || new Date().toISOString(),
          edited: false,
          project_id: projectId,
          user_id: user.id,
          url: urlData?.signedUrl,
          uploaded_by_guest: false
        });
      }

      onVideosUploaded(uploadedVideos);
      setSelectedFiles([]);
      setCompressionFiles([]);
      onClose();

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${uploadedVideos.length} video(s)`,
      });

    } catch (error) {
      console.error('Error uploading videos:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload videos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const totalSizeMB = selectedFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);
  const readyToUpload = compressionFiles.filter(f => f.status === 'completed').length > 0 || 
    (selectedFiles.length > 0 && compressionFiles.length === 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Video Upload</DialogTitle>
          <DialogDescription>
            Upload videos to {projectName}. Videos will be automatically compressed based on your project quality setting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Notice */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <AlertTriangle className="h-4 w-4" />
            <span>All uploads are scanned for security and validated before processing.</span>
          </div>

          {/* Drop Zone */}
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
              {isDragging ? 'Drop videos here' : 'Drag & drop videos or click to browse'}
            </p>
            <p className="text-sm text-gray-500">
              MP4, MOV, QuickTime, AVI files up to 500MB each (max {MAX_FILES_PER_UPLOAD} files)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/mp4,video/mov,video/quicktime,video/avi"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Project Quality Info */}
          {selectedFiles.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Video Quality:</strong> {projectVideoQuality.charAt(0).toUpperCase() + projectVideoQuality.slice(1)} quality compression will be applied automatically.
              </p>
              <p className="text-xs text-green-600 mt-1">
                This setting is configured by the project owner and ensures consistent video quality across all uploads.
              </p>
            </div>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Selected Videos ({selectedFiles.length}/{MAX_FILES_PER_UPLOAD})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Video className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={uploading || compressing}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compression Preview */}
          {compressionFiles.length > 0 && (
            <CompressionPreview
              files={compressionFiles}
              onCancel={handleCompressionCancel}
              onRetry={handleCompressionRetry}
              onRemove={handleCompressionRemove}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={uploading || compressing}>
              Cancel
            </Button>
            
            {selectedFiles.length > 0 && compressionFiles.length === 0 && (
              <Button 
                onClick={handleCompress}
                disabled={compressing || selectedFiles.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {compressing ? 'Compressing...' : `Compress ${selectedFiles.length} Video${selectedFiles.length !== 1 ? 's' : ''}`}
              </Button>
            )}
            
            <Button 
              onClick={handleUpload}
              disabled={!readyToUpload || uploading || compressing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {uploading ? 'Uploading...' : `Upload ${getFilesToUpload().length} Video${getFilesToUpload().length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUpload;
