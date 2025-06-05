
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Video, Users, Star, Play } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {project.bride_name && project.groom_name 
              ? `${project.bride_name} & ${project.groom_name}`
              : project.name
            }
          </CardTitle>
          {project.wedding_date && (
            <p className="text-gray-600">{project.wedding_date}</p>
          )}
          {project.location && (
            <p className="text-gray-500">{project.location}</p>
          )}
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Image className="w-8 h-8 text-blue-600" />
              <p className="text-2xl font-bold">{projectVideos.length}</p>
              <p className="text-sm text-gray-600">Total Files</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Users className="w-8 h-8 text-purple-600" />
              <p className="text-2xl font-bold">{guestVideos.length}</p>
              <p className="text-sm text-gray-600">Guest Uploads</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Video className="w-8 h-8 text-green-600" />
              <p className="text-2xl font-bold">{userVideos.length}</p>
              <p className="text-sm text-gray-600">Your Uploads</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Users className="w-8 h-8 text-pink-600" />
              <p className="text-2xl font-bold">{totalContributors}</p>
              <p className="text-sm text-gray-600">Contributors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Must Include Highlight */}
      {mustIncludeCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-700">
                <strong>{mustIncludeCount}</strong> items marked as must-include
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Highlight Reel Button */}
      {projectVideos.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ready to create your highlight reel?</h3>
              <Button
                onClick={() => onTriggerAIEditing(project)}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Play className="w-5 h-5 mr-2" />
                Create Highlight Reel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectStats;
