
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Video, Users, Clock, Edit3, Star } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';

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
  const estimatedDuration = mustIncludeCount * 5; // Rough estimate: 5 seconds per item

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
                  Estimated duration: ~{estimatedDuration} seconds
                </p>
              </div>
              <Button
                onClick={() => onTriggerAIEditing(project)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Create Highlight Reel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Processing Section */}
      {project.edited_video_url ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Edit3 className="w-5 h-5" />
              Highlight Reel Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-3">
              Your wedding highlight reel has been created and is ready to download!
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="border-green-200 text-green-600">
                Preview
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : projectVideos.length > 0 ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="w-5 h-5" />
              Ready for Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-3">
              You have {projectVideos.length} media files ready for AI processing.
            </p>
            <Button
              onClick={() => onTriggerAIEditing(project)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Generate Highlight Reel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Clock className="w-5 h-5" />
              Collecting Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Share your QR code with guests to start collecting photos and videos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectStats;
