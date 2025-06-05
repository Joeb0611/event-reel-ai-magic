
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
      console.log('QR code length:', code.length);
      console.log('QR code characters:', code.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(', '));

      // Simple validation - just check if it exists and has reasonable length
      if (!code || code.length < 5) {
        console.error('QR code too short:', code);
        toast({
          title: "Invalid QR code",
          description: "The QR code format is invalid.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Querying database for QR code:', code);
      
      // Query the projects table directly
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('qr_code', code)
        .maybeSingle();

      console.log('Database query result:', { projectData, projectError });

      if (projectError) {
        console.error('Database error:', projectError);
        toast({
          title: "Database error",
          description: `Error fetching project: ${projectError.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!projectData) {
        console.error('No project found with QR code:', code);
        
        // Let's also check what QR codes exist in the database for debugging
        const { data: allQrCodes, error: qrError } = await supabase
          .from('projects')
          .select('qr_code, name')
          .not('qr_code', 'is', null);
        
        console.log('All QR codes in database:', allQrCodes);
        console.log('QR codes query error:', qrError);
        
        toast({
          title: "Project not found",
          description: "This QR code is not valid or the project no longer exists.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Project found:', projectData);

      // Check if guest uploads are enabled
      const privacySettings = parsePrivacySettings(projectData.privacy_settings);
      console.log('Privacy settings:', privacySettings);
      
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

      console.log('Setting project data...');

      setProject({
        id: projectData.id,
        name: projectData.name || '',
        created_at: projectData.created_at || new Date().toISOString(),
        updated_at: projectData.updated_at || new Date().toISOString(),
        user_id: projectData.user_id || '',
        qr_code: code,
        description: projectData.description || '',
        bride_name: projectData.bride_name,
        groom_name: projectData.groom_name,
        wedding_date: projectData.wedding_date,
        location: projectData.location,
        privacy_settings: privacySettings,
      });
      
      console.log('Project set successfully');
      
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
            <div className="text-sm text-gray-500 space-y-1">
              <p>QR Code: {qrCode}</p>
              <p>Length: {qrCode.length} characters</p>
            </div>
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
