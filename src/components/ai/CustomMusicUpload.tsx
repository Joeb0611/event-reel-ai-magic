
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Crown } from 'lucide-react';

interface CustomMusicUploadProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isPremium?: boolean;
}

const CustomMusicUpload = ({ checked, onChange, isPremium = false }: CustomMusicUploadProps) => {
  const handleToggle = (newChecked: boolean) => {
    if (!isPremium && newChecked) {
      // Show paywall message or redirect to upgrade
      alert('Please upgrade to Premium to upload custom music');
      return;
    }
    onChange(newChecked);
  };

  return (
    <Card className={`border-gray-200 ${!isPremium ? 'opacity-75' : ''}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Custom Music Upload
          <Badge variant="secondary" className="ml-auto">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">Upload your own music track for the video</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch 
              checked={checked} 
              onCheckedChange={handleToggle}
              disabled={!isPremium}
            />
            <Label className="font-medium">
              Use custom music
            </Label>
          </div>
        </div>
        
        {checked && isPremium && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Supported formats: MP3, WAV, M4A (max 10MB)</span>
            </div>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Choose Music File
            </Button>
          </div>
        )}
        
        {!isPremium && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-700">
              Upgrade to Premium to upload your own music tracks
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomMusicUpload;
