import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProjectModal from '@/components/ProjectModal';
import WeddingProjectModal, { WeddingProjectData } from '@/components/WeddingProjectModal';
import LoadingScreen from '@/components/LoadingScreen';
import ProjectsList from '@/components/ProjectsList';
import ProjectDashboard from '@/components/ProjectDashboard';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useProjects, Project } from '@/hooks/useProjects';
import { useVideos } from '@/hooks/useVideos';
import { Heart, Menu, LogOut, Settings, User } from 'lucide-react';
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
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWeddingModalOpen, setIsWeddingModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const {
    projects,
    loadingProjects,
    createProject,
    createWeddingProject,
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
    // If we're currently viewing the deleted project, go back to project list
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(null);
    }
  };
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show welcome screen for new users (no projects)
  useEffect(() => {
    if (!loadingProjects && projects.length > 0) {
      setShowWelcome(false);
    }
  }, [projects, loadingProjects]);
  const handleCreateProject = async (name: string, description: string) => {
    await createProject(name, description);
    setIsProjectModalOpen(false);
    setShowWelcome(false);
  };
  const handleCreateWeddingProject = async (projectData: WeddingProjectData) => {
    await createWeddingProject(projectData);
    setIsWeddingModalOpen(false);
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
    setIsWeddingModalOpen(true);
  };
  if (loading || loadingProjects) {
    return <LoadingScreen />;
  }
  if (!user) {
    return null;
  }

  // Show welcome screen for new users
  if (showWelcome && projects.length === 0) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  // Show project dashboard if a project is selected
  if (selectedProject) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <ProjectDashboard project={selectedProject} projectVideos={projectVideos} onBack={() => setSelectedProject(null)} onTriggerAIEditing={triggerAIEditing} onVideosUploaded={handleVideosUploaded} onVideoDeleted={handleVideoDeleted} onDeleteVideo={deleteVideo} />
        </div>
      </div>;
  }

  // Main home page with welcome screen design
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Header with hamburger menu */}
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
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Password Reset</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
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
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent my-[7px] py-[7px]">
              MemoryWeave
            </h1>
            
            <p className="text-lg text-gray-600">
              {projects.length === 0 ? "Turn your wedding moments into cinematic memories" : `Welcome back! You have ${projects.length} project${projects.length === 1 ? '' : 's'}`}
            </p>
          </div>

          {/* Projects list if any exist */}
          {projects.length > 0 && <div className="space-y-4 max-h-60 overflow-y-auto">
              {projects.map(project => <ProjectCard key={project.id} project={project} videoCount={0} onSelect={() => setSelectedProject(project)} onEdit={() => triggerAIEditing(project)} onDelete={() => handleDeleteProject(project.id)} />)}
            </div>}

          {/* Create Project Button */}
          <div className="space-y-4">
            <Button onClick={() => setIsWeddingModalOpen(true)} size="lg" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">Create New Project</Button>
            
            <p className="text-sm text-gray-500">
              Create beautiful wedding memories in minutes
            </p>
          </div>
        </div>
      </div>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onCreateProject={handleCreateProject} />

      <WeddingProjectModal isOpen={isWeddingModalOpen} onClose={() => setIsWeddingModalOpen(false)} onCreateProject={handleCreateWeddingProject} />
    </div>;
};
export default Index;