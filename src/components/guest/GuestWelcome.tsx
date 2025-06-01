
import { Heart, Calendar, MapPin, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/hooks/useProjects';
import { format } from 'date-fns';

interface GuestWelcomeProps {
  project: Project;
  onStartUpload: () => void;
}

const GuestWelcome = ({ project, onStartUpload }: GuestWelcomeProps) => {
  const isWeddingProject = project.bride_name && project.groom_name;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {isWeddingProject 
            ? `${project.bride_name} & ${project.groom_name}'s Wedding`
            : project.name
          }
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          Share your photos and videos with us! 📸✨
        </p>
        
        <p className="text-gray-500">
          Help us capture every special moment by uploading your photos and videos.
        </p>
      </div>

      <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.wedding_date && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Date:</span>
              <span>{format(new Date(project.wedding_date), 'MMMM dd, yyyy')}</span>
            </div>
          )}
          
          {project.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-500" />
              <span className="font-medium">Location:</span>
              <span>{project.location}</span>
            </div>
          )}
          
          {project.theme && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {project.theme}
              </Badge>
            </div>
          )}
          
          {project.description && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-gray-700">{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button
          onClick={onStartUpload}
          size="lg"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Camera className="w-6 h-6 mr-3" />
          Start Uploading Photos & Videos
        </Button>
        
        <div className="text-center text-sm text-gray-500">
          <p>• No account required • Upload multiple files at once •</p>
          <p>• Supported formats: JPG, PNG, MP4, MOV, HEIC •</p>
        </div>
      </div>
    </div>
  );
};

export default GuestWelcome;
