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
import Tutorial from './components/Tutorial';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function AppContent() {
  const { loading } = useAuth();
  const [currentView, setCurrentView] = useState('marketplace');
  const [productLink, setProductLink] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    const knownRoutes = ['auth', 'marketplace', 'my-purchases', 'seller-dashboard', 'transactions', 'profile', 'tutorial'];

    if (product) {
      // Legacy support for ?product=
      setProductLink(product);
      setCurrentView('product-page');
      // Update URL to new format without reloading
      window.history.replaceState({}, '', `/product/${product}`);
    } else if (path.startsWith('/product/') && path.length > 9) {
      const productLinkFromPath = path.slice(9); // Remove '/product/'
      setProductLink(productLinkFromPath);
      setCurrentView('product-page');
    } else if (path.startsWith('/') && path.length > 1) {
      const route = path.slice(1);

      if (knownRoutes.includes(route)) {
        setCurrentView(route);
      } else {
        setUsername(route);
        setCurrentView('user-profile');
      }
    }
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);

    if (view === 'product-page' && param) {
      setProductLink(param);
      setUsername(null);
      window.history.pushState({}, '', `/product/${param}`);
    } else if (view === 'user-profile' && param) {
      setProductLink(null);
      setUsername(param);
      window.history.pushState({}, '', `/${param}`);
    } else {
      setProductLink(null);
      setUsername(null);

      let newPath = '/';
      if (view !== 'marketplace') {
        newPath = `/${view}`;
      }
      window.history.pushState({}, '', newPath);
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
          {currentView === 'auth' && <Auth onNavigate={handleNavigate} />}
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
          {currentView === 'tutorial' && <Tutorial />}
        </main>

        {currentView !== 'product-page' && currentView !== 'user-profile' && (
          <footer className="bg-surface border-t-2 border-white mt-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="text-center text-gray-400 text-sm">
                <p className="mb-2 font-display font-bold text-lg text-primary uppercase tracking-widest">Ripework</p>
                <div className="flex justify-center space-x-6 mt-4">
                  <button
                    onClick={() => handleNavigate('tutorial')}
                    className="hover:text-white transition-colors uppercase tracking-wider font-bold"
                  >
                    Tutorial
                  </button>
                </div>
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
        <Analytics />
        <SpeedInsights />
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;

