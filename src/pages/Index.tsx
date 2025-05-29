
import { useState } from 'react';
import { Plus, Video, Calendar, Clock, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectModal from '@/components/ProjectModal';
import ProjectCard from '@/components/ProjectCard';
import VideoUpload from '@/components/VideoUpload';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  videos: VideoFile[];
  editedVideoUrl?: string;
}

export interface VideoFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
  edited: boolean;
  projectId: string;
}

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  const createProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date(),
      videos: [],
    };
    setProjects([newProject, ...projects]);
    setIsProjectModalOpen(false);
  };

  const handleVideosUploaded = (files: File[], projectId: string) => {
    const newVideos: VideoFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedAt: new Date(),
      edited: false,
      projectId,
    }));

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, videos: [...project.videos, ...newVideos] }
        : project
    ));
  };

  const triggerAIEditing = (project: Project) => {
    // Placeholder for AI video editing integration
    console.log('Triggering AI editing for project:', project.name);
    console.log('Video URLs:', project.videos.map(v => v.url));
    
    // Simulate AI processing
    setTimeout(() => {
      setProjects(prev => prev.map(p => 
        p.id === project.id 
          ? { ...p, editedVideoUrl: 'https://example.com/edited-video.mp4' }
          : p
      ));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Video Editor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create stunning video highlights with AI-powered editing. Manage your projects and turn your memories into beautiful stories.
          </p>
        </div>

        {!selectedProject ? (
          <>
            {/* Create Project Button */}
            <div className="mb-8 text-center">
              <Button
                onClick={() => setIsProjectModalOpen(true)}
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
                    project={project}
                    onClick={() => setSelectedProject(project)}
                    onEdit={() => triggerAIEditing(project)}
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
        ) : (
          /* Project Detail View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedProject(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Projects
              </Button>
              <Button
                onClick={() => setShowVideoUpload(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Videos
              </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">{selectedProject.name}</CardTitle>
                <CardDescription className="text-lg">{selectedProject.description}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedProject.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    {selectedProject.videos.length} videos
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedProject.editedVideoUrl && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-green-600" />
                      AI-Edited Highlight Reel
                    </h3>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                      <p className="text-green-700 mb-2">✨ Your edited video is ready!</p>
                      <p className="text-sm text-gray-600">URL: {selectedProject.editedVideoUrl}</p>
                    </div>
                  </div>
                )}

                {selectedProject.videos.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Uploaded Videos</h3>
                      {selectedProject.videos.length > 0 && !selectedProject.editedVideoUrl && (
                        <Button
                          onClick={() => triggerAIEditing(selectedProject)}
                          variant="outline"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Generate Highlight Reel
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedProject.videos.map((video) => (
                        <Card key={video.id} className="border-gray-200">
                          <CardContent className="p-4">
                            <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="font-medium text-sm truncate mb-1">{video.name}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {video.uploadedAt.toLocaleTimeString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No videos uploaded yet</p>
                    <Button
                      onClick={() => setShowVideoUpload(true)}
                      variant="outline"
                    >
                      Upload Your First Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modals */}
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onCreateProject={createProject}
        />

        {showVideoUpload && selectedProject && (
          <VideoUpload
            isOpen={showVideoUpload}
            onClose={() => setShowVideoUpload(false)}
            onVideosUploaded={(files) => handleVideosUploaded(files, selectedProject.id)}
            projectName={selectedProject.name}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
