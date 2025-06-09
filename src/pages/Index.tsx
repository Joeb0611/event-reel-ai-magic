
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventProjectModal, { EventProjectData } from '@/components/EventProjectModal';
import LoadingScreen from '@/components/LoadingScreen';
import ProjectDashboard from '@/components/ProjectDashboard';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useProjects, Project } from '@/hooks/useProjects';
import { useVideos } from '@/hooks/useVideos';
import { Heart, Menu, LogOut, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ProjectCard from '@/components/ProjectCard';

const Index = () => {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const {
    projects,
    loadingProjects,
    createEventProject,
    triggerAIEditing,
    updateProject,
    deleteProject
  } = useProjects();
  const {
    projectVideos,
    handleVideosUploaded,
    deleteVideo
  } = useVideos(selectedProject?.id || null);
  
  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(null);
    }
  };
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loadingProjects && projects.length > 0) {
      setShowWelcome(false);
    }
  }, [projects, loadingProjects]);

  const handleCreateEventProject = async (projectData: EventProjectData) => {
    await createEventProject(projectData);
    setIsEventModalOpen(false);
    setShowWelcome(false);
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleVideoDeleted = () => {
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        edited_video_url: null
      };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  };
  
  const handleGetStarted = () => {
    setShowWelcome(false);
    setIsEventModalOpen(true);
  };
  
  if (loading || loadingProjects) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return null;
  }

  if (showWelcome && projects.length === 0) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  if (selectedProject) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <ProjectDashboard project={selectedProject} projectVideos={projectVideos} onBack={() => setSelectedProject(null)} onTriggerAIEditing={triggerAIEditing} onVideosUploaded={handleVideosUploaded} onVideoDeleted={handleVideoDeleted} onDeleteVideo={deleteVideo} />
        </div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/account-settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/subscription')}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Subscription</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent my-[7px] py-[7px]">
              MemoryMixer
            </h1>
            
            <p className="text-lg text-gray-600">
              {projects.length === 0 ? "Easily collect and share photos from your special moments" : `Welcome back! You have ${projects.length} project${projects.length === 1 ? '' : 's'}`}
            </p>
          </div>

          {projects.length > 0 && (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  videoCount={0}
                  onSelect={() => setSelectedProject(project)}
                  onEdit={() => triggerAIEditing(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={() => setIsEventModalOpen(true)}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create New Event
            </Button>
            
            <p className="text-sm text-gray-500">
              Share photos and memories with your guests
            </p>
          </div>
        </div>
      </div>

      <EventProjectModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onCreateProject={handleCreateEventProject}
      />
    </div>
  );
};

export default Index;
