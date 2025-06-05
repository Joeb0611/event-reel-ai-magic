
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
import { validateProjectQRCode, ProjectByQRResponse } from '@/utils/validation';
import { parsePrivacySettings } from '@/utils/typeConverters';

type GuestProject = Project & { qr_code: string };

const GuestUpload = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const [project, setProject] = useState<GuestProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (qrCode) {
      fetchProjectByQRCode(qrCode);
    } else {
      console.error('No QR code provided in URL');
      setLoading(false);
    }
  }, [qrCode]);

  const fetchProjectByQRCode = async (code: string) => {
    try {
      console.log('Fetching project for QR code:', code);
      
      if (!validateProjectQRCode(code)) {
        console.error('Invalid QR code format:', code);
        toast({
          title: "Invalid QR code",
          description: "The QR code format is invalid.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // First, let's try a direct query to see if the project exists
      const { data: directProject, error: directError } = await supabase
        .from('projects')
        .select('*')
        .eq('qr_code', code)
        .single();

      console.log('Direct project query result:', { directProject, directError });

      if (directError && directError.code !== 'PGRST116') {
        console.error('Direct query error:', directError);
        throw directError;
      }

      if (!directProject) {
        console.error('No project found with QR code:', code);
        toast({
          title: "Project not found",
          description: "This QR code is not valid or the project no longer exists.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if guest uploads are enabled
      const privacySettings = parsePrivacySettings(directProject.privacy_settings);
      if (!privacySettings?.guest_upload) {
        console.error('Guest uploads disabled for project:', code);
        toast({
          title: "Guest uploads disabled",
          description: "Guest uploads are not enabled for this project.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Project found and guest uploads enabled:', directProject);

      setProject({
        id: directProject.id,
        name: directProject.name || '',
        created_at: directProject.created_at || new Date().toISOString(),
        updated_at: directProject.updated_at || new Date().toISOString(),
        user_id: directProject.user_id || '',
        qr_code: code,
        description: directProject.description || '',
        bride_name: directProject.bride_name,
        groom_name: directProject.groom_name,
        wedding_date: directProject.wedding_date,
        location: directProject.location,
        privacy_settings: privacySettings,
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
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
          <p className="text-gray-600 mb-4">
            This QR code is not valid or the project is no longer available.
          </p>
          {qrCode && (
            <p className="text-sm text-gray-500">
              QR Code: {qrCode}
            </p>
          )}
        </div>
      </div>
    );
  }

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
