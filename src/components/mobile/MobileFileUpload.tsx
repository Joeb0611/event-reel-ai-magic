
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, FileImage, FileVideo, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useCloudflareIntegration } from '@/hooks/useCloudflareIntegration';
import confetti from 'canvas-confetti';

interface MobileFileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  projectId?: string;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  error?: string;
  uploading?: boolean;
  uploaded?: boolean;
  rotated?: number;
}

const MobileFileUpload = ({
  onUpload,
  disabled = false,
  maxFiles = 20,
  acceptedTypes = ['image/*', 'video/*'],
  projectId
}: MobileFileUploadProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { uploadToR2, initiateStreamUpload } = useCloudflareIntegration();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff69b4', '#ba55d3', '#dda0dd', '#ffc0cb']
    });
  };

  const correctImageOrientation = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            resolve(file);
          }
        }, file.type);
      };
      
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const createFilePreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const processedFiles: FileWithPreview[] = [];

    for (const file of fileArray.slice(0, maxFiles - files.length)) {
      let processedFile = file;
      
      // Auto-correct image orientation
      if (file.type.startsWith('image/')) {
        processedFile = await correctImageOrientation(file);
      }
      
      const preview = await createFilePreview(processedFile);
      
      const fileWithPreview: FileWithPreview = Object.assign(processedFile, {
        id: `${Date.now()}-${Math.random()}`,
        preview,
        rotated: 0
      });
      
      processedFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...processedFiles]);
  }, [files.length, maxFiles]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const rotateImage = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, rotated: ((f.rotated || 0) + 90) % 360 } : f
    ));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      addFiles(selectedFiles);
    }
    e.target.value = '';
  };

  const uploadToCloudflare = async (file: File): Promise<boolean> => {
    try {
      if (!projectId) {
        console.error('Project ID required for Cloudflare upload');
        return false;
      }

      const fileName = `${Date.now()}-${file.name}`;

      if (file.type.startsWith('video/')) {
        // Upload videos to Cloudflare Stream
        const uploadResult = await initiateStreamUpload(projectId, fileName, file.size);
        
        if (!uploadResult.success || !uploadResult.uploadUrl) {
          throw new Error('Failed to get upload URL from Cloudflare Stream');
        }

        const uploadResponse = await fetch(uploadResult.uploadUrl, {
          method: 'POST',
          body: file,
        });

        return uploadResponse.ok;
      } else {
        // Upload images to Cloudflare R2
        const fileContent = await file.arrayBuffer();
        const uploadResult = await uploadToR2(projectId, fileName, fileContent);
        
        return uploadResult.success;
      }
    } catch (error) {
      console.error('Cloudflare upload failed:', error);
      return false;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // If projectId is provided, use Cloudflare upload
      if (projectId) {
        let successCount = 0;
        for (let i = 0; i < files.length; i++) {
          const success = await uploadToCloudflare(files[i]);
          if (success) successCount++;
          setUploadProgress(((i + 1) / files.length) * 100);
        }
        
        if (successCount > 0) {
          triggerConfetti();
          toast({
            title: "Upload successful! 🎉",
            description: `${successCount} file(s) uploaded to Cloudflare successfully!`,
          });
        } else {
          throw new Error('All uploads failed');
        }
      } else {
        // Fallback to provided onUpload function
        const fileList = files.map(f => f as File);
        await onUpload(fileList);
        
        triggerConfetti();
        toast({
          title: "Upload successful! 🎉",
          description: `${files.length} file(s) uploaded successfully!`,
        });
      }
      
      setFiles([]);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="relative"
        >
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            size="lg"
            className="w-full h-16 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Upload className="w-6 h-6 mr-3" />
            Choose Photos & Videos
          </Button>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          className="relative"
        >
          <Button
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled || uploading}
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-2 border-purple-300 hover:border-purple-400"
          >
            <Camera className="w-6 h-6 mr-3" />
            Take Photo/Video
          </Button>
        </motion.div>
      </div>

      {projectId && (
        <p className="text-xs text-center text-blue-600">
          Files will be uploaded to Cloudflare for optimal performance
        </p>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
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

      {/* File Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">
                Selected Files ({files.length})
              </h4>
              <Button
                onClick={() => setFiles([])}
                variant="ghost"
                size="sm"
                disabled={uploading}
              >
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        style={{ 
                          transform: `rotate(${file.rotated || 0}deg)` 
                        }}
                      />
                    ) : file.type.startsWith('video/') ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileVideo className="w-8 h-8 text-blue-500" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileImage className="w-8 h-8 text-green-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* File Controls */}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {file.type.startsWith('image/') && (
                      <Button
                        onClick={() => rotateImage(file.id)}
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={uploading}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      onClick={() => removeFile(file.id)}
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={uploading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-center mt-1 truncate px-1">
                    {file.name}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading to Cloudflare...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Upload Button */}
            <motion.div
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {uploading ? 'Uploading to Cloudflare...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileFileUpload;
