
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Users, Eye, Download } from 'lucide-react';
import { useGuestAccess } from '@/hooks/useGuestAccess';
import { Project } from '@/hooks/useProjects';

interface HostGuestManagementProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
}

const HostGuestManagement = ({ project, onUpdateProject }: HostGuestManagementProps) => {
  const { guestAccounts, loading, fetchGuestAccounts, revokeGuestAccess, updateGuestPermissions } = useGuestAccess();

  useEffect(() => {
    fetchGuestAccounts(project.id);
  }, [project.id]);

  const handleToggleGuestSignup = async (enabled: boolean) => {
    const updatedProject = {
      ...project,
      guest_signup_enabled: enabled
    };
    onUpdateProject(updatedProject);
  };

  const handleRevokeAccess = async (accessId: string) => {
    if (confirm('Are you sure you want to revoke this guest\'s access?')) {
      await revokeGuestAccess(accessId);
    }
  };

  const handleTogglePermission = async (accessId: string, permission: 'can_download' | 'can_view', value: boolean) => {
    await updateGuestPermissions(accessId, { [permission]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Guest Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="guest-signup-toggle" className="text-base font-medium">
                Allow Guest Account Creation
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Let guests create accounts to access this event's photos later
              </p>
            </div>
            <Switch
              id="guest-signup-toggle"
              checked={project.guest_signup_enabled || false}
              onCheckedChange={handleToggleGuestSignup}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guest Accounts ({guestAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading guest accounts...</div>
          ) : guestAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No guest accounts yet</p>
              <p className="text-sm">
                {project.guest_signup_enabled 
                  ? 'Guests can create accounts when uploading photos'
                  : 'Enable guest signup to allow account creation'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {guestAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{account.full_name}</h4>
                    <p className="text-sm text-gray-600">{account.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View
                      </Label>
                      <Switch
                        checked={account.access?.can_view || false}
                        onCheckedChange={(value) => 
                          handleTogglePermission(account.access?.id || '', 'can_view', value)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-sm flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Download
                      </Label>
                      <Switch
                        checked={account.access?.can_download || false}
                        onCheckedChange={(value) => 
                          handleTogglePermission(account.access?.id || '', 'can_download', value)
                        }
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeAccess(account.access?.id || '')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostGuestManagement;
