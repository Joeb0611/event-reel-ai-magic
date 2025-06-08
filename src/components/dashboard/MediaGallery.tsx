
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import VideoUpload from '@/components/VideoUpload';
import { VideoFile } from '@/hooks/useVideos';
import { useIsMobile } from '@/hooks/use-mobile';
import { isCloudflareStream } from '@/utils/cloudflareHelpers';
import MediaGalleryControls from './MediaGalleryControls';
import MediaGridItem from './MediaGridItem';
import MediaListItem from './MediaListItem';
import MediaModal from './MediaModal';
import EmptyMediaState from './EmptyMediaState';

interface MediaGalleryProps {
  projectVideos: VideoFile[];
  mustIncludeItems: Set<string>;
  onToggleMustInclude: (videoId: string) => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  onDeleteVideo: (videoId: string) => void;
  projectId: string;
  projectName: string;
}

const MediaGallery = ({ 
  projectVideos, 
  mustIncludeItems, 
  onToggleMustInclude,
  onVideosUploaded,
  onDeleteVideo,
  projectId,
  projectName 
}: MediaGalleryProps) => {
  const { isMobile } = useIsMobile();
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobile ? 'list' : 'grid');
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<VideoFile | null>(null);
  const [videoReadyStates, setVideoReadyStates] = useState<Map<string, boolean>>(new Map());

  const filteredVideos = projectVideos.filter(video => {
    switch (filter) {
      case 'couple': return !video.uploaded_by_guest;
      case 'guest': return video.uploaded_by_guest;
      case 'photos': return video.name.toLowerCase().includes('.jpg') || 
                           video.name.toLowerCase().includes('.png') || 
                           video.name.toLowerCase().includes('.jpeg');
      case 'videos': return video.name.toLowerCase().includes('.mp4') || 
                           video.name.toLowerCase().includes('.mov');
      case 'must-include': return mustIncludeItems.has(video.id);
      default: return true;
    }
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'size': return b.size - a.size;
      case 'guest': return (a.guest_name || '').localeCompare(b.guest_name || '');
      default: return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    }
  });

  const handleDeleteVideo = () => {
    if (deleteVideoId) {
      onDeleteVideo(deleteVideoId);
      setDeleteVideoId(null);
    }
  };

  const handleAddMediaClick = () => {
    setShowVideoUpload(true);
  };

  const handleMediaClick = (media: VideoFile) => {
    // For Cloudflare videos, only allow preview if video is ready
    const isCloudflareVideo = isCloudflareStream(media.file_path || '') || media.stream_video_id;
    const isVideoReady = videoReadyStates.get(media.id) || false;
    
    if (!isCloudflareVideo || isVideoReady) {
      setSelectedMedia(media);
    }
  };

  const handleVideoReadyChange = (mediaId: string, isReady: boolean) => {
    setVideoReadyStates(prev => new Map(prev.set(mediaId, isReady)));
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  return (
    <div className="space-y-3">
      <MediaGalleryControls
        videoCount={filteredVideos.length}
        filter={filter}
        sortBy={sortBy}
        viewMode={viewMode}
        onFilterChange={setFilter}
        onSortChange={setSortBy}
        onViewModeChange={setViewMode}
        onAddMediaClick={handleAddMediaClick}
      />

      {sortedVideos.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
            : 'space-y-2'
        }>
          {sortedVideos.map((video) => {
            const isCloudflareVideo = isCloudflareStream(video.file_path || '') || video.stream_video_id;
            const isVideoReady = videoReadyStates.get(video.id) || false;
            const canPreview = !isCloudflareVideo || isVideoReady;
            const mustInclude = mustIncludeItems.has(video.id);
            
            const commonProps = {
              video,
              mustInclude,
              canPreview,
              onToggleMustInclude,
              onDeleteVideo: setDeleteVideoId,
              onMediaClick: handleMediaClick,
              onVideoReady: handleVideoReadyChange
            };

            return viewMode === 'grid' ? (
              <MediaGridItem key={video.id} {...commonProps} />
            ) : (
              <MediaListItem key={video.id} {...commonProps} />
            );
          })}
        </div>
      ) : (
        <EmptyMediaState
          filter={filter}
          onShowVideoUpload={() => setShowVideoUpload(true)}
        />
      )}

      <MediaModal
        selectedMedia={selectedMedia}
        onClose={handleCloseModal}
      />

      {showVideoUpload && (
        <VideoUpload
          isOpen={showVideoUpload}
          onClose={() => setShowVideoUpload(false)}
          onVideosUploaded={onVideosUploaded}
          projectId={projectId}
          projectName={projectName}
        />
      )}

      <AlertDialog open={!!deleteVideoId} onOpenChange={() => setDeleteVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteVideo}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MediaGallery;
