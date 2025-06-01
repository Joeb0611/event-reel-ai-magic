
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Video, Users, Clock, Edit3, Star } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';
import EnhancedAIProcessingPanel from '@/components/EnhancedAIProcessingPanel';

interface ProjectStatsProps {
  project: Project;
  projectVideos: VideoFile[];
  totalContributors: number;
  mustIncludeCount: number;
  onTriggerAIEditing: (project: Project) => void;
}

const ProjectStats = ({ 
  project, 
  projectVideos, 
  totalContributors, 
  mustIncludeCount,
  onTriggerAIEditing 
}: ProjectStatsProps) => {
  const guestVideos = projectVideos.filter(v => v.uploaded_by_guest);
  const userVideos = projectVideos.filter(v => !v.uploaded_by_guest);
  const totalSize = projectVideos.reduce((sum, video) => sum + video.size, 0);

  const stats = [
    {
      title: 'Total Media',
      value: projectVideos.length.toString(),
      subtitle: `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`,
      icon: Image,
      color: 'text-blue-600'
    },
    {
      title: 'Guest Uploads',
      value: guestVideos.length.toString(),
      subtitle: 'from guests',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Your Uploads',
      value: userVideos.length.toString(),
      subtitle: 'your content',
      icon: Video,
      color: 'text-green-600'
    },
    {
      title: 'Contributors',
      value: totalContributors.toString(),
      subtitle: 'unique guests',
      icon: Users,
      color: 'text-pink-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Must Include Section */}
      {mustIncludeCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Star className="w-5 h-5" />
              Must Include Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700">
                  <strong>{mustIncludeCount}</strong> items marked as must-include
                </p>
                <p className="text-sm text-yellow-600">
                  These will be prioritized in your AI-generated highlight reel
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced AI Processing Panel */}
      <EnhancedAIProcessingPanel
        projectId={project.id}
        hasVideos={projectVideos.length > 0}
        onProcessingComplete={() => onTriggerAIEditing(project)}
      />
    </div>
  );
};

export default ProjectStats;
