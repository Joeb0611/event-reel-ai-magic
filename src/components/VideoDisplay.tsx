
import React, { useState, useEffect } from 'react';
import { Loader, AlertTriangle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoDisplayProps {
  url?: string;
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
}

const VideoDisplay = ({
  url,
  className = "w-full h-full object-cover",
  showControls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  poster
}: VideoDisplayProps) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (url) {
      checkVideoStatus();
    } else {
      setIsLoading(false);
    }
  }, [url]);

  const checkVideoStatus = async () => {
    if (!url) return;

    setIsLoading(true);
    setHasError(false);
    setIsReady(false);

    try {
      // For Cloudflare Stream videos, check readiness
      if (url.includes('videodelivery.net') || url.includes('iframe.videodelivery.net')) {
        const videoId = url.match(/([a-f0-9]{32})/)?.[1];
        if (videoId) {
          // Check if video is ready by trying to access manifest
          const manifestUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
          const response = await fetch(manifestUrl, { method: 'HEAD' });
          
          if (response.ok) {
            setIsReady(true);
          } else {
            // Video might still be processing
            setTimeout(checkVideoStatus, 5000); // Check again in 5 seconds
          }
        } else {
          setIsReady(true);
        }
      } else {
        // For other video sources, assume ready
        setIsReady(true);
      }
    } catch (error) {
      console.error('Error checking video status:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsReady(true);
    setIsLoading(false);
    setHasError(false);
  };

  if (!url) {
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
          <p className="text-sm text-gray-600">Loading video...</p>
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
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // For Cloudflare Stream, use iframe for better compatibility
  if (url.includes('iframe.videodelivery.net')) {
    return (
      <iframe
        src={url}
        className={className}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    );
  }

  // Use regular video element for other sources
  return (
    <video
      src={url}
      className={className}
      controls={showControls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      poster={poster}
      onError={handleVideoError}
      onLoadedData={handleVideoLoad}
      preload="metadata"
    />
  );
};

export default VideoDisplay;
