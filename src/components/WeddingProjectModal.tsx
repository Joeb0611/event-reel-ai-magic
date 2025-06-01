
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeddingProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: WeddingProjectData) => void;
}

export interface WeddingProjectData {
  name: string;
  description: string;
  brideName: string;
  groomName: string;
  weddingDate: Date | null;
  location: string;
  theme: string;
  privacySettings: {
    public_qr: boolean;
    guest_upload: boolean;
  };
}

const WeddingProjectModal = ({ isOpen, onClose, onCreateProject }: WeddingProjectModalProps) => {
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [publicQR, setPublicQR] = useState(true);
  const [guestUpload, setGuestUpload] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brideName.trim() && groomName.trim()) {
      const projectName = `${brideName} & ${groomName}'s Wedding`;
      onCreateProject({
        name: projectName,
        description: description.trim(),
        brideName: brideName.trim(),
        groomName: groomName.trim(),
        weddingDate,
        location: location.trim(),
        theme: theme.trim(),
        privacySettings: {
          public_qr: publicQR,
          guest_upload: guestUpload,
        },
      });
      // Reset form
      setBrideName('');
      setGroomName('');
      setWeddingDate(null);
      setLocation('');
      setTheme('');
      setDescription('');
      setPublicQR(true);
      setGuestUpload(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Create Wedding Project
          </DialogTitle>
          <DialogDescription>
            Set up your wedding project to collect photos and videos from guests via QR code.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Couple Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brideName">Bride's Name</Label>
              <Input
                id="brideName"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Enter bride's name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groomName">Groom's Name</Label>
              <Input
                id="groomName"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="Enter groom's name"
                required
              />
            </div>
          </div>

          {/* Wedding Date */}
          <div className="space-y-2">
            <Label>Wedding Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !weddingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {weddingDate ? format(weddingDate, "PPP") : "Select wedding date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={weddingDate || undefined}
                  onSelect={setWeddingDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Wedding Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Central Park, New York"
            />
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme">Wedding Theme/Style</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Rustic, Modern, Garden Party"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Special instructions or details for guests"
              rows={3}
            />
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Privacy Settings</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publicQR"
                  checked={publicQR}
                  onCheckedChange={(checked) => setPublicQR(checked === true)}
                />
                <Label htmlFor="publicQR" className="text-sm">
                  Allow public access via QR code (guests don't need accounts)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="guestUpload"
                  checked={guestUpload}
                  onCheckedChange={(checked) => setGuestUpload(checked === true)}
                />
                <Label htmlFor="guestUpload" className="text-sm">
                  Enable guest photo/video uploads
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              disabled={!brideName.trim() || !groomName.trim()}
            >
              Create Wedding Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WeddingProjectModal;
