
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Download, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageInfo } from '@/hooks/useStorageLifecycle';

interface StorageWarningBannerProps {
  storageInfo: StorageInfo;
  projectId: string;
  onUpgrade?: () => void;
}

const StorageWarningBanner: React.FC<StorageWarningBannerProps> = ({
  storageInfo,
  projectId,
  onUpgrade
}) => {
  const navigate = useNavigate();

  if (storageInfo.isArchived) {
    return (
      <Card className="border-red-200 bg-red-50 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Project Archived</h3>
              <p className="text-sm text-red-600">
                This project has been archived. Content may no longer be accessible.
              </p>
            </div>
            <Button
              onClick={onUpgrade}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Recover
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (storageInfo.isExpired) {
    return (
      <Card className="border-orange-200 bg-orange-50 mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-500" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800">Storage Expired</h3>
              <p className="text-sm text-orange-600">
                Your project storage has expired. Upgrade now to prevent archival.
              </p>
            </div>
            <Button
              onClick={onUpgrade}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (storageInfo.daysUntilExpiration !== null && storageInfo.daysUntilExpiration <= 7) {
    const isCritical = storageInfo.daysUntilExpiration <= 1;
    const borderColor = isCritical ? 'border-red-200' : 'border-yellow-200';
    const bgColor = isCritical ? 'bg-red-50' : 'bg-yellow-50';
    const textColor = isCritical ? 'text-red-600' : 'text-yellow-600';
    const iconColor = isCritical ? 'text-red-500' : 'text-yellow-500';

    return (
      <Card className={`${borderColor} ${bgColor} mb-4`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
            <div className="flex-1">
              <h3 className={`font-semibold ${textColor.replace('600', '800')}`}>
                {isCritical ? 'Final Warning' : 'Storage Expiring Soon'}
              </h3>
              <p className={`text-sm ${textColor}`}>
                Your project expires in {storageInfo.daysUntilExpiration} day{storageInfo.daysUntilExpiration !== 1 ? 's' : ''}. 
                Download your videos or upgrade your plan.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {/* Implement download functionality */}}
                variant="outline"
                size="sm"
                className={`border-${isCritical ? 'red' : 'yellow'}-300 text-${isCritical ? 'red' : 'yellow'}-700 hover:bg-${isCritical ? 'red' : 'yellow'}-100`}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={onUpgrade}
                variant="outline"
                size="sm"
                className={`border-${isCritical ? 'red' : 'yellow'}-300 text-${isCritical ? 'red' : 'yellow'}-700 hover:bg-${isCritical ? 'red' : 'yellow'}-100`}
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default StorageWarningBanner;
