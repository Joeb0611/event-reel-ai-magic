
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface EventProjectData {
  name: string;
  description: string;
  host_name?: string;
  co_host_name?: string;
  event_date?: string;
  location?: string;
  theme?: string;
}

interface EventProjectModalProps {
  children: React.ReactNode;
  onCreateProject: (projectData: EventProjectData) => void;
}

const EventProjectModal = ({ children, onCreateProject }: EventProjectModalProps) => {
  const [open, setOpen] = useState(false);
  const [projectData, setProjectData] = useState<EventProjectData>({
    name: '',
    description: '',
    host_name: '',
    co_host_name: '',
    event_date: '',
    location: '',
    theme: ''
  });
  const [eventDate, setEventDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      ...projectData,
      event_date: eventDate ? format(eventDate, 'yyyy-MM-dd') : ''
    };
    
    onCreateProject(finalData);
    setOpen(false);
    
    // Reset form
    setProjectData({
      name: '',
      description: '',
      host_name: '',
      co_host_name: '',
      event_date: '',
      location: '',
      theme: ''
    });
    setEventDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create New Event
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              placeholder="e.g., Sarah's Birthday Party, Company Retreat 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={projectData.description}
              onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
              placeholder="Tell us about your event..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host_name">Host Name</Label>
              <Input
                id="host_name"
                value={projectData.host_name}
                onChange={(e) => setProjectData({ ...projectData, host_name: e.target.value })}
                placeholder="Primary host"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co_host_name">Co-Host Name</Label>
              <Input
                id="co_host_name"
                value={projectData.co_host_name}
                onChange={(e) => setProjectData({ ...projectData, co_host_name: e.target.value })}
                placeholder="Secondary host (optional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={projectData.location}
              onChange={(e) => setProjectData({ ...projectData, location: e.target.value })}
              placeholder="Where is your event taking place?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme/Style</Label>
            <Input
              id="theme"
              value={projectData.theme}
              onChange={(e) => setProjectData({ ...projectData, theme: e.target.value })}
              placeholder="e.g., Casual, Formal, Beach Party, Vintage"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventProjectModal;
