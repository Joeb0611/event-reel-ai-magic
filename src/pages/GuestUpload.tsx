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
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('qr_code', code)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Project not found",
          description: "This QR code is not valid or the project is no longer available.",
          variant: "destructive",
        });
        return;
      }

      // Check if guest uploads are enabled
      const privacySettings = typeof data.privacy_settings === 'object' && data.privacy_settings !== null
        ? data.privacy_settings as { public_qr: boolean; guest_upload: boolean }
        : { public_qr: true, guest_upload: true };

      if (!privacySettings.guest_upload) {
        toast({
          title: "Uploads disabled",
          description: "Guest uploads are currently disabled for this project.",
          variant: "destructive",
        });
        return;
      }

      setProject({
        ...data,
        privacy_settings: privacySettings
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
