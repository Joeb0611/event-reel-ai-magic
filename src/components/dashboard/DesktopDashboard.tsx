
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';
import TabContent from './TabContent';

interface DesktopDashboardProps {
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

const DesktopDashboard = ({
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
}: DesktopDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media Gallery</TabsTrigger>
          <TabsTrigger value="guests">Guest Contributions</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
          <TabsTrigger value="ai">AI Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TabContent
            activeTab="overview"
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
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <TabContent
            activeTab="media"
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
        </TabsContent>

        <TabsContent value="guests" className="space-y-6">
          <TabContent
            activeTab="guests"
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
        </TabsContent>

        <TabsContent value="qr" className="space-y-6">
          <TabContent
            activeTab="qr"
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
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <TabContent
            activeTab="ai"
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesktopDashboard;
