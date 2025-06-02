
export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif',
    'video/mp4', 'video/mov', 'video/quicktime', 'video/avi'
  ];
  return allowedTypes.includes(file.type.toLowerCase());
};

export const validateFileSize = (file: File, maxSizeBytes: number = 100 * 1024 * 1024): boolean => {
  return file.size <= maxSizeBytes;
};

export const sanitizeFilename = (filename: string): string => {
  // Remove potentially dangerous characters and normalize filename
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

export const validateProjectQRCode = (qrCode: string): boolean => {
  // Validate QR code format
  return /^wedding_[a-zA-Z0-9_]+$/.test(qrCode) && qrCode.length <= 100;
};

export const sanitizeInput = (input: string): string => {
  // Basic XSS prevention
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

export const validateGuestUploadData = (data: {
  guestName?: string;
  guestMessage?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (data.guestName && data.guestName.length > 100) {
    errors.push('Guest name must be less than 100 characters');
  }
  
  if (data.guestMessage && data.guestMessage.length > 500) {
    errors.push('Guest message must be less than 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Define proper TypeScript interfaces for guest upload functionality
export interface ProjectByQRResponse {
  id: string;
  name: string;
  bride_name?: string;
  groom_name?: string;
  wedding_date?: string;
  location?: string;
  privacy_settings?: {
    public_qr?: boolean;
    guest_upload?: boolean;
  };
}
