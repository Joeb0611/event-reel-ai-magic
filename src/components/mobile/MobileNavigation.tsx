
import { motion } from 'framer-motion';
import { Home, Image, Users, Settings, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'guests', label: 'Guests', icon: Users },
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'settings', label: 'AI Settings', icon: Settings },
];

const MobileNavigation = ({ activeTab, onTabChange, className }: MobileNavigationProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 safe-area-pb",
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 h-auto py-2 px-1 rounded-lg transition-all",
                isActive 
                  ? "bg-purple-100 text-purple-600" 
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium leading-none">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0.5 left-1/2 w-8 h-0.5 bg-purple-600 rounded-full"
                  style={{ translateX: '-50%' }}
                />
              )}
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MobileNavigation;
