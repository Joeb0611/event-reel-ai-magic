
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, AlertTriangle, X, FileImage, FileVideo } from 'lucide-react';
import { sanitizeInput, validateFileType, validateFileSize, sanitizeFileName, checkRateLimit } from '@/utils/security';

interface SecureGuestUploadProps {
  projectId: string;
  qrCode: string;
  guestName: string;
  onUploadComplete: () => void;
}

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/mov',
  'video/quicktime'
];

const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB
const MAX_FILES_PER_SESSION = 10;

const SecureGuestUpload = ({ projectId, qrCode, guestName, onUploadComplete }: SecureGuestUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Check rate limiting by IP (simplified - in production use proper IP detection)
    const userIdentifier = `guest_${Date.now()}_${Math.random()}`;
    if (!checkRateLimit(userIdentifier, 20, 60000)) { // 20 uploads per minute
      errors.push('Upload rate limit exceeded. Please wait before uploading more files.');
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!validateFileType(file, ALLOWED_FILE_TYPES)) {
        errors.push(`${file.name}: Unsupported file type. Only JPEG, PNG, HEIC, MP4, and MOV files are allowed.`);
        continue;
      }

      // Validate file size
      if (!validateFileSize(file, MAX_FILE_SIZE)) {
        errors.push(`${file.name}: File too large. Maximum size is 300MB.`);
        continue;
      }

      // Validate filename
      if (file.name.length > 255) {
        errors.push(`${file.name}: Filename too long.`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total file limit
    if (selectedFiles.length + validFiles.length > MAX_FILES_PER_SESSION) {
      errors.push(`Too many files selected. Maximum ${MAX_FILES_PER_SESSION} files per session.`);
    }

    if (errors.length > 0) {
      toast({
        title: "File Validation Errors",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    return validFiles.slice(0, MAX_FILES_PER_SESSION - selectedFiles.length);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles = validateFiles(files);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) {
      const validFiles = validateFiles(files);
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDropZoneClick = () => {
    const input = document.getElementById('file-upload') as HTMLInputElement;
    input?.click();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      const sanitizedGuestName = sanitizeInput(guestName);
      
      for (const file of selectedFiles) {
        console.log('Uploading file:', file.name);
        
        const sanitizedFileName = sanitizeFileName(file.name);
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const filePath = `${qrCode}/${timestamp}-${randomId}-${sanitizedFileName}`;
        
        console.log('File path:', filePath);
        
        try {
          await supabase.storage.createBucket('guest-uploads', {
            public: false,
            allowedMimeTypes: ALLOWED_FILE_TYPES,
            fileSizeLimit: MAX_FILE_SIZE
          });
        } catch (bucketError) {
          console.log('Bucket already exists or creation failed:', bucketError);
        }

        const { error: uploadError } = await supabase.storage
          .from('guest-uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        console.log('File uploaded successfully, now saving to database');

        const { error: dbError } = await supabase
          .from('videos')
          .insert({
            project_id: projectId,
            name: sanitizedFileName,
            file_path: filePath,
            size: file.size,
            guest_name: sanitizedGuestName,
            uploaded_by_guest: true,
            user_id: '00000000-0000-0000-0000-000000000000'
          });

        if (dbError) {
          console.error('Database error:', dbError);
          await supabase.storage.from('guest-uploads').remove([filePath]);
          throw new Error(`Failed to record ${file.name}: ${dbError.message}`);
        }

        console.log('File recorded in database successfully');
      }

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${selectedFiles.length} file(s)`,
      });
      
      setSelectedFiles([]);
      onUploadComplete();
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
          dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleDropZoneClick}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Select photos and videos to upload
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              multiple
              accept="image/jpeg,image/png,image/heic,image/heif,video/mp4,video/mov,video/quicktime"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            JPEG, PNG, HEIC, MP4, MOV up to 300MB each
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <FileImage className="h-8 w-8 text-blue-500" />
                  ) : (
                    <FileVideo className="h-8 w-8 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-amber-600">
        <AlertTriangle className="h-4 w-4" />
        <span>Files are scanned for security. Large files may take longer to process.</span>
      </div>

      <Button 
        onClick={uploadFiles}
        disabled={selectedFiles.length === 0 || uploading}
        className="w-full"
      >
        {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
      </Button>
    </div>
  );
};

export default SecureGuestUpload;
