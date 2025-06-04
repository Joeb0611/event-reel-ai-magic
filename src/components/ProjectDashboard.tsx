
import { useState } from 'react';
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';
import { useIsMobile } from '@/hooks/use-mobile';
import DesktopDashboard from './dashboard/DesktopDashboard';
import MobileDashboard from './dashboard/MobileDashboard';

interface ProjectDashboardProps {
  project: Project;
  projectVideos: VideoFile[];
  onBack: () => void;
  onTriggerAIEditing: (project: Project) => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  onVideoDeleted: () => void;
  onDeleteVideo: (videoId: string) => void;
}

const ProjectDashboard = ({
  project,
  projectVideos,
  onBack,
  onTriggerAIEditing,
  onVideosUploaded,
  onVideoDeleted,
  onDeleteVideo
}: ProjectDashboardProps) => {
  const { isMobile } = useIsMobile();
  const [mustIncludeItems, setMustIncludeItems] = useState<Set<string>>(new Set());

  const toggleMustInclude = (videoId: string) => {
    setMustIncludeItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const guestVideos = projectVideos.filter(v => v.uploaded_by_guest);
  const uniqueContributors = new Set(guestVideos.map(v => v.guest_name).filter(Boolean)).size;

  const commonProps = {
    project,
    projectVideos,
    uniqueContributors,
    mustIncludeItems,
    onBack,
    onTriggerAIEditing,
    onToggleMustInclude: toggleMustInclude,
    onVideosUploaded,
    onDeleteVideo,
    onVideoDeleted
  };

  if (isMobile) {
    return <MobileDashboard {...commonProps} />;
  }

  return <DesktopDashboard {...commonProps} />;
};

export default ProjectDashboard;
