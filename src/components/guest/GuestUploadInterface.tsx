
import { useState, useCallback } from 'react';
import { ArrowLeft, Upload, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project } from '@/hooks/useProjects';
import GuestFileUpload from './GuestFileUpload';
import { useToast } from '@/hooks/use-toast';

interface GuestUploadInterfaceProps {
  project: Project;
  onBack: () => void;
}

export interface GuestUploadData {
  guestName?: string;
  guestMessage?: string;
}

const GuestUploadInterface = ({ project, onBack }: GuestUploadInterfaceProps) => {
  const { toast } = useToast();
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleUploadStart = useCallback(() => {
    setIsUploading(true);
  }, []);

  const handleUploadComplete = useCallback((count: number) => {
    setIsUploading(false);
    setUploadComplete(true);
    setUploadedCount(count);
    
    toast({
      title: "Upload successful! 🎉",
      description: `${count} file(s) uploaded successfully. Thank you for sharing!`,
    });
  }, [toast]);

  const handleUploadError = useCallback((error: string) => {
    setIsUploading(false);
    toast({
      title: "Upload failed",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  const handleUploadAnother = () => {
    setUploadComplete(false);
    setUploadedCount(0);
    setGuestName('');
    setGuestMessage('');
  };

  if (uploadComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Thank you! 🎉
            </h2>
            
            <p className="text-lg text-gray-600 mb-2">
              {uploadedCount} file(s) uploaded successfully
            </p>
            
            <p className="text-gray-500 mb-8">
              Your photos and videos will help create amazing memories!
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleUploadAnother}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload More Files
              </Button>
              
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                Back to Welcome
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-600 hover:text-gray-900"
          disabled={isUploading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Details
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest Info Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Your Info (Optional)</CardTitle>
              <CardDescription>
                Help us know who shared these memories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="guestName">Your Name</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g., Sarah & Mike"
                  disabled={isUploading}
                />
              </div>
              
              <div>
                <Label htmlFor="guestMessage">Message</Label>
                <Textarea
                  id="guestMessage"
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder="Leave a special message..."
                  rows={3}
                  disabled={isUploading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600" />
                Upload Photos & Videos
              </CardTitle>
              <CardDescription>
                Drag and drop files or click to browse. Mobile users can take photos directly!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GuestFileUpload
                project={project}
                guestData={{
                  guestName: guestName.trim() || undefined,
                  guestMessage: guestMessage.trim() || undefined,
                }}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                disabled={isUploading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuestUploadInterface;
