
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/hooks/useProjects';
import { GuestUploadData } from '@/components/guest/GuestUploadInterface';
import MobileFileUpload from './MobileFileUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

interface MobileGuestUploadProps {
  project: Project;
  onBack: () => void;
}

const MobileGuestUpload = ({ project, onBack }: MobileGuestUploadProps) => {
  const { toast } = useToast();
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${project.bride_name} & ${project.groom_name}'s Wedding`,
        text: 'Share your photos and videos with us!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this link with other guests",
      });
    }
  };

  const uploadFiles = async (files: File[]) => {
    const guestData: GuestUploadData = {
      guestName: guestName.trim() || undefined,
      guestMessage: guestMessage.trim() || undefined,
    };

    let successCount = 0;

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        const fileName = `guest-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${project.id}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('guest-uploads')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create video record
        const { error: dbError } = await supabase
          .from('videos')
          .insert({
            name: file.name,
            file_path: filePath,
            size: file.size,
            project_id: project.id,
            user_id: '00000000-0000-0000-0000-000000000000',
            uploaded_by_guest: true,
            guest_name: guestData.guestName,
            guest_message: guestData.guestMessage,
          });

        if (dbError) throw dbError;
        successCount++;
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    if (successCount > 0) {
      setUploadedCount(successCount);
      setUploadComplete(true);
      
      // Trigger celebration confetti
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#ff69b4', '#ba55d3', '#dda0dd', '#ffc0cb', '#ff1493']
      });
    } else {
      throw new Error('All uploads failed');
    }
  };

  const handleUploadAnother = () => {
    setUploadComplete(false);
    setUploadedCount(0);
    setGuestName('');
    setGuestMessage('');
  };

  if (uploadComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4"
      >
        <div className="max-w-md mx-auto pt-8">
          <Card className="text-center bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Thank you! 🎉
                </h2>
                
                <p className="text-lg text-gray-600 mb-2">
                  {uploadedCount} file(s) uploaded successfully
                </p>
                
                <p className="text-gray-500 mb-8">
                  Your photos and videos will help create amazing memories!
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleUploadAnother}
                  size="lg"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Upload More Files
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share with Others
                </Button>
                
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Welcome
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-pink-200 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h1 className="font-semibold text-gray-800">
              {project.bride_name} & {project.groom_name}
            </h1>
            <Badge variant="secondary" className="text-xs">
              Upload Photos & Videos
            </Badge>
          </div>
          
          <Button
            onClick={handleShare}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Guest Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
            <CardContent className="p-4 space-y-4">
              <div className="text-center mb-4">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <h2 className="font-semibold text-gray-800">Your Info (Optional)</h2>
                <p className="text-sm text-gray-600">Help us know who shared these memories</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="guestName" className="text-sm font-medium">Your Name</Label>
                  <Input
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g., Sarah & Mike"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="guestMessage" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="guestMessage"
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    placeholder="Leave a special message..."
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h2 className="font-semibold text-gray-800">Upload Media</h2>
                <p className="text-sm text-gray-600">
                  Share your photos and videos with the couple!
                </p>
              </div>
              
              <MobileFileUpload onUpload={uploadFiles} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-gray-500 space-y-1"
        >
          <p>💡 Tip: Use the camera button for instant photos!</p>
          <p>📱 Your uploads help create the perfect highlight reel</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MobileGuestUpload;
