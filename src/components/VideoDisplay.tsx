
import React, { useState, useEffect } from 'react';
import { Loader, AlertTriangle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractStreamId, isCloudflareStream } from '@/utils/cloudflareHelpers';

interface VideoDisplayProps {
  url?: string;
  streamId?: string;
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

const VideoDisplay = ({
  url,
  streamId,
  className = "w-full h-full object-cover",
  showControls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  poster,
  onStatusChange
}: VideoDisplayProps) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (url || streamId) {
      checkVideoStatus();
    } else {
      setIsLoading(false);
      setStatus('error');
    }
  }, [url, streamId]);

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  const checkVideoStatus = async () => {
    if (!url && !streamId) return;

    setIsLoading(true);
    setHasError(false);
    setIsReady(false);
    setStatus('loading');

    try {
      let videoStreamId = streamId;
      
      // Extract stream ID if not provided directly
      if (!videoStreamId && url) {
        if (isCloudflareStream(url)) {
          videoStreamId = extractStreamId(url);
        }
      }

      if (videoStreamId && isCloudflareStream(url || `stream://${videoStreamId}`)) {
        // For Cloudflare Stream videos, try to load the video directly
        // The video element will handle the loading and error states
        const videoUrl = url || `https://videodelivery.net/${videoStreamId}/manifest/video.m3u8`;
        
        // Test if the video is accessible by creating a temporary video element
        const testVideo = document.createElement('video');
        testVideo.preload = 'metadata';
        
        const loadPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video load timeout'));
          }, 10000); // 10 second timeout
          
          testVideo.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          
          testVideo.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video load error'));
          };
        });
        
        testVideo.src = videoUrl;
        
        await loadPromise;
        setIsReady(true);
        setStatus('ready');
      } else {
        // For other video sources, assume ready
        setIsReady(true);
        setStatus('ready');
      }
    } catch (error) {
      console.error('Error checking video status:', error);
      setHasError(true);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
    setStatus('error');
  };

  const handleVideoLoad = () => {
    setIsReady(true);
    setIsLoading(false);
    setHasError(false);
    setStatus('ready');
  };

  if (!url && !streamId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
        <Video className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  if (isLoading && !isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
        <div className="text-center">
          <Loader className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Processing video...</p>
        </div>
      </div>
    );
  }

  if (hasError && !isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
        <div className="text-center">
          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Video not ready</p>
          <Button 
            onClick={checkVideoStatus} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  const videoUrl = url || (streamId ? `https://videodelivery.net/${streamId}/manifest/video.m3u8` : '');

  return (
    <video
      src={videoUrl}
      className={className}
      controls={showControls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      poster={poster}
      onError={handleVideoError}
      onLoadedData={handleVideoLoad}
      preload="metadata"
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoDisplay;
