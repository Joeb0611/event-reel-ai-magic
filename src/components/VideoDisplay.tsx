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
  onStatusChange?: (status: 'loading' | 'ready' | 'error') => void;
}

const VideoDisplay = ({
  url,
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
    if (url) {
      checkVideoStatus();
    } else {
      setIsLoading(false);
      setStatus('error');
    }
  }, [url]);

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  const checkVideoStatus = async () => {
    if (!url) return;

    setIsLoading(true);
    setHasError(false);
    setIsReady(false);
    setStatus('loading');

    try {
      // For R2 videos, assume they're ready if URL exists
      setIsReady(true);
      setStatus('ready');
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

  const videoUrl = url;

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
