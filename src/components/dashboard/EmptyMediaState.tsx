
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Filter } from 'lucide-react';

interface EmptyMediaStateProps {
  filter: string;
  onShowVideoUpload: () => void;
}

const EmptyMediaState = ({ filter, onShowVideoUpload }: EmptyMediaStateProps) => {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <div className="text-gray-400 mb-3">
          {filter === 'all' ? (
            <Image className="w-10 h-10 mx-auto" />
          ) : (
            <Filter className="w-10 h-10 mx-auto" />
          )}
        </div>
        <p className="text-gray-500 mb-3 text-sm">
          {filter === 'all' ? 'No media uploaded yet' : 'No media matches your filter'}
        </p>
        {filter === 'all' && (
          <Button
            onClick={onShowVideoUpload}
            variant="outline"
            size="sm"
          >
            Upload Your First Media
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyMediaState;
