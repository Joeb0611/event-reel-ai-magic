
import { Plus, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/hooks/useProjects';

interface ProjectsListProps {
  projects: Project[];
  onCreateProject: () => void;
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
}

const ProjectsList = ({ projects, onCreateProject, onSelectProject, onEditProject }: ProjectsListProps) => {
  return (
    <>
      {/* Create Project Button */}
      <div className="mb-8 text-center">
        <Button
          onClick={onCreateProject}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Project
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
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-xl mb-2">No projects yet</CardTitle>
            <CardDescription>
              Create your first project to start organizing your videos and generating AI-edited highlights.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProjectsList;
