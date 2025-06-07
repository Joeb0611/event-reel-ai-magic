
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorageInfo {
  storageTier: string;
  expiresAt?: string;
  daysUntilExpiration?: number | null;
  isExpired?: boolean;
  isArchived?: boolean;
}

interface VideoInfoSectionProps {
  videoUrl: string;
  projectName: string;
  storageInfo?: StorageInfo;
  onUpgrade: () => void;
}

const VideoInfoSection = ({ videoUrl, projectName, storageInfo, onUpgrade }: VideoInfoSectionProps) => {
  return (
    <>
      {/* Storage Info */}
      {storageInfo && (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Storage Information:</p>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Tier:</span> {storageInfo.storageTier.charAt(0).toUpperCase() + storageInfo.storageTier.slice(1)}</p>
            {storageInfo.expiresAt && (
              <p><span className="font-medium">Expires:</span> {new Date(storageInfo.expiresAt).toLocaleDateString()}</p>
            )}
            {storageInfo.daysUntilExpiration !== null && (
              <p className={storageInfo.daysUntilExpiration <= 7 ? 'text-orange-600 font-medium' : ''}>
                <span className="font-medium">Days remaining:</span> {storageInfo.daysUntilExpiration}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Video URL Info */}
      <div className="bg-white rounded-lg p-3">
        <p className="text-sm text-gray-600 mb-2">Video URL:</p>
        <p className="text-xs font-mono bg-gray-100 p-2 rounded truncate">
          {videoUrl}
        </p>
        {videoUrl.includes('local_video_path') && (
          <p className="text-xs text-green-600 mt-1">✓ Stored in Supabase Storage</p>
        )}
        {videoUrl.includes('videodelivery.net') && (
          <p className="text-xs text-blue-600 mt-1">✓ Powered by Cloudflare Stream</p>
        )}
      </div>

      {/* Upgrade Button for Expired Storage */}
      {(storageInfo?.isExpired || storageInfo?.isArchived) && (
        <Button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Upgrade to Restore Access
        </Button>
      )}
    </>
  );
};

export default VideoInfoSection;
