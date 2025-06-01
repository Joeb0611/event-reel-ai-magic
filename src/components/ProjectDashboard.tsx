import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';
import { useIsMobile } from '@/hooks/use-mobile';
import ProjectStats from './dashboard/ProjectStats';
import MediaGallery from './dashboard/MediaGallery';
import GuestContributions from './dashboard/GuestContributions';
import QRCodeSection from './dashboard/QRCodeSection';
import EnhancedAIProcessingPanel from './EnhancedAIProcessingPanel';
import MobileNavigation from './mobile/MobileNavigation';

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
  const [activeTab, setActiveTab] = useState('overview');
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pb-20">
        {/* Mobile Header */}
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

        {/* Mobile Content */}
        <div className="p-4">
          {activeTab === 'overview' && (
            <ProjectStats
              project={project}
              projectVideos={projectVideos}
              totalContributors={uniqueContributors}
              mustIncludeCount={mustIncludeItems.size}
              onTriggerAIEditing={onTriggerAIEditing}
            />
          )}
          
          {activeTab === 'media' && (
            <MediaGallery
              projectVideos={projectVideos}
              mustIncludeItems={mustIncludeItems}
              onToggleMustInclude={toggleMustInclude}
              onVideosUploaded={onVideosUploaded}
              onDeleteVideo={onDeleteVideo}
              projectId={project.id}
              projectName={project.name}
            />
          )}
          
          {activeTab === 'guests' && (
            <GuestContributions
              guestVideos={guestVideos}
              onVideoDeleted={onVideoDeleted}
            />
          )}
          
          {activeTab === 'qr' && (
            <QRCodeSection project={project} />
          )}
          
          {activeTab === 'settings' && (
            <EnhancedAIProcessingPanel
              projectId={project.id}
              hasVideos={projectVideos.length > 0}
              onProcessingComplete={() => onTriggerAIEditing(project)}
            />
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    );
  }

  // Desktop version
  return (
    <div className="space-y-6">
      {/* Desktop Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {project.bride_name && project.groom_name 
              ? `${project.bride_name} & ${project.groom_name}'s Wedding`
              : project.name
            }
          </h1>
          {project.wedding_date && (
            <p className="text-gray-600 mt-1">
              {new Date(project.wedding_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>
      </div>

      {/* Desktop Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media Gallery</TabsTrigger>
          <TabsTrigger value="guests">Guest Contributions</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
          <TabsTrigger value="ai">AI Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectStats
            project={project}
            projectVideos={projectVideos}
            totalContributors={uniqueContributors}
            mustIncludeCount={mustIncludeItems.size}
            onTriggerAIEditing={onTriggerAIEditing}
          />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <MediaGallery
            projectVideos={projectVideos}
            mustIncludeItems={mustIncludeItems}
            onToggleMustInclude={toggleMustInclude}
            onVideosUploaded={onVideosUploaded}
            onDeleteVideo={onDeleteVideo}
            projectId={project.id}
            projectName={project.name}
          />
        </TabsContent>

        <TabsContent value="guests" className="space-y-6">
          <GuestContributions
            guestVideos={guestVideos}
            onVideoDeleted={onVideoDeleted}
          />
        </TabsContent>

        <TabsContent value="qr" className="space-y-6">
          <QRCodeSection project={project} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <EnhancedAIProcessingPanel
            projectId={project.id}
            hasVideos={projectVideos.length > 0}
            onProcessingComplete={() => onTriggerAIEditing(project)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;
