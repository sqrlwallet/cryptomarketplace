import { useState, useEffect } from 'react';
import { User, Save, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

import SEO from './SEO';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    wallet_address: '',
    is_seller: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        bio: profile.bio,
        wallet_address: profile.wallet_address || '',
        is_seller: profile.is_seller,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (walletAddress && !formData.wallet_address) {
      setFormData(prev => ({ ...prev, wallet_address: walletAddress }));
    }
  }, [walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
          wallet_address: formData.wallet_address,
          is_seller: formData.is_seller,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const copyProfileLink = () => {
    const url = `${window.location.origin}/${formData.username}`;
    navigator.clipboard.writeText(url);
    alert('Profile link copied to clipboard!');
  };

  const openProfilePage = () => {
    window.open(`/${formData.username}`, '_blank');
  };

  if (!user || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Logged In</h2>
        <p className="text-gray-600">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO
        title="Profile Settings"
        description="Manage your account profile and settings."
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-display uppercase glitch-text">Profile Settings</h1>
        <p className="text-gray-400 font-mono uppercase">&gt;&gt; Manage your account information and preferences</p>
      </div>

      <div className="bg-surface border-2 border-white shadow-neo-white overflow-hidden">
        <div className="bg-primary h-24 border-b-2 border-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center -mt-12 mb-6">
            <div className="bg-black border-2 border-white p-1 shadow-neo">
              <div className="w-24 h-24 bg-surface flex items-center justify-center border-2 border-white">
                <User className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-1 font-mono uppercase">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="neo-input w-full"
                required
              />
              <div className="flex items-center space-x-2 mt-2">
                <p className="text-xs text-gray-400 font-mono uppercase">
                  Your profile: {window.location.origin}/{formData.username}
                </p>
                <button
                  type="button"
                  onClick={copyProfileLink}
                  className="text-primary hover:text-white p-1 transition-colors"
                  title="Copy profile link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={openProfilePage}
                  className="text-primary hover:text-white p-1 transition-colors"
                  title="View profile page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-1 font-mono uppercase">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="neo-input w-full opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1 font-mono uppercase">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-1 font-mono uppercase">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="neo-input w-full resize-none"
                rows={4}
                placeholder="TELL US ABOUT YOURSELF..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-1 font-mono uppercase">
                Wallet Address
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.wallet_address}
                  onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                  className="neo-input flex-1 font-mono text-sm"
                  placeholder="0x..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono uppercase">
                This wallet address will be used for receiving payments
              </p>
            </div>

            <div className="bg-black border-2 border-white p-4 shadow-neo">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="is_seller"
                  checked={formData.is_seller}
                  onChange={(e) => setFormData({ ...formData, is_seller: e.target.checked })}
                  className="mt-1 w-4 h-4 text-primary bg-black border-2 border-white rounded-none focus:ring-0 focus:ring-offset-0 checked:bg-primary checked:border-white"
                />
                <div className="flex-1">
                  <label htmlFor="is_seller" className="font-bold text-white cursor-pointer font-mono uppercase">
                    Enable Seller Mode
                  </label>
                  <p className="text-sm text-gray-400 mt-1 font-mono uppercase">
                    Allow yourself to create and sell products or services on the marketplace.
                    You'll get access to the seller dashboard and can start earning.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border-2 border-red-500 text-red-500 px-4 py-3 text-sm font-mono font-bold uppercase shadow-neo">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-black border-2 border-primary text-primary px-4 py-3 text-sm font-mono font-bold uppercase shadow-neo">
                Profile updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neo-button-primary w-full flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'SAVING...' : 'SAVE CHANGES'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
