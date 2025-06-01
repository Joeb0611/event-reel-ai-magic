
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProjectModal from '@/components/ProjectModal';
import WeddingProjectModal, { WeddingProjectData } from '@/components/WeddingProjectModal';
import LoadingScreen from '@/components/LoadingScreen';
import AppHeader from '@/components/AppHeader';
import ProjectsList from '@/components/ProjectsList';
import ProjectDashboard from '@/components/ProjectDashboard';
import { useProjects, Project } from '@/hooks/useProjects';
import { useVideos } from '@/hooks/useVideos';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWeddingModalOpen, setIsWeddingModalOpen] = useState(false);

  const { 
    projects, 
    loadingProjects, 
    createProject,
    createWeddingProject, 
    triggerAIEditing,
    updateProject 
  } = useProjects();

  const { 
    projectVideos, 
    handleVideosUploaded 
  } = useVideos(selectedProject?.id || null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleCreateProject = async (name: string, description: string) => {
    await createProject(name, description);
    setIsProjectModalOpen(false);
  };

  const handleCreateWeddingProject = async (projectData: WeddingProjectData) => {
    await createWeddingProject(projectData);
    setIsWeddingModalOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleVideoDeleted = () => {
    if (selectedProject) {
      const updatedProject = { ...selectedProject, edited_video_url: null };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  };

  if (loading || loadingProjects) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <AppHeader onSignOut={handleSignOut} />

        {!selectedProject ? (
          <ProjectsList
            projects={projects}
            onCreateProject={() => setIsProjectModalOpen(true)}
            onCreateWeddingProject={() => setIsWeddingModalOpen(true)}
            onSelectProject={setSelectedProject}
            onEditProject={triggerAIEditing}
          />
        ) : (
          <ProjectDashboard
            project={selectedProject}
            projectVideos={projectVideos}
            onBack={() => setSelectedProject(null)}
            onTriggerAIEditing={triggerAIEditing}
            onVideosUploaded={handleVideosUploaded}
            onVideoDeleted={handleVideoDeleted}
          />
        )}

        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onCreateProject={handleCreateProject}
        />

        <WeddingProjectModal
          isOpen={isWeddingModalOpen}
          onClose={() => setIsWeddingModalOpen(false)}
          onCreateProject={handleCreateWeddingProject}
        />
      </div>
    </div>
  );
};

export default Index;
