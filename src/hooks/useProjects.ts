import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parsePrivacySettings, stringifyPrivacySettings, PrivacySettings } from '@/utils/typeConverters';

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
  privacy_settings?: PrivacySettings;
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
      console.log('Fetching projects...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Projects fetch result:', { data, error });

      if (error) throw error;
      
      // Convert database response to Project type
      const convertedProjects: Project[] = (data || []).map(project => ({
        ...project,
        privacy_settings: parsePrivacySettings(project.privacy_settings),
      }));
      
      console.log('Converted projects:', convertedProjects);
      setProjects(convertedProjects);
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
      console.log('Creating project...', { name, description });
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Auth error:', userError);
        throw new Error('Not authenticated');
      }

      console.log('Authenticated user:', user.id);

      const qrCode = `project-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      console.log('Generated QR code:', qrCode);
      
      const projectData = {
        name,
        title: name,
        description,
        user_id: user.id,
        qr_code: qrCode,
        privacy_settings: stringifyPrivacySettings({ public_qr: true, guest_upload: true }),
      };

      console.log('Inserting project data:', projectData);

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      console.log('Project insert result:', { data, error });

      if (error) throw error;

      const newProject: Project = {
        ...data,
        privacy_settings: parsePrivacySettings(data.privacy_settings),
      };

      console.log('Created project:', newProject);
      setProjects([newProject, ...projects]);
      toast({
        title: "Success",
        description: "Project created successfully",
      });

      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const createWeddingProject = async (projectData: WeddingProjectData) => {
    try {
      console.log('Creating wedding project...', projectData);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Auth error:', userError);
        throw new Error('Not authenticated');
      }

      console.log('Authenticated user:', user.id);

      const qrCode = `wedding-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      console.log('Generated wedding QR code:', qrCode);
      
      const insertData = {
        name: projectData.name,
        title: projectData.name,
        description: projectData.description,
        bride_name: projectData.bride_name,
        groom_name: projectData.groom_name,
        wedding_date: projectData.wedding_date,
        location: projectData.location,
        privacy_settings: stringifyPrivacySettings({ public_qr: true, guest_upload: true }),
        qr_code: qrCode,
        user_id: user.id,
      };

      console.log('Inserting wedding project data:', insertData);

      const { data, error } = await supabase
        .from('projects')
        .insert([insertData])
        .select()
        .single();

      console.log('Wedding project insert result:', { data, error });

      if (error) throw error;

      const newProject: Project = {
        ...data,
        privacy_settings: parsePrivacySettings(data.privacy_settings),
      };

      console.log('Created wedding project:', newProject);
      setProjects([newProject, ...projects]);
      toast({
        title: "Success",
        description: "Wedding project created successfully",
      });

      return newProject;
    } catch (error) {
      console.error('Error creating wedding project:', error);
      toast({
        title: "Error",
        description: `Failed to create wedding project: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      const updateData = {
        ...updatedProject,
        privacy_settings: updatedProject.privacy_settings ? 
          stringifyPrivacySettings(updatedProject.privacy_settings) : 
          undefined,
      };

      const { error } = await supabase
        .from('projects')
        .update(updateData)
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
