
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Crown } from 'lucide-react';

interface CustomMusicUploadProps {
  onMusicUploaded: (url: string) => void;
}

const CustomMusicUpload = ({ onMusicUploaded }: CustomMusicUploadProps) => {
  return (
    <div className="space-y-3 pt-2 border-t">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Supported formats: MP3, WAV, M4A (max 10MB)</span>
      </div>
      <Button variant="outline" className="w-full">
        <Upload className="w-4 h-4 mr-2" />
        Choose Music File
      </Button>
    </div>
  );
};

export default CustomMusicUpload;
