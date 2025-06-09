
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GuestAccount {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface EventAccess {
  id: string;
  project_id: string;
  can_download: boolean;
  can_view: boolean;
  granted_at: string;
  project?: {
    name: string;
    title?: string;
  };
}

export const useGuestAccess = () => {
  const [guestAccounts, setGuestAccounts] = useState<GuestAccount[]>([]);
  const [eventAccess, setEventAccess] = useState<EventAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchGuestAccounts = async (projectId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_access_permissions')
        .select(`
          id,
          can_download,
          can_view,
          granted_at,
          guest_account:guest_accounts(
            id,
            email,
            full_name,
            created_at
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      const accounts = data?.map(item => ({
        ...item.guest_account,
        access: {
          id: item.id,
          can_download: item.can_download,
          can_view: item.can_view,
          granted_at: item.granted_at
        }
      })) || [];

      setGuestAccounts(accounts);
    } catch (error) {
      console.error('Error fetching guest accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch guest accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeGuestAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from('event_access_permissions')
        .delete()
        .eq('id', accessId);

      if (error) throw error;

      setGuestAccounts(prev => 
        prev.filter(account => account.access?.id !== accessId)
      );

      toast({
        title: "Access revoked",
        description: "Guest access has been revoked successfully",
      });
    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke guest access",
        variant: "destructive",
      });
    }
  };

  const updateGuestPermissions = async (accessId: string, permissions: { can_download?: boolean; can_view?: boolean }) => {
    try {
      const { error } = await supabase
        .from('event_access_permissions')
        .update(permissions)
        .eq('id', accessId);

      if (error) throw error;

      setGuestAccounts(prev => 
        prev.map(account => 
          account.access?.id === accessId 
            ? { ...account, access: { ...account.access, ...permissions } }
            : account
        )
      );

      toast({
        title: "Permissions updated",
        description: "Guest permissions have been updated successfully",
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update guest permissions",
        variant: "destructive",
      });
    }
  };

  return {
    guestAccounts,
    eventAccess,
    loading,
    fetchGuestAccounts,
    revokeGuestAccess,
    updateGuestPermissions,
  };
};
