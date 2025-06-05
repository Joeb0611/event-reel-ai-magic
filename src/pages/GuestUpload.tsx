
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
      console.log('=== QR CODE DEBUG ===');
      console.log('Searching for QR code:', code);
      console.log('QR code length:', code.length);
      console.log('QR code type:', typeof code);

      // First, let's see what projects exist in the database
      const { data: allProjects, error: allProjectsError } = await supabase
        .from('projects')
        .select('id, name, qr_code, privacy_settings');

      console.log('All projects in database:', allProjects);
      console.log('All projects query error:', allProjectsError);

      if (allProjects) {
        console.log('Available QR codes in database:');
        allProjects.forEach((p, index) => {
          console.log(`${index + 1}. Project "${p.name}" - QR: "${p.qr_code}" (length: ${p.qr_code?.length || 0})`);
        });
      }

      // Now search for the specific QR code
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('qr_code', code)
        .maybeSingle();

      console.log('Specific project query result:', { projectData, projectError });

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
        
        // Try to find projects without QR codes
        const { data: projectsWithoutQR } = await supabase
          .from('projects')
          .select('id, name, qr_code')
          .is('qr_code', null);
        
        console.log('Projects without QR codes:', projectsWithoutQR);
        
        toast({
          title: "Project not found",
          description: "This QR code is not valid or the project no longer exists. Check the console for debugging info.",
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
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-4">
            This QR code is not valid or the project no longer exists.
          </p>
          {qrCode && (
            <div className="text-sm text-gray-500 space-y-1 bg-gray-100 p-4 rounded-lg">
              <p><strong>QR Code:</strong> {qrCode}</p>
              <p><strong>Length:</strong> {qrCode.length} characters</p>
              <p className="text-xs mt-2 text-gray-400">
                Check the browser console for more debugging information.
              </p>
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
