import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Marketplace from './components/Marketplace';
import SellerDashboard from './components/SellerDashboard';
import Transactions from './components/Transactions';
import Profile from './components/Profile';
import MyPurchases from './components/MyPurchases';
import ProductPage from './components/ProductPage';
import UserProfilePage from './components/UserProfilePage';
function AppContent() {
  const { loading } = useAuth();
  const [currentView, setCurrentView] = useState('marketplace');
  const [productLink, setProductLink] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');

    if (product) {
      setProductLink(product);
      setCurrentView('product-page');
    } else if (path.startsWith('/') && path.length > 1) {
      const usernameFromPath = path.slice(1);
      if (usernameFromPath) {
        setUsername(usernameFromPath);
        setCurrentView('user-profile');
      }
    }
  }, []);

  const handleNavigate = (view: string, usernameParam?: string) => {
    setCurrentView(view);
    setProductLink(null);

    if (view === 'user-profile' && usernameParam) {
      setUsername(usernameParam);
      window.history.pushState({}, '', `/${usernameParam}`);
    } else {
      setUsername(null);
      window.history.pushState({}, '', window.location.pathname.split('?')[0]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main relative overflow-hidden font-mono">
      <div className="relative z-10">
        {currentView !== 'product-page' && currentView !== 'user-profile' && (
          <Navbar currentView={currentView} onNavigate={handleNavigate} />
        )}

        <main className="container mx-auto px-4 py-8">
          {currentView === 'auth' && <Auth />}
          {currentView === 'marketplace' && <Marketplace onNavigate={handleNavigate} />}
          {currentView === 'product-page' && productLink && (
            <ProductPage uniqueLink={productLink} onNavigate={handleNavigate} />
          )}
          {currentView === 'user-profile' && username && (
            <UserProfilePage username={username} onNavigate={handleNavigate} />
          )}
          {currentView === 'my-purchases' && <MyPurchases />}
          {currentView === 'seller-dashboard' && <SellerDashboard />}
          {currentView === 'transactions' && <Transactions />}
          {currentView === 'profile' && <Profile />}
        </main>

        {currentView !== 'product-page' && currentView !== 'user-profile' && (
          <footer className="bg-surface border-t-2 border-white mt-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="text-center text-gray-400 text-sm">
                <p className="mb-2 font-display font-bold text-lg text-primary uppercase tracking-widest">Ripework</p>
                <p className="text-xs text-gray-500 font-mono">
                  Platform fee: 10% per transaction
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
