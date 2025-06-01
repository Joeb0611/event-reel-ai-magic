
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Share2, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/hooks/useProjects';

interface QRCodeManagerProps {
  project: Project;
}

const QRCodeManager = ({ project }: QRCodeManagerProps) => {
  const { toast } = useToast();
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const guestUploadUrl = `${window.location.origin}/guest/${project.qr_code}`;

  const generateQRCodeDataURL = async (text: string, size: number = 256): Promise<string> => {
    // Using QR Server API for QR code generation
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(guestUploadUrl);
      toast({
        title: "Link copied!",
        description: "Guest upload link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = async () => {
    if (!project.qr_code) return;
    
    setIsGeneratingQR(true);
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
        title: "QR Code downloaded!",
        description: "QR code saved as PNG file",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${project.name} - Photo Upload`,
          text: `Upload your photos and videos from ${project.name}!`,
          url: guestUploadUrl,
        });
      } catch (error) {
        // Fallback to copying link
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!project.qr_code) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <QrCode className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
            <p className="text-yellow-800">QR code will be generated when project is created</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          Guest Upload QR Code
        </CardTitle>
        <CardDescription>
          Share this QR code with wedding guests so they can upload photos and videos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-white rounded-lg border">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(guestUploadUrl)}&format=png&margin=10`}
            alt="QR Code for guest uploads"
            className="w-48 h-48"
          />
        </div>

        {/* URL Display */}
        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Guest Upload URL:</p>
              <p className="text-sm font-mono truncate">{guestUploadUrl}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Privacy Status */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={project.privacy_settings?.public_qr ? "default" : "secondary"}
            className="text-xs"
          >
            {project.privacy_settings?.public_qr ? "Public Access" : "Private"}
          </Badge>
          <Badge 
            variant={project.privacy_settings?.guest_upload ? "default" : "secondary"}
            className="text-xs"
          >
            {project.privacy_settings?.guest_upload ? "Guest Upload Enabled" : "Upload Disabled"}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadQR}
            disabled={isGeneratingQR}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingQR ? "Generating..." : "Download PNG"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareQR}
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(guestUploadUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeManager;
