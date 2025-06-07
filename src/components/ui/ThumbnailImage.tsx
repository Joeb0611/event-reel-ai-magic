
import React, { useState, useEffect } from 'react';
import { Loader, AlertTriangle, Video, FileImage, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ThumbnailImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: 'video' | 'image';
  showRetry?: boolean;
  onRetry?: () => void;
  aspectRatio?: 'video' | 'square' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const ThumbnailImage = ({
  src,
  alt,
  className,
  fallbackIcon = 'video',
  showRetry = true,
  onRetry,
  aspectRatio = 'video',
  size = 'md',
  loading = false
}: ThumbnailImageProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (src) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [src]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    setRetryCount(prev => prev + 1);
    setImageLoading(true);
    setImageError(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-20 h-12';
      case 'md':
        return 'w-32 h-20';
      case 'lg':
        return 'w-48 h-32';
      default:
        return 'w-full h-full';
    }
  };

  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-video';
      case 'square':
        return 'aspect-square';
      default:
        return '';
    }
  };

  const FallbackIcon = fallbackIcon === 'video' ? Video : FileImage;

  const isLoading = loading || imageLoading;
  const shouldShowImage = src && !imageError && !isLoading;
  const shouldShowError = imageError && !isLoading;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center',
        getAspectRatioClasses(),
        getSizeClasses(),
        className
      )}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Loader className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-1" />
            <p className="text-xs text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Image */}
      {shouldShowImage && (
        <img
          src={`${src}?retry=${retryCount}`}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {/* Error State */}
      {shouldShowError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center p-2">
            <FallbackIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-2">Preview unavailable</p>
            {showRetry && (
              <Button
                onClick={handleRetry}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {/* No Image Fallback */}
      {!src && !loading && (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <FallbackIcon className="w-8 h-8 mb-1" />
          <p className="text-xs">No preview</p>
        </div>
      )}
    </div>
  );
};

export default ThumbnailImage;
