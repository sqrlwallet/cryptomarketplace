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

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('marketplace');
  const [productLink, setProductLink] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');

    if (product) {
      setProductLink(product);
      setCurrentView('product-page');
    }
  }, []);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setProductLink(null);
    window.history.pushState({}, '', window.location.pathname);
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
    <div className="min-h-screen bg-gray-50">
      {currentView !== 'product-page' && (
        <Navbar currentView={currentView} onNavigate={handleNavigate} />
      )}

      <main>
        {currentView === 'auth' && <Auth />}
        {currentView === 'marketplace' && <Marketplace onNavigate={handleNavigate} />}
        {currentView === 'product-page' && productLink && (
          <ProductPage uniqueLink={productLink} onNavigate={handleNavigate} />
        )}
        {currentView === 'my-purchases' && <MyPurchases />}
        {currentView === 'seller-dashboard' && <SellerDashboard />}
        {currentView === 'transactions' && <Transactions />}
        {currentView === 'profile' && <Profile />}
      </main>

      {currentView !== 'product-page' && (
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-gray-600 text-sm">
              <p className="mb-2">CryptoMarket - Decentralized Marketplace</p>
              <p className="text-xs text-gray-500">
                Platform fee: 10% per transaction
              </p>
            </div>
          </div>
        </footer>
      )}
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
