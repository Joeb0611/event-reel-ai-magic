
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Calendar, MapPin } from 'lucide-react';

export interface WeddingProjectData {
  name: string;
  description: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  location: string;
  theme: string;
}

interface WeddingProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: WeddingProjectData) => void;
}

const WeddingProjectModal = ({ isOpen, onClose, onCreateProject }: WeddingProjectModalProps) => {
  const [formData, setFormData] = useState<WeddingProjectData>({
    name: '',
    description: '',
    bride_name: '',
    groom_name: '',
    wedding_date: '',
    location: '',
    theme: 'romantic'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.bride_name || !formData.groom_name || !formData.wedding_date) {
      return;
    }

    onCreateProject(formData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      bride_name: '',
      groom_name: '',
      wedding_date: '',
      location: '',
      theme: 'romantic'
    });
  };

  const handleInputChange = (field: keyof WeddingProjectData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-purple-600">
            <Heart className="w-6 h-6" />
            Create Your Wedding Project
          </DialogTitle>
          <DialogDescription>
            Set up your wedding memory collection to gather photos and videos from your special day
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Project Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Sarah & John's Wedding"
                className="mt-1"
                required
              />
            </div>

            {/* Bride & Groom Names */}
            <div>
              <Label htmlFor="bride_name" className="text-sm font-medium">
                Bride's Name *
              </Label>
              <Input
                id="bride_name"
                value={formData.bride_name}
                onChange={(e) => handleInputChange('bride_name', e.target.value)}
                placeholder="Bride's name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="groom_name" className="text-sm font-medium">
                Groom's Name *
              </Label>
              <Input
                id="groom_name"
                value={formData.groom_name}
                onChange={(e) => handleInputChange('groom_name', e.target.value)}
                placeholder="Groom's name"
                className="mt-1"
                required
              />
            </div>

            {/* Wedding Date */}
            <div>
              <Label htmlFor="wedding_date" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Wedding Date *
              </Label>
              <Input
                id="wedding_date"
                type="date"
                value={formData.wedding_date}
                onChange={(e) => handleInputChange('wedding_date', e.target.value)}
                className="mt-1"
                required
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Wedding venue/location"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your special day..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!formData.name || !formData.bride_name || !formData.groom_name || !formData.wedding_date}
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
