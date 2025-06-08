
import { useState, useEffect } from 'react';
import { useVideoFetching } from './video/useVideoFetching';
import { useVideoDeletion } from './video/useVideoDeletion';
import { useVideoUploadHandling } from './video/useVideoUploadHandling';
import { VideoFile } from './video/types';

export { VideoFile } from './video/types';

export const useVideos = (projectId: string | null) => {
  const [projectVideos, setProjectVideos] = useState<VideoFile[]>([]);
  const { fetchProjectVideos } = useVideoFetching();
  const { deleteVideo: deleteVideoFromDB } = useVideoDeletion();
  const { handleVideosUploaded: handleUpload } = useVideoUploadHandling();

  useEffect(() => {
    if (projectId) {
      fetchProjectVideos(projectId).then(setProjectVideos);
    }
  }, [projectId]);

  const deleteVideo = async (videoId: string) => {
    const success = await deleteVideoFromDB(videoId);
    if (success) {
      setProjectVideos(prev => prev.filter(v => v.id !== videoId));
    }
  };

  const handleVideosUploaded = (uploadedVideos: VideoFile[]) => {
    handleUpload(uploadedVideos, (videos) => {
      setProjectVideos(prev => [...videos, ...prev]);
    });
  };

  return {
    projectVideos,
    handleVideosUploaded,
    deleteVideo,
  };
};
