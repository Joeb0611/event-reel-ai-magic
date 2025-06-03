
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  QrCode, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Users, 
  Settings,
  Smartphone,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Project } from '@/hooks/useProjects';

interface QRCodeSectionProps {
  project: Project;
}

const QRCodeSection = ({ project }: QRCodeSectionProps) => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [guestUploadsEnabled, setGuestUploadsEnabled] = useState(
    project.privacy_settings?.guest_upload ?? true
  );

  const guestUploadUrl = `${window.location.origin}/guest/${project.qr_code || 'demo'}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(guestUploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "Guest upload link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: `${project.bride_name} & ${project.groom_name}'s Wedding`,
          text: 'Share your photos and videos with us!',
          url: guestUploadUrl,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const generateQRCodeDataURL = async (text: string, size: number = 300): Promise<string> => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=10`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handleDownloadQR = async () => {
    if (!project.qr_code) return;
    
    try {
      const qrDataURL = await generateQRCodeDataURL(guestUploadUrl, 512);
      
      const link = document.createElement('a');
      link.href = qrDataURL;
      link.download = `${project.name}-QR-Code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(qrDataURL);
      
      toast({
        title: "QR Code Downloaded",
        description: "QR code has been saved to your device",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* QR Code Display Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Guest Upload QR Code
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Let guests share photos and videos easily
              </p>
            </div>
            <Badge variant={guestUploadsEnabled ? "default" : "secondary"} className="w-fit">
              {guestUploadsEnabled ? "Active" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            {project.qr_code ? (
              <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(guestUploadUrl)}&format=png&margin=5`}
                  alt="QR Code for guest uploads"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('QR code failed to load');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR Code</p>
                  <p className="text-xs text-gray-400 mt-1">Will be generated</p>
                </div>
              </div>
            )}
            
            {/* Project Info */}
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-gray-800">
                {project.bride_name && project.groom_name 
                  ? `${project.bride_name} & ${project.groom_name}`
                  : project.name
                }
              </h3>
              {project.wedding_date && (
                <p className="text-sm text-gray-600">
                  {new Date(project.wedding_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
                disabled={!guestUploadsEnabled || !project.qr_code}
              >
                {isMobile ? (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Link
                  </>
                ) : (
                  <>
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                className="w-full"
                disabled={!guestUploadsEnabled || !project.qr_code}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </div>
            
            {/* Guest Upload URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Guest Upload Link</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <code className="text-xs font-mono text-gray-700 flex-1 break-all">
                  {guestUploadUrl}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Upload Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Guest Uploads Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Enable Guest Uploads</Label>
              <p className="text-xs text-gray-600">
                Allow guests to upload photos and videos
              </p>
            </div>
            <Switch
              checked={guestUploadsEnabled}
              onCheckedChange={setGuestUploadsEnabled}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">0</span>
              </div>
              <p className="text-xs text-gray-600">Guest Uploads</p>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Smartphone className="w-4 h-4 text-green-600" />
                <span className="text-lg font-semibold text-gray-800">0</span>
              </div>
              <p className="text-xs text-gray-600">QR Scans</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-900 text-sm">How to share with guests:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">1.</span>
                <span>Print the QR code and display it at your event</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">2.</span>
                <span>Share the upload link via text or social media</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-blue-600">3.</span>
                <span>Guests scan or click to upload their photos/videos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeSection;
