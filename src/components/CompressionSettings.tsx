import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Settings, Zap, HardDrive, Clock } from 'lucide-react';
import { CompressionSettings as CompressionSettingsType, isCompressionSupported } from '@/utils/videoCompression';

interface CompressionSettingsProps {
  onSettingsChange: (settings: CompressionSettingsType & { enabled: boolean }) => void;
  totalFiles: number;
  totalSizeMB: number;
}

const CompressionSettings = ({ onSettingsChange, totalFiles, totalSizeMB }: CompressionSettingsProps) => {
  const [enabled, setEnabled] = useState(isCompressionSupported());
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');
  
  const compressionSupported = isCompressionSupported();

  const qualityOptions = [
    {
      value: 'high',
      label: 'High Quality',
      description: '1080p, ~80% size reduction',
      icon: <Zap className="w-4 h-4" />
    },
    {
      value: 'medium',
      label: 'Medium Quality',
      description: '720p, ~60% size reduction',
      icon: <HardDrive className="w-4 h-4" />
    },
    {
      value: 'low',
      label: 'Low Quality',
      description: '480p, ~40% size reduction',
      icon: <Clock className="w-4 h-4" />
    }
  ];

  const estimatedSavings = {
    high: 0.8,
    medium: 0.6,
    low: 0.4
  };

  const handleSettingsChange = () => {
    onSettingsChange({
      quality,
      enabled: enabled && compressionSupported,
    });
  };

  // Update settings when values change
  React.useEffect(() => {
    handleSettingsChange();
  }, [enabled, quality]);

  const estimatedNewSize = totalSizeMB * (1 - estimatedSavings[quality]);
  const estimatedSavingsMB = totalSizeMB - estimatedNewSize;

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Video Compression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!compressionSupported && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Video compression is not supported in your browser. Files will be uploaded without compression.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="compression-enabled" className="text-sm font-medium">
            Enable compression
          </Label>
          <Switch
            id="compression-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={!compressionSupported}
          />
        </div>

        {enabled && compressionSupported && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quality Level</Label>
              <RadioGroup value={quality} onValueChange={(value: 'high' | 'medium' | 'low') => setQuality(value)}>
                {qualityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="cursor-pointer">
                        <div className="flex items-center gap-2 font-medium">
                          {option.icon}
                          {option.label}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {totalFiles > 0 && (
              <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800">Estimated Savings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Original Size</p>
                    <p className="font-medium">{totalSizeMB.toFixed(1)} MB</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Compressed Size</p>
                    <p className="font-medium text-green-600">{estimatedNewSize.toFixed(1)} MB</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Size Reduction</p>
                    <p className="font-medium text-green-600">-{estimatedSavingsMB.toFixed(1)} MB</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Upload Time Saved</p>
                    <p className="font-medium text-green-600">~{Math.round(estimatedSavingsMB * 2)}s</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Compression Progress</span>
                    <span>{Math.round(estimatedSavings[quality] * 100)}%</span>
                  </div>
                  <Progress value={estimatedSavings[quality] * 100} className="h-2" />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CompressionSettings;
