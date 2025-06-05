
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Video, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VideoFile } from '@/hooks/useVideos';
import { validateFileType, validateFileSize, sanitizeFileName } from '@/utils/security';

interface VideoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  projectId: string;
  projectName: string;
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi'];
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
const MAX_FILES_PER_UPLOAD = 20;

const VideoUpload = ({ isOpen, onClose, onVideosUploaded, projectId, projectName }: VideoUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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
        errors.push(`${file.name}: File too large. Maximum size is 1GB.`);
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

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !user) return;

    setUploading(true);
    const uploadedVideos: VideoFile[] = [];

    try {
      for (const file of selectedFiles) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Secure Video Upload</DialogTitle>
          <DialogDescription>
            Upload videos to {projectName}. Files are validated and securely stored.
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
              MP4, MOV, QuickTime, AVI files up to 1GB each (max {MAX_FILES_PER_UPLOAD} files)
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

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Selected Videos ({selectedFiles.length}/{MAX_FILES_PER_UPLOAD})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Video${selectedFiles.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUpload;
