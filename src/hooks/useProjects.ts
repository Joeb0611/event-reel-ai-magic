
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  title?: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  qr_code?: string;
  bride_name?: string;
  groom_name?: string;
  wedding_date?: string;
  location?: string;
  theme?: string;
  privacy_settings?: {
    public_qr: boolean;
    guest_upload: boolean;
  };
  edited_video_url?: string;
  budget?: number;
  guest_count?: number;
  venue?: string;
}

export interface WeddingProjectData {
  name: string;
  description: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  location: string;
  theme: string;
}

export const useProjects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const createProject = async (name: string, description: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const qrCode = `project-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name,
          title: name, // Also set title for backward compatibility
          description,
          user_id: user.data.user.id,
          qr_code: qrCode,
        }])
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      toast({
        title: "Success",
        description: "Project created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const createWeddingProject = async (projectData: WeddingProjectData) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const qrCode = `wedding-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name,
          title: projectData.name, // Also set title for backward compatibility
          description: projectData.description,
          bride_name: projectData.bride_name,
          groom_name: projectData.groom_name,
          wedding_date: projectData.wedding_date,
          location: projectData.location,
          privacy_settings: { public_qr: true, guest_upload: true },
          qr_code: qrCode,
          user_id: user.data.user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      toast({
        title: "Success",
        description: "Wedding project created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating wedding project:', error);
      toast({
        title: "Error",
        description: "Failed to create wedding project",
        variant: "destructive",
      });
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updatedProject)
        .eq('id', updatedProject.id);

      if (error) throw error;

      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const triggerAIEditing = async (project: Project) => {
    try {
      // This would trigger AI processing in a real implementation
      toast({
        title: "AI Processing Started",
        description: "Your highlight reel is being generated...",
      });
    } catch (error) {
      console.error('Error triggering AI editing:', error);
      toast({
        title: "Error",
        description: "Failed to start AI editing",
        variant: "destructive",
      });
    }
  };

  return {
    projects,
    loadingProjects,
    createProject,
    createWeddingProject,
    updateProject,
    deleteProject,
    triggerAIEditing,
  };
};
