
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Upload, Share2, MapPin } from 'lucide-react';
import GuestSignupOption from './GuestSignupOption';

interface GuestWelcomeProps {
  project: {
    id: string;
    name: string;
    bride_name?: string;
    groom_name?: string;
    description?: string;
    location?: string;
    wedding_date?: string;
    guest_signup_enabled?: boolean;
  };
  onStartUpload: () => void;
}

const GuestWelcome = ({ project, onStartUpload }: GuestWelcomeProps) => {
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartUpload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Welcome Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to MemoryMixer!
            </CardTitle>
            <CardDescription className="text-base">
              {project.bride_name && project.groom_name
                ? `${project.bride_name} & ${project.groom_name}'s ${project.wedding_date ? 'Wedding' : 'Event'}`
                : project.name
              }
            </CardDescription>
            {project.wedding_date && (
              <p className="text-sm text-purple-600 font-medium">
                {new Date(project.wedding_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
            {project.location && (
              <p className="text-sm text-gray-600 flex items-center justify-center mt-2">
                <MapPin className="w-4 h-4 mr-1" />
                {project.location}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {project.description && (
              <p className="text-center text-gray-600 text-sm">
                {project.description}
              </p>
            )}
            
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Share your photos and videos to help create lasting memories!
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">Upload</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Share2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Share</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">Memories</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="guest-name" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="guest-message" className="text-sm font-medium">
                  Leave a Message (Optional)
                </Label>
                <Textarea
                  id="guest-message"
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder="Share your wishes or memories..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Continue to Upload
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guest Signup Option - Only show if enabled by host */}
        {project.guest_signup_enabled && (
          <GuestSignupOption
            projectId={project.id}
            projectName={project.name}
          />
        )}
      </div>
    </div>
  );
};

export default GuestWelcome;
