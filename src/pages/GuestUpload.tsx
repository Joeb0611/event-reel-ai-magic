
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/hooks/useProjects';
import GuestWelcome from '@/components/guest/GuestWelcome';
import GuestUploadInterface from '@/components/guest/GuestUploadInterface';
import MobileGuestUpload from '@/components/mobile/MobileGuestUpload';
import LoadingScreen from '@/components/LoadingScreen';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { validateProjectQRCode } from '@/utils/validation';

const GuestUpload = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (qrCode) {
      fetchProjectByQRCode(qrCode);
    }
  }, [qrCode]);

  const fetchProjectByQRCode = async (code: string) => {
    try {
      // Validate QR code format first
      if (!validateProjectQRCode(code)) {
        toast({
          title: "Invalid QR code",
          description: "The QR code format is invalid.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Use the secure function to get project data
      const { data, error } = await supabase.rpc('get_project_by_qr', {
        qr_code_param: code
      });

      if (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Project not found",
          description: "This QR code is not valid or the project is no longer available.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Project not found",
          description: "This QR code is not valid or guest uploads are disabled.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const projectData = data[0];
      setProject({
        ...projectData,
        created_at: new Date().toISOString(), // Set a default created_at
        user_id: '', // Not needed for guest access
        qr_code: code,
        description: projectData.name || '', // Use name as description if missing
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
          <p className="text-gray-600">This QR code is not valid or the project is no longer available.</p>
        </div>
      </div>
    );
  }

  // Use mobile-optimized interface for mobile devices
  if (isMobile) {
    return !showUpload ? (
      <GuestWelcome 
        project={project} 
        onStartUpload={() => setShowUpload(true)} 
      />
    ) : (
      <MobileGuestUpload 
        project={project} 
        onBack={() => setShowUpload(false)} 
      />
    );
  }

  // Use desktop interface for larger screens
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {!showUpload ? (
        <GuestWelcome 
          project={project} 
          onStartUpload={() => setShowUpload(true)} 
        />
      ) : (
        <GuestUploadInterface 
          project={project} 
          onBack={() => setShowUpload(false)} 
        />
      )}
    </div>
  );
};

export default GuestUpload;
