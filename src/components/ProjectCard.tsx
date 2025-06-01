
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Edit3, Heart, MapPin, QrCode, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  videos: any[];
  editedVideoUrl?: string;
  bride_name?: string;
  groom_name?: string;
  wedding_date?: string;
  location?: string;
  theme?: string;
  privacy_settings?: {
    public_qr: boolean;
    guest_upload: boolean;
  };
  qr_code?: string;
}

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

  const isWeddingProject = project.bride_name && project.groom_name;

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isWeddingProject && <Heart className="w-4 h-4 text-pink-500" />}
              <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
            </div>
            
            {isWeddingProject && (
              <div className="space-y-1 mb-2">
                {project.wedding_date && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(project.wedding_date), 'MMM dd, yyyy')}
                  </div>
                )}
                {project.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </div>
                )}
                {project.theme && (
                  <Badge variant="secondary" className="text-xs">
                    {project.theme}
                  </Badge>
                )}
              </div>
            )}
            
            <CardDescription className="line-clamp-2 text-sm">
              {project.description || 'No description'}
            </CardDescription>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {project.editedVideoUrl && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
            {project.qr_code && (
              <QrCode className="w-4 h-4 text-blue-500" />
            )}
          </div>
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

        {/* QR Code Status for Wedding Projects */}
        {isWeddingProject && project.qr_code && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-medium">Guest Upload Ready</span>
            </div>
            <div className="flex items-center gap-2">
              {project.privacy_settings?.public_qr && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Public Access
                </Badge>
              )}
              {project.privacy_settings?.guest_upload && (
                <Badge variant="outline" className="text-xs">
                  Upload Enabled
                </Badge>
              )}
            </div>
          </div>
        )}

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
            <p className="text-xs text-gray-400">
              {isWeddingProject ? "Waiting for guest uploads" : "No videos uploaded"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
