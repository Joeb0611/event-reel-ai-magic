
import VideoUploadDialog from './VideoUploadDialog';
import { VideoFile } from '@/hooks/useVideos';

interface VideoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  projectId: string;
  projectName: string;
}

const VideoUpload = (props: VideoUploadProps) => {
  return <VideoUploadDialog {...props} />;
};

export default VideoUpload;
