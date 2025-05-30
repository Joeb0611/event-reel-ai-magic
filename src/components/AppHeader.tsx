
import { Video, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onSignOut: () => void;
}

const AppHeader = ({ onSignOut }: AppHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="text-center flex-1">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6">
          <Video className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Event Editor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create stunning video highlights with AI-powered editing. Manage your projects and turn your memories into beautiful stories.
        </p>
      </div>
      <Button
        onClick={onSignOut}
        variant="outline"
        className="absolute top-4 right-4"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default AppHeader;
