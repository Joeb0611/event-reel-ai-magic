
import { Button } from '@/components/ui/button';

interface VideoUploadActionsProps {
  onCancel: () => void;
  onUpload: () => void;
  uploading: boolean;
  fileCount: number;
}

const VideoUploadActions = ({ 
  onCancel, 
  onUpload, 
  uploading, 
  fileCount 
}: VideoUploadActionsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button variant="outline" onClick={onCancel} className="flex-1" disabled={uploading}>
        Cancel
      </Button>
      
      <Button 
        onClick={onUpload}
        disabled={fileCount === 0 || uploading}
        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {uploading ? 'Compressing & Uploading...' : `Upload ${fileCount} Video${fileCount !== 1 ? 's' : ''}`}
      </Button>
    </div>
  );
};

export default VideoUploadActions;
