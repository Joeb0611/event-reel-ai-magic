import { useState, useEffect } from 'react';
import { Plus, Video, Calendar, Clock, Edit3, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProjectModal from '@/components/ProjectModal';
import ProjectCard from '@/components/ProjectCard';
import VideoUpload from '@/components/VideoUpload';
import VideoManager from '@/components/VideoManager';

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  edited_video_url?: string;
  user_id: string;
}

export interface VideoFile {
  id: string;
  name: string;
  file_path: string;
  size: number;
  uploaded_at: string;
  edited: boolean;
  project_id: string;
  user_id: string;
  url?: string;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectVideos, setProjectVideos] = useState<VideoFile[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectVideos(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectVideos = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Get signed URLs for the videos
      const videosWithUrls = await Promise.all(
        (data || []).map(async (video) => {
          const { data: urlData } = await supabase.storage
            .from('videos')
            .createSignedUrl(video.file_path, 3600); // 1 hour expiry
          
          return {
            ...video,
            url: urlData?.signedUrl
          };
        })
      );

      setProjectVideos(videosWithUrls);
    } catch (error) {
      console.error('Error fetching project videos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project videos",
        variant: "destructive",
      });
    }
  };

  const createProject = async (name: string, description: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name,
            description,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      setIsProjectModalOpen(false);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleVideosUploaded = (uploadedVideos: VideoFile[]) => {
    setProjectVideos([...uploadedVideos, ...projectVideos]);
    toast({
      title: "Success",
      description: `${uploadedVideos.length} video(s) uploaded successfully`,
    });
  };

  const triggerAIEditing = async (project: Project) => {
    console.log('Triggering AI editing for project:', project.name);
    
    // Simulate AI processing
    toast({
      title: "AI Processing",
      description: "Starting AI video editing...",
    });

    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('projects')
          .update({ edited_video_url: 'https://example.com/edited-video.mp4' })
          .eq('id', project.id);

        if (error) throw error;

        // Update local state
        setProjects(prev => prev.map(p => 
          p.id === project.id 
            ? { ...p, edited_video_url: 'https://example.com/edited-video.mp4' }
            : p
        ));

        if (selectedProject?.id === project.id) {
          setSelectedProject(prev => prev ? { ...prev, edited_video_url: 'https://example.com/edited-video.mp4' } : null);
        }

        toast({
          title: "Success",
          description: "AI editing completed!",
        });
      } catch (error) {
        console.error('Error updating project:', error);
        toast({
          title: "Error",
          description: "Failed to complete AI editing",
          variant: "destructive",
        });
      }
    }, 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleVideoDeleted = () => {
    if (selectedProject) {
      setSelectedProject(prev => prev ? { ...prev, edited_video_url: null } : null);
      
      // Also update the projects list
      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id 
          ? { ...p, edited_video_url: null }
          : p
      ));
    }
  };

  if (loading || loadingProjects) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with sign out */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Event Editor
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create stunning video highlights with AI-powered editing. Manage your projects and turn your memories into beautiful stories.
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="absolute top-4 right-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
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
                    project={{
                      ...project,
                      createdAt: new Date(project.created_at),
                      videos: [], // We'll load videos when project is selected
                      editedVideoUrl: project.edited_video_url
                    }}
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

            {/* Video Manager Component */}
            <VideoManager 
              project={selectedProject} 
              onVideoDeleted={handleVideoDeleted}
            />

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">{selectedProject.name}</CardTitle>
                <CardDescription className="text-lg">{selectedProject.description}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedProject.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    {projectVideos.length} videos
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedProject.edited_video_url && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-green-600" />
                      AI-Edited Highlight Reel
                    </h3>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                      <p className="text-green-700 mb-2">✨ Your edited video is ready!</p>
                      <p className="text-sm text-gray-600">URL: {selectedProject.edited_video_url}</p>
                    </div>
                  </div>
                )}

                {projectVideos.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Uploaded Videos</h3>
                      {projectVideos.length > 0 && !selectedProject.edited_video_url && (
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
                      {projectVideos.map((video) => (
                        <Card key={video.id} className="border-gray-200">
                          <CardContent className="p-4">
                            <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                              {video.url ? (
                                <video
                                  src={video.url}
                                  className="w-full h-full object-cover rounded-lg"
                                  controls
                                />
                              ) : (
                                <Video className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <p className="font-medium text-sm truncate mb-1">{video.name}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(video.uploaded_at).toLocaleTimeString()}
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
            onVideosUploaded={handleVideosUploaded}
            projectId={selectedProject.id}
            projectName={selectedProject.name}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
