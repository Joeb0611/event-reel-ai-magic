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
  bride_name?: string;
  groom_name?: string;
  wedding_date?: string;
  location?: string;
  theme?: string;
  privacy_settings?: {
    public_qr: boolean;
    guest_upload: boolean;
  };
  qr_code?: string;
}

export interface WeddingProjectData {
  name: string;
  description: string;
  brideName: string;
  groomName: string;
  weddingDate: Date | null;
  location: string;
  theme: string;
  privacySettings: {
    public_qr: boolean;
    guest_upload: boolean;
  };
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

  const generateUniqueQRCode = (): string => {
    // Generate a unique QR code using timestamp and random string
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `wedding_${timestamp}_${randomStr}`;
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure privacy_settings is properly typed
      const transformedData = (data || []).map(project => ({
        ...project,
        privacy_settings: typeof project.privacy_settings === 'object' && project.privacy_settings !== null
          ? project.privacy_settings as { public_qr: boolean; guest_upload: boolean }
          : { public_qr: true, guest_upload: true }
      }));
      
      setProjects(transformedData);
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
            qr_code: generateUniqueQRCode(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const transformedProject = {
        ...data,
        privacy_settings: typeof data.privacy_settings === 'object' && data.privacy_settings !== null
          ? data.privacy_settings as { public_qr: boolean; guest_upload: boolean }
          : { public_qr: true, guest_upload: true }
      };

      setProjects([transformedProject, ...projects]);
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

  const createWeddingProject = async (projectData: WeddingProjectData) => {
    if (!user) return;

    try {
      const qrCode = generateUniqueQRCode();
      
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: projectData.name,
            description: projectData.description,
            bride_name: projectData.brideName,
            groom_name: projectData.groomName,
            wedding_date: projectData.weddingDate?.toISOString().split('T')[0] || null,
            location: projectData.location,
            theme: projectData.theme,
            privacy_settings: projectData.privacySettings,
            qr_code: qrCode,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const transformedProject = {
        ...data,
        privacy_settings: typeof data.privacy_settings === 'object' && data.privacy_settings !== null
          ? data.privacy_settings as { public_qr: boolean; guest_upload: boolean }
          : { public_qr: true, guest_upload: true }
      };

      setProjects([transformedProject, ...projects]);
      toast({
        title: "Wedding Project Created! 💕",
        description: `${projectData.name} is ready for guest uploads`,
      });
      
      return transformedProject;
    } catch (error) {
      console.error('Error creating wedding project:', error);
      toast({
        title: "Error",
        description: "Failed to create wedding project",
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

  const deleteProject = async (projectId: string) => {
    if (!user) return;

    try {
      // First, delete all videos associated with the project
      const { data: videos } = await supabase
        .from('videos')
        .select('file_path, uploaded_by_guest')
        .eq('project_id', projectId);

      // Delete files from storage
      if (videos && videos.length > 0) {
        for (const video of videos) {
          const bucket = video.uploaded_by_guest ? 'guest-uploads' : 'videos';
          await supabase.storage
            .from(bucket)
            .remove([video.file_path]);
        }
      }

      // Delete video records
      const { error: videosError } = await supabase
        .from('videos')
        .delete()
        .eq('project_id', projectId);

      if (videosError) throw videosError;

      // Delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) throw projectError;

      // Update local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      toast({
        title: "Project Deleted",
        description: "Project and all associated media have been deleted",
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

  return {
    projects,
    loadingProjects,
    createProject,
    createWeddingProject,
    triggerAIEditing,
    updateProject,
    deleteProject,
  };
};
