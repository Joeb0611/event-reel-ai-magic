
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';
import { TabType } from '@/hooks/useTabNavigation';
import ProjectStats from './ProjectStats';
import MediaGallery from './MediaGallery';
import GuestContributions from './GuestContributions';
import QRCodeSection from './QRCodeSection';
import EnhancedAIProcessingPanel from '../EnhancedAIProcessingPanel';

interface TabContentProps {
  activeTab: TabType;
  project: Project;
  projectVideos: VideoFile[];
  uniqueContributors: number;
  mustIncludeItems: Set<string>;
  mustIncludeCount: number;
  onTriggerAIEditing: (project: Project) => void;
  onToggleMustInclude: (videoId: string) => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  onDeleteVideo: (videoId: string) => void;
  onVideoDeleted: () => void;
}

const TabContent = ({
  activeTab,
  project,
  projectVideos,
  uniqueContributors,
  mustIncludeItems,
  mustIncludeCount,
  onTriggerAIEditing,
  onToggleMustInclude,
  onVideosUploaded,
  onDeleteVideo,
  onVideoDeleted
}: TabContentProps) => {
  const guestVideos = projectVideos.filter(v => v.uploaded_by_guest);

  switch (activeTab) {
    case 'overview':
      return (
        <ProjectStats
          project={project}
          projectVideos={projectVideos}
          totalContributors={uniqueContributors}
          mustIncludeCount={mustIncludeCount}
          onTriggerAIEditing={onTriggerAIEditing}
        />
      );
    
    case 'media':
      return (
        <MediaGallery
          projectVideos={projectVideos}
          mustIncludeItems={mustIncludeItems}
          onToggleMustInclude={onToggleMustInclude}
          onVideosUploaded={onVideosUploaded}
          onDeleteVideo={onDeleteVideo}
          projectId={project.id}
          projectName={project.name}
        />
      );
    
    case 'guests':
      return (
        <GuestContributions
          guestVideos={guestVideos}
          onVideoDeleted={onVideoDeleted}
        />
      );
    
    case 'qr':
      return <QRCodeSection project={project} />;
    
    case 'ai':
    case 'settings':
      return (
        <EnhancedAIProcessingPanel
          projectId={project.id}
          hasVideos={projectVideos.length > 0}
          mustIncludeCount={mustIncludeCount}
          onProcessingComplete={() => onTriggerAIEditing(project)}
        />
      );
    
    default:
      return null;
  }
};

export default TabContent;
