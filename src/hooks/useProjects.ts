
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  edited_video_url?: string;
  user_id: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

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

  const triggerAIEditing = async (project: Project) => {
    console.log('Triggering AI editing for project:', project.name);
    
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

        setProjects(prev => prev.map(p => 
          p.id === project.id 
            ? { ...p, edited_video_url: 'https://example.com/edited-video.mp4' }
            : p
        ));

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

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
  };

  return {
    projects,
    loadingProjects,
    createProject,
    triggerAIEditing,
    updateProject,
  };
};
