
import { useState, useEffect } from 'react';
import { Heart, Calendar, MapPin, Users, Image, Video, Star, Filter, Grid, List, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectStats from '@/components/dashboard/ProjectStats';
import MediaGallery from '@/components/dashboard/MediaGallery';
import GuestContributions from '@/components/dashboard/GuestContributions';
import QRCodeSection from '@/components/dashboard/QRCodeSection';
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';
import { format } from 'date-fns';

interface ProjectDashboardProps {
  project: Project;
  projectVideos: VideoFile[];
  onBack: () => void;
  onTriggerAIEditing: (project: Project) => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  onVideoDeleted: () => void;
}

const ProjectDashboard = ({ 
  project, 
  projectVideos, 
  onBack, 
  onTriggerAIEditing, 
  onVideosUploaded,
  onVideoDeleted 
}: ProjectDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mustIncludeItems, setMustIncludeItems] = useState<Set<string>>(new Set());

  const isWeddingProject = project.bride_name && project.groom_name;
  const guestVideos = projectVideos.filter(v => v.uploaded_by_guest);
  const userVideos = projectVideos.filter(v => !v.uploaded_by_guest);
  const totalContributors = new Set(guestVideos.map(v => v.guest_name).filter(Boolean)).size;

  const getProjectStatus = () => {
    if (project.edited_video_url) return 'completed';
    if (projectVideos.length === 0) return 'collecting';
    return 'ready for processing';
  };

  const toggleMustInclude = (videoId: string) => {
    const newMustInclude = new Set(mustIncludeItems);
    if (newMustInclude.has(videoId)) {
      newMustInclude.delete(videoId);
    } else {
      newMustInclude.add(videoId);
    }
    setMustIncludeItems(newMustInclude);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Projects
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Project
          </Button>
        </div>
      </div>

      {/* Project Header */}
      <Card className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-6 h-6 text-pink-500" />
                <CardTitle className="text-3xl">
                  {isWeddingProject 
                    ? `${project.bride_name} & ${project.groom_name}`
                    : project.name
                  }
                </CardTitle>
              </div>
              
              {isWeddingProject && (
                <div className="flex items-center gap-6 text-gray-600 mb-4">
                  {project.wedding_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(project.wedding_date), 'MMMM dd, yyyy')}
                    </div>
                  )}
                  {project.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-gray-700 mb-4">{project.description}</p>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getProjectStatus() === 'completed' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {getProjectStatus()}
                </Badge>
                {mustIncludeItems.size > 0 && (
                  <Badge variant="outline">
                    <Star className="w-3 h-3 mr-1" />
                    {mustIncludeItems.size} Must Include
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media Gallery</TabsTrigger>
          <TabsTrigger value="guests">Guest Contributions</TabsTrigger>
          <TabsTrigger value="qr-code">QR Code</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectStats 
            project={project}
            projectVideos={projectVideos}
            totalContributors={totalContributors}
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
            projectId={project.id}
            projectName={project.name}
          />
        </TabsContent>

        <TabsContent value="guests" className="space-y-6">
          <GuestContributions 
            guestVideos={guestVideos}
            totalContributors={totalContributors}
          />
        </TabsContent>

        <TabsContent value="qr-code" className="space-y-6">
          {isWeddingProject && project.qr_code && (
            <QRCodeSection project={project} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;
