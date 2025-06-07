
import { useToast } from '@/hooks/use-toast';

const ALLOWED_FILE_TYPES = [
  // Video types
  'video/mp4', 'video/mov', 'video/quicktime', 'video/avi',
  // Image types
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic'
];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB since we'll compress videos
const MAX_FILES_PER_UPLOAD = 20;

export const useFileValidation = () => {
  const { toast } = useToast();

  const validateFiles = (files: FileList, selectedFiles: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Only MP4, MOV, QuickTime, AVI videos and JPG, PNG, GIF, WEBP, HEIC images are supported.`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
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

  return { validateFiles, MAX_FILES_PER_UPLOAD };
};
