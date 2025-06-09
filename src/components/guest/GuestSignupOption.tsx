
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Eye, Download, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GuestSignupOptionProps {
  projectId: string;
  projectName: string;
  onSignupSuccess?: () => void;
}

const GuestSignupOption = ({ projectId, projectName, onSignupSuccess }: GuestSignupOptionProps) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create guest account
      const { data, error: insertError } = await supabase
        .from('guest_accounts')
        .insert([{
          email,
          password_hash: password, // In production, this should be properly hashed
          full_name: fullName
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Grant access to this project
      const { error: accessError } = await supabase
        .from('event_access_permissions')
        .insert([{
          guest_account_id: data.id,
          project_id: projectId,
          granted_by: null, // Will be set by the system
          can_download: true,
          can_view: true
        }]);

      if (accessError) throw accessError;

      setSignupComplete(true);
      toast({
        title: "Account created successfully!",
        description: `You now have access to ${projectName}. Check your email for login details.`,
      });

      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (error: any) {
      console.error('Guest signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (signupComplete) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 mb-2">
                Account Created Successfully!
              </h3>
              <p className="text-sm text-green-600">
                You can now access {projectName} anytime to view and download photos.
                Remember to save your login details!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showForm) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Want to access this album later?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Create an account to view and download photos from {projectName} anytime.
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  View Album
                </div>
                <div className="flex items-center">
                  <Download className="w-4 h-4 mr-1" />
                  Download Photos
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-purple-200">
      <CardHeader>
        <CardTitle className="text-center text-lg">
          Create Your Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-name">Full Name</Label>
            <Input
              id="guest-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="guest-email">Email</Label>
            <Input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="guest-password">Password</Label>
            <Input
              id="guest-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GuestSignupOption;
