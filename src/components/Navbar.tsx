import { Wallet, ShoppingBag, LogOut, User, Store, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Navbar({ currentView, onNavigate }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { walletAddress, connectWallet, disconnectWallet, isConnecting } = useWallet();

  const handleSignOut = async () => {
    await signOut();
    disconnectWallet();
    onNavigate('auth');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('marketplace')}
              className="flex items-center space-x-2 text-xl font-bold text-gray-900"
            >
              <ShoppingBag className="w-6 h-6" />
              <span>CryptoMarket</span>
            </button>

            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => onNavigate('marketplace')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'marketplace'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Marketplace
                </button>

                <button
                  onClick={() => onNavigate('my-purchases')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'my-purchases'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package className="w-4 h-4 inline mr-1" />
                  My Purchases
                </button>

                {profile?.is_seller && (
                  <button
                    onClick={() => onNavigate('seller-dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'seller-dashboard'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Store className="w-4 h-4 inline mr-1" />
                    My Store
                  </button>
                )}

                <button
                  onClick={() => onNavigate('transactions')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'transactions'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Transactions
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {walletAddress ? (
                  <button
                    onClick={disconnectWallet}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
                  </button>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('profile')}
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    currentView === 'profile' ? 'bg-gray-100' : ''
                  }`}
                >
                  <User className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-gray-700" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
