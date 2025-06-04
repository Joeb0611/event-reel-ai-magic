
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';
import { useTabNavigation, TabType } from '@/hooks/useTabNavigation';
import MobileNavigation from '../mobile/MobileNavigation';
import TabContent from './TabContent';

interface MobileDashboardProps {
  project: Project;
  projectVideos: VideoFile[];
  uniqueContributors: number;
  mustIncludeItems: Set<string>;
  onBack: () => void;
  onTriggerAIEditing: (project: Project) => void;
  onToggleMustInclude: (videoId: string) => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  onDeleteVideo: (videoId: string) => void;
  onVideoDeleted: () => void;
}

const MobileDashboard = ({
  project,
  projectVideos,
  uniqueContributors,
  mustIncludeItems,
  onBack,
  onTriggerAIEditing,
  onToggleMustInclude,
  onVideosUploaded,
  onDeleteVideo,
  onVideoDeleted
}: MobileDashboardProps) => {
  const { activeTab, setActiveTab } = useTabNavigation();

  // Convert mobile tab names to match desktop
  const handleTabChange = (tab: string) => {
    const tabMap: Record<string, TabType> = {
      'overview': 'overview',
      'media': 'media',
      'guests': 'guests',
      'qr': 'qr',
      'settings': 'ai'
    };
    setActiveTab(tabMap[tab] || 'overview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">
              {project.bride_name && project.groom_name 
                ? `${project.bride_name} & ${project.groom_name}`
                : project.name
              }
            </h1>
            <p className="text-sm text-gray-600 truncate">
              {projectVideos.length} files • {uniqueContributors} contributors
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <TabContent
          activeTab={activeTab}
          project={project}
          projectVideos={projectVideos}
          uniqueContributors={uniqueContributors}
          mustIncludeItems={mustIncludeItems}
          mustIncludeCount={mustIncludeItems.size}
          onTriggerAIEditing={onTriggerAIEditing}
          onToggleMustInclude={onToggleMustInclude}
          onVideosUploaded={onVideosUploaded}
          onDeleteVideo={onDeleteVideo}
          onVideoDeleted={onVideoDeleted}
        />
      </div>

      {/* Navigation */}
      <MobileNavigation
        activeTab={activeTab === 'ai' ? 'settings' : activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default MobileDashboard;
