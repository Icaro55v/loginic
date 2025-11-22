import React, { useState, useEffect } from 'react';
import { AuthService } from './services/mockFirebase';
import { User } from './types';
import { LandingPage } from './components/LandingPage';
import { MerchantDashboard } from './components/MerchantDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StoreFront } from './components/StoreFront';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check URL Params for Store View (Consumer)
    const params = new URLSearchParams(window.location.search);
    const storeParam = params.get('store');
    
    if (storeParam) {
      setStoreId(storeParam);
      setLoading(false);
      return;
    }

    // 2. Check Auth (Merchant/Admin)
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-brandBorder border-t-brandPrimary rounded-full"></div>
      </div>
    );
  }

  const renderContent = () => {
    // 1. Consumer View (Public Store)
    if (storeId) {
      return <StoreFront storeId={storeId} />;
    }

    // 2. Admin View
    if (user && user.isAdmin) {
      return <AdminDashboard onLogout={handleLogout} />;
    }

    // 3. Merchant View
    if (user && !user.isAdmin) {
      return <MerchantDashboard user={user} onLogout={handleLogout} />;
    }

    // 4. Landing / Login
    return <LandingPage onLogin={handleLogin} />;
  };

  return (
    <ToastProvider>
      {renderContent()}
    </ToastProvider>
  );
}

export default App;