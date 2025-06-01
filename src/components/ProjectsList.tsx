
import { Plus, Video, Heart, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/hooks/useProjects';

interface ProjectsListProps {
  projects: Project[];
  onCreateProject: () => void;
  onCreateWeddingProject: () => void;
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectsList = ({
  projects,
  onCreateProject,
  onCreateWeddingProject,
  onSelectProject,
  onEditProject,
  onDeleteProject,
}: ProjectsListProps) => {
  return (
    <>
      {/* Create Project Buttons */}
      <div className="mb-8 text-center space-y-4">
        <Button
          onClick={onCreateWeddingProject}
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mr-4"
        >
          <Heart className="w-5 h-5 mr-2" />
          Create Wedding Project
        </Button>
        
        <Button
          onClick={onCreateProject}
          size="lg"
          variant="outline"
          className="px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Regular Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                ...project,
                createdAt: new Date(project.created_at),
                videos: [],
                editedVideoUrl: project.edited_video_url
              }}
              onClick={() => onSelectProject(project)}
              onEdit={() => onEditProject(project)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardContent>
            <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <CardTitle className="text-xl mb-2">No wedding projects yet</CardTitle>
            <CardDescription className="mb-4">
              Create your first wedding project to start collecting photos and videos from your guests via QR code.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Button
                onClick={onCreateWeddingProject}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Heart className="w-4 h-4 mr-2" />
                Create Wedding Project
              </Button>
              <Button variant="outline" onClick={onCreateProject}>
                <Video className="w-4 h-4 mr-2" />
                Create Regular Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProjectsList;
