
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Eye, X } from 'lucide-react';
import { useState } from 'react';

interface AdvancedSettingsProps {
  settings: {
    customInstructions: string;
    previewMode: boolean;
    excludeTimeRanges: string[];
  };
  onSettingsChange: (settings: any) => void;
}

const AdvancedSettings = ({ settings, onSettingsChange }: AdvancedSettingsProps) => {
  const [newTimeRange, setNewTimeRange] = useState('');

  const updateSetting = (key: string, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const addTimeRange = () => {
    if (newTimeRange.trim()) {
      updateSetting('excludeTimeRanges', [...settings.excludeTimeRanges, newTimeRange.trim()]);
      setNewTimeRange('');
    }
  };

  const removeTimeRange = (index: number) => {
    const updated = settings.excludeTimeRanges.filter((_, i) => i !== index);
    updateSetting('excludeTimeRanges', updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Face Recognition Training */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Face Recognition Training</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload additional photos of the couple for better face detection
              </p>
              <Button variant="outline" size="sm">
                Upload Photos
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Clear, front-facing photos help the AI better identify the couple throughout the wedding footage.
          </p>
        </div>

        {/* Exclude Time Periods */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Exclude Specific Time Periods</Label>
          <div className="space-y-2">
            {settings.excludeTimeRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm flex-1">{range}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTimeRange(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., 2:00 PM - 2:30 PM (dinner prep)"
              value={newTimeRange}
              onChange={(e) => setNewTimeRange(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded"
            />
            <Button onClick={addTimeRange} size="sm" variant="outline">
              Add
            </Button>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Custom Instructions for AI</Label>
          <Textarea
            placeholder="e.g., Focus on moments with grandparents, include the dog in shots, emphasize the outdoor ceremony..."
            value={settings.customInstructions}
            onChange={(e) => updateSetting('customInstructions', e.target.value)}
            className="min-h-[80px]"
          />
          <p className="text-xs text-gray-500">
            Provide specific guidance to help the AI understand what's most important to you.
          </p>
        </div>

        {/* Preview Mode */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-blue-900">Preview Mode</h4>
            <p className="text-xs text-blue-700">
              Show detected moments before creating the final highlight reel
            </p>
          </div>
          <Button
            variant={settings.previewMode ? "default" : "outline"}
            size="sm"
            onClick={() => updateSetting('previewMode', !settings.previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {settings.previewMode ? 'Enabled' : 'Enable'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSettings;
