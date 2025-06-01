import { useState, useCallback, useRef } from 'react';
import { Upload, Camera, X, FileImage, FileVideo, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/hooks/useProjects';
import { GuestUploadData } from './GuestUploadInterface';
import { validateFileType, validateFileSize, sanitizeFilename, validateGuestUploadData } from '@/utils/validation';

interface GuestFileUploadProps {
  project: Project;
  guestData: GuestUploadData;
  onUploadStart: () => void;
  onUploadComplete: (count: number) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  error?: string;
  uploading?: boolean;
  uploaded?: boolean;
}

const GuestFileUpload = ({
  project,
  guestData,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  disabled = false
}: GuestFileUploadProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): string | null => {
    if (!validateFileType(file)) {
      return 'File type not supported. Please use JPG, PNG, MP4, MOV, or HEIC files.';
    }
    if (!validateFileSize(file, maxFileSize)) {
      return 'File too large. Maximum size is 100MB.';
    }
    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Limit number of files to prevent abuse
    if (files.length + fileArray.length > 20) {
      onUploadError('Maximum 20 files allowed per session');
      return;
    }
    
    const processedFiles: FileWithPreview[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      const preview = await createFilePreview(file);
      
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id: `${Date.now()}-${Math.random()}`,
        preview,
        error: error || undefined,
      });
      
      processedFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...processedFiles]);
  }, [files.length, onUploadError]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input
    e.target.value = '';
  }, [addFiles]);

  const uploadFile = async (file: FileWithPreview): Promise<boolean> => {
    try {
      // Validate guest upload data
      const validation = validateGuestUploadData(guestData);
      if (!validation.isValid) {
        console.error('Invalid guest data:', validation.errors);
        return false;
      }

      // First validate that the project allows guest uploads with proper typing
      const { data: isValid } = await supabase.rpc('validate_guest_upload', {
        project_qr_code: project.qr_code
      }) as { data: boolean | null; error: any };

      if (!isValid) {
        console.error('Guest uploads not allowed for this project');
        return false;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const sanitizedName = sanitizeFilename(file.name);
      const fileName = `guest-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${project.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('guest-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create video record with sanitized data
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          name: sanitizedName,
          file_path: filePath,
          size: file.size,
          project_id: project.id,
          user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user ID
          uploaded_by_guest: true,
          guest_name: guestData.guestName?.trim().substring(0, 100) || null,
          guest_message: guestData.guestMessage?.trim().substring(0, 500) || null,
        });

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Upload error:', error);
      return false;
    }
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => !f.error);
    if (validFiles.length === 0) return;

    onUploadStart();
    setUploadProgress(0);

    let uploadedCount = 0;
    const totalFiles = validFiles.length;

    // Mark all files as uploading
    setFiles(prev => prev.map(f => ({ ...f, uploading: !f.error })));

    for (let i = 0; i < totalFiles; i++) {
      const file = validFiles[i];
      const success = await uploadFile(file);
      
      if (success) {
        uploadedCount++;
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, uploaded: true, uploading: false } : f
        ));
      } else {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, error: 'Upload failed', uploading: false } : f
        ));
      }
      
      setUploadProgress(((i + 1) / totalFiles) * 100);
    }

    if (uploadedCount > 0) {
      onUploadComplete(uploadedCount);
    } else {
      onUploadError('All uploads failed. Please try again.');
    }
  };

  const validFiles = files.filter(f => !f.error);
  const hasErrors = files.some(f => f.error);

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-300'}
          ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Support for JPG, PNG, MP4, MOV, HEIC files up to 100MB each (max 20 files)
        </p>
        
        <div className="flex justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              cameraInputRef.current?.click();
            }}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Selected Files ({files.length})</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border
                  ${file.error ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}
                  ${file.uploaded ? 'border-green-200 bg-green-50' : ''}
                `}
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : file.type.startsWith('video/') ? (
                    <FileVideo className="w-12 h-12 text-blue-500" />
                  ) : (
                    <FileImage className="w-12 h-12 text-green-500" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  {file.error && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-xs text-red-600">{file.error}</p>
                    </div>
                  )}
                  {file.uploading && <p className="text-xs text-blue-600">Uploading...</p>}
                  {file.uploaded && <p className="text-xs text-green-600">✓ Uploaded</p>}
                </div>

                {/* Remove Button */}
                {!file.uploading && !file.uploaded && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Button */}
          {validFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={disabled || validFiles.length === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload {validFiles.length} File{validFiles.length !== 1 ? 's' : ''}
            </Button>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600 text-center">
              Some files have errors. Please fix them before uploading.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestFileUpload;
