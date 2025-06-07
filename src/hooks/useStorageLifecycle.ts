
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StorageInfo {
  expiresAt?: string;
  daysUntilExpiration?: number;
  storageTier: string;
  isExpired: boolean;
  isArchived: boolean;
}

export interface StorageNotification {
  id: string;
  notification_type: string;
  sent_at: string;
  email_sent: boolean;
}

export const useStorageLifecycle = (projectId: string | null) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [notifications, setNotifications] = useState<StorageNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchStorageInfo();
      fetchNotifications();
    }
  }, [projectId]);

  const fetchStorageInfo = async () => {
    if (!projectId) return;

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('expires_at, storage_tier, archived_at')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      if (project) {
        const expiresAt = project.expires_at;
        const now = new Date();
        const expirationDate = expiresAt ? new Date(expiresAt) : null;
        
        const daysUntilExpiration = expirationDate 
          ? Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        setStorageInfo({
          expiresAt,
          daysUntilExpiration,
          storageTier: project.storage_tier || 'free',
          isExpired: expirationDate ? now > expirationDate : false,
          isArchived: !!project.archived_at
        });
      }
    } catch (error) {
      console.error('Error fetching storage info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('storage_notifications')
        .select('*')
        .eq('project_id', projectId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const upgradeStorageTier = async (newTier: string) => {
    if (!projectId) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ storage_tier: newTier })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Storage Upgraded",
        description: `Project storage tier upgraded to ${newTier}`,
      });

      await fetchStorageInfo();
      return true;
    } catch (error) {
      console.error('Error upgrading storage tier:', error);
      toast({
        title: "Upgrade Failed",
        description: "Failed to upgrade storage tier. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getStorageWarningLevel = (): 'none' | 'warning' | 'critical' | 'expired' => {
    if (!storageInfo) return 'none';
    
    if (storageInfo.isExpired || storageInfo.isArchived) return 'expired';
    if (storageInfo.daysUntilExpiration !== null) {
      if (storageInfo.daysUntilExpiration <= 1) return 'critical';
      if (storageInfo.daysUntilExpiration <= 7) return 'warning';
    }
    return 'none';
  };

  return {
    storageInfo,
    notifications,
    isLoading,
    upgradeStorageTier,
    getStorageWarningLevel,
    refetch: fetchStorageInfo
  };
};
