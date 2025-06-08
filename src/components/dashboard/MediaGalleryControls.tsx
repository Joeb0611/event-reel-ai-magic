
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Grid, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MediaGalleryControlsProps {
  videoCount: number;
  filter: string;
  sortBy: string;
  viewMode: 'grid' | 'list';
  onFilterChange: (filter: string) => void;
  onSortChange: (sortBy: string) => void;
  onViewModeChange: (viewMode: 'grid' | 'list') => void;
  onAddMediaClick: () => void;
}

const MediaGalleryControls = ({
  videoCount,
  filter,
  sortBy,
  viewMode,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  onAddMediaClick
}: MediaGalleryControlsProps) => {
  const { isMobile } = useIsMobile();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg">Media ({videoCount})</CardTitle>
          <Button
            onClick={onAddMediaClick}
            size={isMobile ? "default" : "sm"}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto text-sm touch-target"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Media
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-3 sm:space-y-0">
          {/* Filter Row */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <Select value={filter} onValueChange={onFilterChange}>
              <SelectTrigger className={`text-sm ${isMobile ? 'h-11 touch-target' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Media</SelectItem>
                <SelectItem value="couple">Couple Uploads</SelectItem>
                <SelectItem value="guest">Guest Uploads</SelectItem>
                <SelectItem value="photos">Photos Only</SelectItem>
                <SelectItem value="videos">Videos Only</SelectItem>
                <SelectItem value="must-include">Must Include</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort and View Mode Row */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className={`text-sm ${isMobile ? 'h-11 touch-target' : ''}`}>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg bg-white">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size={isMobile ? "default" : "sm"}
                onClick={() => onViewModeChange('grid')}
                className={`${isMobile ? 'touch-target px-3' : ''} ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size={isMobile ? "default" : "sm"}
                onClick={() => onViewModeChange('list')}
                className={`${isMobile ? 'touch-target px-3' : ''} ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaGalleryControls;
