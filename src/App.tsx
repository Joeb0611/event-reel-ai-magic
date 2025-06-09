import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import GuestUpload from '@/pages/GuestUpload';
import SharePage from '@/pages/SharePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import AccountSettings from '@/pages/AccountSettings';
import LiveFeed from '@/pages/LiveFeed';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SubscriptionProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/guest/:qrCode" element={<GuestUpload />} />
              <Route path="/share/:projectId" element={<SharePage />} />
              <Route path="/live-feed/:projectId" element={<LiveFeed />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/account-settings" element={<AccountSettings />} />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
