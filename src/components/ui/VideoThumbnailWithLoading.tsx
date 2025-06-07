
import React, { useState, useEffect, useCallback } from 'react';
import { 
  getCloudflareStreamThumbnail, 
  extractStreamId, 
  isCloudflareStream,
  checkThumbnailAvailability,
  ThumbnailStatus
} from '@/utils/cloudflareHelpers';
import ThumbnailImage from './ThumbnailImage';

export interface VideoThumbnailWithLoadingProps {
  videoUrl?: string;
  videoId?: string;
  filePath?: string;
  streamVideoId?: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'video' | 'square' | 'auto';
  pollInterval?: number;
  maxPollAttempts?: number;
}

const VideoThumbnailWithLoading = ({
  videoUrl,
  videoId,
  filePath,
  streamVideoId,
  alt,
  className,
  size = 'md',
  aspectRatio = 'video',
  pollInterval = 5000,
  maxPollAttempts = 20
}: VideoThumbnailWithLoadingProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [status, setStatus] = useState<ThumbnailStatus>('loading');
  const [pollAttempts, setPollAttempts] = useState(0);

  // Extract stream ID from various sources
  const getStreamId = useCallback((): string | null => {
    if (streamVideoId) return streamVideoId;
    if (videoId) return videoId;
    if (filePath && isCloudflareStream(filePath)) {
      return extractStreamId(filePath);
    }
    if (videoUrl && isCloudflareStream(videoUrl)) {
      return extractStreamId(videoUrl);
    }
    return null;
  }, [streamVideoId, videoId, filePath, videoUrl]);

  // Check thumbnail availability and update state
  const checkThumbnail = useCallback(async (streamId: string) => {
    try {
      const thumbnailStatus = await checkThumbnailAvailability(streamId);
      setStatus(thumbnailStatus);

      if (thumbnailStatus === 'ready') {
        const url = getCloudflareStreamThumbnail(streamId);
        setThumbnailUrl(url);
        return true; // Stop polling
      } else if (thumbnailStatus === 'error') {
        return true; // Stop polling on error
      }
      
      return false; // Continue polling
    } catch (error) {
      console.error('Error checking thumbnail:', error);
      setStatus('error');
      return true; // Stop polling on error
    }
  }, []);

  // Start polling for thumbnail
  useEffect(() => {
    const streamId = getStreamId();
    if (!streamId) {
      setStatus('not-found');
      return;
    }

    // Try to get thumbnail immediately
    const immediateCheck = async () => {
      const shouldStop = await checkThumbnail(streamId);
      if (shouldStop) return;

      // Start polling if thumbnail is not ready
      const pollInterval_ms = pollInterval;
      let attempts = 0;

      const poll = async () => {
        if (attempts >= maxPollAttempts) {
          setStatus('error');
          return;
        }

        attempts++;
        setPollAttempts(attempts);
        
        const shouldStop = await checkThumbnail(streamId);
        if (!shouldStop) {
          setTimeout(poll, pollInterval_ms);
        }
      };

      setTimeout(poll, pollInterval_ms);
    };

    immediateCheck();
  }, [getStreamId, checkThumbnail, pollInterval, maxPollAttempts]);

  // Handle retry
  const handleRetry = useCallback(() => {
    const streamId = getStreamId();
    if (streamId) {
      setStatus('loading');
      setPollAttempts(0);
      checkThumbnail(streamId);
    }
  }, [getStreamId, checkThumbnail]);

  // For non-Cloudflare videos, just use the provided URL
  const streamId = getStreamId();
  if (!streamId) {
    return (
      <ThumbnailImage
        src={videoUrl}
        alt={alt}
        className={className}
        size={size}
        aspectRatio={aspectRatio}
        fallbackIcon="video"
        showRetry={false}
      />
    );
  }

  const isLoading = status === 'loading' || status === 'processing';
  const showRetry = status === 'error' || status === 'not-found';

  return (
    <ThumbnailImage
      src={thumbnailUrl}
      alt={alt}
      className={className}
      size={size}
      aspectRatio={aspectRatio}
      fallbackIcon="video"
      loading={isLoading}
      showRetry={showRetry}
      onRetry={handleRetry}
    />
  );
};

export default VideoThumbnailWithLoading;
