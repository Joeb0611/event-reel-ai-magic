
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarCheck, Calendar, MapPin } from 'lucide-react';

export interface EventProjectData {
  name: string;
  description: string;
  host_name: string;
  co_host_name: string;
  event_date: string;
  location: string;
  theme: string;
}

interface EventProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: EventProjectData) => void;
}

const EventProjectModal = ({ isOpen, onClose, onCreateProject }: EventProjectModalProps) => {
  const [formData, setFormData] = useState<EventProjectData>({
    name: '',
    description: '',
    host_name: '',
    co_host_name: '',
    event_date: '',
    location: '',
    theme: 'celebration'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.host_name || !formData.event_date) {
      return;
    }

    onCreateProject(formData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      host_name: '',
      co_host_name: '',
      event_date: '',
      location: '',
      theme: 'celebration'
    });
  };

  const handleInputChange = (field: keyof EventProjectData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-blue-600">
            <CalendarCheck className="w-6 h-6" />
            Create Your Event Project
          </DialogTitle>
          <DialogDescription>
            Set up your event memory collection to gather photos and videos from your special occasion
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
                placeholder="e.g., Sarah's Birthday Party, Company Retreat 2024"
                className="mt-1"
                required
              />
            </div>

            {/* Host Names */}
            <div>
              <Label htmlFor="host_name" className="text-sm font-medium">
                Host Name *
              </Label>
              <Input
                id="host_name"
                value={formData.host_name}
                onChange={(e) => handleInputChange('host_name', e.target.value)}
                placeholder="Primary host name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="co_host_name" className="text-sm font-medium">
                Co-Host Name
              </Label>
              <Input
                id="co_host_name"
                value={formData.co_host_name}
                onChange={(e) => handleInputChange('co_host_name', e.target.value)}
                placeholder="Co-host name (optional)"
                className="mt-1"
              />
            </div>

            {/* Event Date */}
            <div>
              <Label htmlFor="event_date" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Event Date *
              </Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleInputChange('event_date', e.target.value)}
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
                placeholder="Event venue/location"
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
                placeholder="Tell us about your special event..."
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
              disabled={!formData.name || !formData.host_name || !formData.event_date}
            >
              Create Event Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventProjectModal;
