
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Edit3, Play } from 'lucide-react';
import { Project } from '@/pages/Index';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: () => void;
}

const ProjectCard = ({ project, onClick, onEdit }: ProjectCardProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 line-clamp-1">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {project.description || 'No description'}
            </CardDescription>
          </div>
          {project.editedVideoUrl && (
            <div className="ml-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {project.createdAt.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            {project.videos.length} videos
          </div>
        </div>

        {project.editedVideoUrl ? (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">Highlight Reel Ready</span>
            </div>
            <p className="text-xs text-green-600">AI-edited video available</p>
          </div>
        ) : project.videos.length > 0 ? (
          <Button
            onClick={handleEditClick}
            variant="outline"
            size="sm"
            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Generate Highlight Reel
          </Button>
        ) : (
          <div className="text-center py-4">
            <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No videos uploaded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
