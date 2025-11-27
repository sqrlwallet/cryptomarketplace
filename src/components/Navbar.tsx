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
    <nav className="bg-surface sticky top-0 z-50 border-b-2 border-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('marketplace')}
              className="flex items-center space-x-2 group"
            >
              <div className="p-2 bg-primary border-2 border-black group-hover:translate-x-1 group-hover:translate-y-1 transition-transform">
                <ShoppingBag className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold font-display text-white uppercase tracking-tighter">Ripework</span>
            </button>

            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => onNavigate('marketplace')}
                  className={`px-4 py-2 font-bold uppercase tracking-wide transition-all duration-200 border-2 ${currentView === 'marketplace'
                    ? 'bg-primary border-primary text-black shadow-neo-white'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-white'
                    }`}
                >
                  Marketplace
                </button>

                <button
                  onClick={() => onNavigate('my-purchases')}
                  className={`px-4 py-2 font-bold uppercase tracking-wide transition-all duration-200 border-2 ${currentView === 'my-purchases'
                    ? 'bg-primary border-primary text-black shadow-neo-white'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-white'
                    }`}
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  Purchases
                </button>

                {profile?.is_seller && (
                  <button
                    onClick={() => onNavigate('seller-dashboard')}
                    className={`px-4 py-2 font-bold uppercase tracking-wide transition-all duration-200 border-2 ${currentView === 'seller-dashboard'
                      ? 'bg-primary border-primary text-black shadow-neo-white'
                      : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-white'
                      }`}
                  >
                    <Store className="w-4 h-4 inline mr-2" />
                    Store
                  </button>
                )}

                <button
                  onClick={() => onNavigate('transactions')}
                  className={`px-4 py-2 font-bold uppercase tracking-wide transition-all duration-200 border-2 ${currentView === 'transactions'
                    ? 'bg-primary border-primary text-black shadow-neo-white'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-white'
                    }`}
                >
                  Transactions
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {walletAddress ? (
                  <button
                    onClick={disconnectWallet}
                    className="flex items-center space-x-2 px-4 py-2 bg-black text-primary border-2 border-primary hover:bg-primary hover:text-black transition-all duration-200 shadow-neo"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm font-bold font-mono">{formatAddress(walletAddress)}</span>
                  </button>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="neo-button-primary flex items-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('profile')}
                  className={`p-2 border-2 transition-all duration-200 ${currentView === 'profile'
                    ? 'bg-white text-black border-white'
                    : 'bg-black text-white border-white hover:bg-white hover:text-black'
                    }`}
                >
                  <User className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSignOut}
                  className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="neo-button-primary uppercase tracking-wide"
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
