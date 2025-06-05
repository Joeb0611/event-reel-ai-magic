
import { useState } from 'react';
import { ArrowLeft, Upload, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SecureGuestUpload from './SecureGuestUpload';
import { sanitizeInput } from '@/utils/security';

interface GuestProject {
  id: string;
  name: string;
  bride_name?: string;
  groom_name?: string;
  wedding_date?: string;
  location?: string;
  qr_code: string;
}

interface GuestUploadInterfaceProps {
  project: GuestProject;
  onBack: () => void;
}

const GuestUploadInterface = ({ project, onBack }: GuestUploadInterfaceProps) => {
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    if (sanitized.length <= 50) {
      setGuestName(sanitized);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    if (sanitized.length <= 200) {
      setGuestMessage(sanitized);
    }
  };

  const handleUploadComplete = () => {
    setUploadComplete(true);
    setTimeout(() => {
      setUploadComplete(false);
    }, 3000);
  };

  const displayName = guestName.trim() || 'Anonymous Guest';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onBack}
            className="bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Share Your Memories</h1>
            <p className="text-gray-600">
              {project.bride_name && project.groom_name 
                ? `${project.bride_name} & ${project.groom_name}'s Wedding`
                : project.name}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {uploadComplete && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload successful!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Thank you for sharing your memories. The couple will love seeing your photos and videos!
            </p>
          </div>
        )}

        {/* Guest Information Card */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Information (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <Input
                id="guest-name"
                type="text"
                placeholder="Enter your name (optional)"
                value={guestName}
                onChange={handleNameChange}
                maxLength={50}
                className="bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                {guestName.length}/50 characters
              </p>
            </div>
            
            <div>
              <label htmlFor="guest-message" className="block text-sm font-medium text-gray-700 mb-1">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Message to the Couple
              </label>
              <Textarea
                id="guest-message"
                placeholder="Leave a sweet message for the happy couple..."
                value={guestMessage}
                onChange={handleMessageChange}
                maxLength={200}
                rows={3}
                className="bg-white resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {guestMessage.length}/200 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Interface */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Photos & Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecureGuestUpload
              projectId={project.id}
              qrCode={project.qr_code}
              guestName={displayName}
              onUploadComplete={handleUploadComplete}
            />
          </CardContent>
        </Card>

        {/* Wedding Details */}
        {(project.wedding_date || project.location) && (
          <Card className="mt-6 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                {project.wedding_date && (
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong> {new Date(project.wedding_date).toLocaleDateString()}
                  </p>
                )}
                {project.location && (
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {project.location}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuestUploadInterface;
