import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import VideoDisplay from '@/components/VideoDisplay';
import { VideoFile } from '@/hooks/useVideos';
import { isCloudflareStream } from '@/utils/cloudflareHelpers';

interface MediaModalProps {
  selectedMedia: VideoFile | null;
  onClose: () => void;
}

const MediaModal = ({ selectedMedia, onClose }: MediaModalProps) => {
  const isVideo = (filename: string) => {
    return filename.toLowerCase().includes('.mp4') || filename.toLowerCase().includes('.mov');
  };

  return (
    <Dialog open={!!selectedMedia} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay 
          className="fixed inset-0 z-50 bg-black/80" 
          onClick={onClose}
        />
        <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <h2 className="text-lg font-semibold truncate pr-4">
              {selectedMedia?.name}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-4 bg-white min-h-[50vh]">
            {selectedMedia?.url ? (
              isVideo(selectedMedia.name) ? (
                <VideoDisplay
                  url={selectedMedia.url}
                  className="max-w-full max-h-full"
                  showControls={true}
                  autoPlay={false}
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => console.error('Image error:', e)}
                />
              )
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">📱</div>
                <p>Media preview not available</p>
              </div>
            )}
          </div>
          
          {selectedMedia && (
            <div className="px-4 py-3 border-t bg-white">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{(selectedMedia.size / (1024 * 1024)).toFixed(1)} MB</span>
                <span>{new Date(selectedMedia.uploaded_at).toLocaleString()}</span>
              </div>
              {selectedMedia.guest_name && (
                <p className="text-sm text-purple-600 mt-1">
                  From: {selectedMedia.guest_name}
                </p>
              )}
              {selectedMedia.guest_message && (
                <p className="text-sm text-gray-600 italic mt-1">
                  "{selectedMedia.guest_message}"
                </p>
              )}
            </div>
          )}
        </div>
      </DialogPortal>
    </Dialog>
  );
};

export default MediaModal;
