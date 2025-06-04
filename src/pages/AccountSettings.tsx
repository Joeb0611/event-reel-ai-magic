import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Settings, CreditCard, LogOut, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';

const AccountSettings = () => {
  const {
    user,
    signOut
  } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No email address found for your account.",
        variant: "destructive"
      });
      return;
    }
    setResetLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) throw error;
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password."
      });
    } catch (error: any) {
      toast({
        title: "Error sending reset email",
        description: error.message || "There was a problem sending the reset email.",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };

  const getSubscriptionDisplayName = () => {
    if (!subscription) return 'Memory Starter (Free)';
    
    const tierNames = {
      free: 'Memory Starter (Free)',
      premium: 'Memory Maker (Premium)',
      professional: 'Memory Master (Professional)'
    };
    
    return tierNames[subscription.tier] || 'Memory Starter (Free)';
  };

  const getSubscriptionColor = () => {
    if (!subscription || subscription.tier === 'free') return 'blue';
    if (subscription.tier === 'premium') return 'purple';
    return 'indigo';
  };

  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 safe-area-pb">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} className="bg-white/80 backdrop-blur-sm touch-target flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Account Settings
          </h1>
        </div>

        <div className="grid gap-4 md:gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="w-4 h-4 md:w-5 md:h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input id="email" type="email" value={user?.email || ''} disabled className="bg-gray-50 mt-1" />
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Email cannot be changed at this time
                  </p>
                </div>
                
              </div>
            </CardContent>
          </Card>

          {/* Password Reset */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <KeyRound className="w-4 h-4 md:w-5 md:h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm md:text-base">Reset Password</h3>
                  <p className="text-xs md:text-sm text-gray-600 break-words">
                    Send a password reset email to {user?.email}
                  </p>
                </div>
                <Button onClick={handlePasswordReset} disabled={resetLoading} variant="outline" className="flex items-center gap-2 touch-target w-full sm:w-auto shrink-0" size="sm">
                  <KeyRound className="w-4 h-4" />
                  <span className="text-sm">{resetLoading ? 'Sending...' : 'Reset Password'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                Subscription & Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptionLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-${getSubscriptionColor()}-50 rounded-lg border border-${getSubscriptionColor()}-200`}>
                  <div className="flex-1">
                    <h3 className={`font-medium text-${getSubscriptionColor()}-900 text-sm md:text-base`}>Current Plan</h3>
                    <p className={`text-xs md:text-sm text-${getSubscriptionColor()}-700`}>
                      {getSubscriptionDisplayName()}
                    </p>
                    {subscription && subscription.tier !== 'free' && (
                      <p className={`text-xs text-${getSubscriptionColor()}-600 mt-1`}>
                        Projects used: {subscription.projects_used} / {subscription.projects_limit === -1 ? '∞' : subscription.projects_limit}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={() => navigate('/subscription')} 
                    className={`bg-${getSubscriptionColor()}-600 hover:bg-${getSubscriptionColor()}-700 touch-target w-full sm:w-auto text-sm`} 
                    size="sm"
                  >
                    Manage Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 text-sm md:text-base">Sign Out</h3>
                  <p className="text-xs md:text-sm text-red-700">
                    Sign out of your MemoryWeave account
                  </p>
                </div>
                <Button variant="destructive" onClick={handleSignOut} disabled={loading} className="flex items-center gap-2 touch-target w-full sm:w-auto" size="sm">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};

export default AccountSettings;
