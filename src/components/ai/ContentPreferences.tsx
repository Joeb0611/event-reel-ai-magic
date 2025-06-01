
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Star, Users, Heart, Camera, Music } from 'lucide-react';

interface ContentPreferencesProps {
  preferences: {
    includeMustTagged: boolean;
    guestContentRatio: number;
    prioritizeEmotional: boolean;
    includeGuestPerspective: boolean;
    musicPreference: string;
    highlightLength: string;
    focusPreference: string;
  };
  onPreferencesChange: (preferences: any) => void;
}

const ContentPreferences = ({ preferences, onPreferencesChange }: ContentPreferencesProps) => {
  const updatePreference = (key: string, value: any) => {
    onPreferencesChange({ ...preferences, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Content Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Highlight Reel Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Highlight Reel Length</Label>
              <Select value={preferences.highlightLength} onValueChange={(value) => updatePreference('highlightLength', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Minute</SelectItem>
                  <SelectItem value="2">2 Minutes</SelectItem>
                  <SelectItem value="3">3 Minutes</SelectItem>
                  <SelectItem value="5">5 Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Focus Preference</Label>
              <Select value={preferences.focusPreference} onValueChange={(value) => updatePreference('focusPreference', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceremony">Ceremony-focused</SelectItem>
                  <SelectItem value="reception">Reception-focused</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="emotional">Emotional moments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mustTagged"
              checked={preferences.includeMustTagged}
              onCheckedChange={(checked) => updatePreference('includeMustTagged', checked)}
            />
            <Label htmlFor="mustTagged" className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              Include all must-tagged content
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emotional"
              checked={preferences.prioritizeEmotional}
              onCheckedChange={(checked) => updatePreference('prioritizeEmotional', checked)}
            />
            <Label htmlFor="emotional" className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-pink-500" />
              Prioritize emotional moments
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="guestPerspective"
              checked={preferences.includeGuestPerspective}
              onCheckedChange={(checked) => updatePreference('includeGuestPerspective', checked)}
            />
            <Label htmlFor="guestPerspective" className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-blue-500" />
              Include guest perspective shots
            </Label>
          </div>
        </div>

        {/* Content Ratio Slider */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Guest vs Couple Content Ratio
          </Label>
          <div className="px-3">
            <Slider
              value={[preferences.guestContentRatio]}
              onValueChange={([value]) => updatePreference('guestContentRatio', value)}
              max={100}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More Couple Content</span>
              <span>{preferences.guestContentRatio}% Guest</span>
              <span>More Guest Content</span>
            </div>
          </div>
        </div>

        {/* Music Preference */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Music className="w-4 h-4" />
            Music Preference
          </Label>
          <Select value={preferences.musicPreference} onValueChange={(value) => updatePreference('musicPreference', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="romantic">Romantic</SelectItem>
              <SelectItem value="upbeat">Upbeat</SelectItem>
              <SelectItem value="classical">Classical</SelectItem>
              <SelectItem value="instrumental">Instrumental</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentPreferences;
