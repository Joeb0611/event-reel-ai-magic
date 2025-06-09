
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MustIncludeToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  count?: number;
}

const MustIncludeToggle = ({ isEnabled, onToggle, count = 0 }: MustIncludeToggleProps) => {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">Must-Include Content</CardTitle>
        <p className="text-sm text-gray-600">Include all tagged must-have moments</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={isEnabled} onCheckedChange={onToggle} />
            <Label className="font-medium">
              Include must-include content
            </Label>
          </div>
          {count > 0 && (
            <Badge variant="secondary">
              {count} item{count !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {isEnabled && count === 0 && (
          <p className="text-sm text-amber-600 mt-2">
            No must-include items selected. Tag videos in the Media Gallery.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MustIncludeToggle;
