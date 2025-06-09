
import React, { useState, useEffect, useCallback } from 'react';
import { 
  isCloudflareR2,
  isImageFile,
  isVideoFile,
  checkFileAvailability,
  MediaStatus
} from '@/utils/cloudflareHelpers';
import ThumbnailImage from './ThumbnailImage';

export interface VideoThumbnailWithLoadingProps {
  videoUrl?: string;
  filePath?: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'video' | 'square' | 'auto';
  pollInterval?: number;
  maxPollAttempts?: number;
  onVideoReady?: (isReady: boolean) => void;
}

const VideoThumbnailWithLoading = ({
  videoUrl,
  filePath,
  alt,
  className,
  size = 'md',
  aspectRatio = 'video',
  pollInterval = 3000,
  maxPollAttempts = 5,
  onVideoReady
}: VideoThumbnailWithLoadingProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [status, setStatus] = useState<MediaStatus>('loading');
  const [pollAttempts, setPollAttempts] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Determine the file URL to use
  const getFileUrl = useCallback((): string | null => {
    if (videoUrl) return videoUrl;
    if (filePath && isCloudflareR2(filePath)) {
      // Convert R2 path to public URL
      const objectKey = filePath.replace('r2://', '');
      return `https://d067de0dad23153466dc9015deb5d9df.r2.cloudflarestorage.com/memorymixer/${objectKey}`;
    }
    return null;
  }, [videoUrl, filePath]);

  // Check file availability
  const checkFile = useCallback(async (fileUrl: string) => {
    try {
      const fileStatus = await checkFileAvailability(fileUrl);
      setStatus(fileStatus);

      if (fileStatus === 'ready') {
        // For images, use the same URL as thumbnail
        if (isImageFile(alt) || (filePath && isImageFile(filePath))) {
          setThumbnailUrl(fileUrl);
        } else {
          // For videos, we don't have thumbnail generation yet
          setThumbnailUrl(undefined);
        }
        setIsReady(true);
        return true; // Stop polling
      } else if (fileStatus === 'error' || fileStatus === 'not-found') {
        setIsReady(false);
        return true; // Stop polling on error
      }
      
      setIsReady(false);
      return false; // Continue polling
    } catch (error) {
      console.error('Error checking file:', error);
      setStatus('error');
      setIsReady(false);
      return true; // Stop polling on error
    }
  }, [alt, filePath]);

  // Notify parent component when readiness changes
  useEffect(() => {
    if (onVideoReady) {
      onVideoReady(isReady);
    }
  }, [isReady, onVideoReady]);

  // Start checking for file availability
  useEffect(() => {
    const fileUrl = getFileUrl();
    if (!fileUrl) {
      setStatus('not-found');
      setIsReady(false);
      return;
    }

    // Try to check file immediately
    const immediateCheck = async () => {
      const shouldStop = await checkFile(fileUrl);
      if (shouldStop) return;

      // Start polling if file is not ready
      const pollInterval_ms = pollInterval;
      let attempts = 0;

      const poll = async () => {
        if (attempts >= maxPollAttempts) {
          setStatus('error');
          setIsReady(false);
          return;
        }

        attempts++;
        setPollAttempts(attempts);
        
        const shouldStop = await checkFile(fileUrl);
        if (!shouldStop) {
          setTimeout(poll, pollInterval_ms);
        }
      };

      setTimeout(poll, pollInterval_ms);
    };

    immediateCheck();
  }, [getFileUrl, checkFile, pollInterval, maxPollAttempts]);

  // Handle retry
  const handleRetry = useCallback(() => {
    const fileUrl = getFileUrl();
    if (fileUrl) {
      setStatus('loading');
      setPollAttempts(0);
      setIsReady(false);
      checkFile(fileUrl);
    }
  }, [getFileUrl, checkFile]);

  const fileUrl = getFileUrl();
  if (!fileUrl) {
    return (
      <ThumbnailImage
        src={undefined}
        alt={alt}
        className={className}
        size={size}
        aspectRatio={aspectRatio}
        fallbackIcon="file"
        showRetry={false}
      />
    );
  }

  const isLoading = status === 'loading' || status === 'processing';
  const showRetry = status === 'error' || status === 'not-found';

  return (
    <ThumbnailImage
      src={thumbnailUrl || (isReady ? fileUrl : undefined)}
      alt={alt}
      className={className}
      size={size}
      aspectRatio={aspectRatio}
      fallbackIcon={isVideoFile(alt) ? "video" : "image"}
      loading={isLoading}
      showRetry={showRetry}
      onRetry={handleRetry}
    />
  );
};

export default VideoThumbnailWithLoading;
