
import React from 'react';
import { Download, Trash2, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorageInfo {
  isExpired?: boolean;
  isArchived?: boolean;
}

interface VideoActionsSectionProps {
  videoReady: boolean;
  storageInfo?: StorageInfo;
  copied: boolean;
  isDeleting: boolean;
  onExport: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const VideoActionsSection = ({
  videoReady,
  storageInfo,
  copied,
  isDeleting,
  onExport,
  onShare,
  onDelete
}: VideoActionsSectionProps) => {
  const isDisabled = storageInfo?.isExpired || storageInfo?.isArchived || !videoReady;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={onExport}
        variant="outline"
        size="sm"
        className="flex-1 min-w-[120px] border-blue-200 text-blue-600 hover:bg-blue-50"
        disabled={isDisabled}
      >
        <Download className="w-4 h-4 mr-2" />
        {videoReady ? 'Export' : 'Processing...'}
      </Button>
      
      <Button
        onClick={onShare}
        variant="outline"
        size="sm"
        className="flex-1 min-w-[120px] border-purple-200 text-purple-600 hover:bg-purple-50"
        disabled={isDisabled}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </>
        )}
      </Button>
      
      <Button
        onClick={onDelete}
        disabled={isDeleting}
        variant="outline"
        size="sm"
        className="flex-1 min-w-[120px] border-red-200 text-red-600 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  );
};

export default VideoActionsSection;
