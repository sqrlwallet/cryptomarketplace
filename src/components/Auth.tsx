import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SEO from './SEO';

interface AuthProps {
  onNavigate: (view: string) => void;
  message?: string;
}

export default function Auth({ onNavigate, message }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError('Username is required');
          return;
        }
        await signUp(email, password, username);
        setRegisteredEmail(email);
        setShowVerificationMessage(true);
      } else {
        await signIn(email, password);
        onNavigate('marketplace');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <SEO
          title="Verify Your Email"
          description="Check your email to verify your account."
        />
        <div className="max-w-lg w-full">
          <div className="bg-surface border-2 border-white p-8 shadow-neo-white animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary border-2 border-black mb-4">
                <span className="text-4xl">📧</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 font-display uppercase">
                Check Your Email
              </h2>
              <p className="text-gray-400 font-mono uppercase text-sm">
                &gt;&gt; VERIFICATION_EMAIL_SENT
              </p>
            </div>

            <div className="bg-black border-2 border-white p-6 mb-6">
              <p className="text-white font-mono text-sm mb-4">
                We've sent a verification email to:
              </p>
              <p className="text-primary font-bold font-mono text-lg mb-4 break-all">
                {registeredEmail}
              </p>
              <div className="border-t-2 border-white/20 pt-4 mt-4">
                <p className="text-gray-300 font-mono text-xs mb-3">
                  <span className="text-primary font-bold">1.</span> Check your inbox for the verification email
                </p>
                <p className="text-gray-300 font-mono text-xs mb-3">
                  <span className="text-primary font-bold">2.</span> Click the verification link in the email
                </p>
                <p className="text-gray-300 font-mono text-xs mb-3">
                  <span className="text-primary font-bold">3.</span> Come back and sign in
                </p>
              </div>
            </div>

            <div className="bg-red-900/20 border-2 border-red-500 p-4 mb-6">
              <p className="text-red-500 font-mono text-xs font-bold uppercase flex items-start">
                <span className="mr-2 mt-0.5">⚠️</span>
                <span>
                  Didn't receive the email? Check your spam folder. Some email providers may filter verification emails.
                </span>
              </p>
            </div>

            <button
              onClick={() => {
                setShowVerificationMessage(false);
                setIsSignUp(false);
                setEmail('');
                setPassword('');
                setUsername('');
              }}
              className="w-full bg-primary text-black border-2 border-primary py-3 font-bold hover:bg-white hover:border-white transition-all shadow-neo hover:shadow-neo-white uppercase font-mono"
            >
              &gt;&gt; BACK TO SIGN IN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <SEO
        title={isSignUp ? "Create Account" : "Sign In"}
        description="Access your account to buy and sell premium digital assets on Ripework."
      />
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex justify-center mb-6">
            <div className="bg-primary border-2 border-black p-4 shadow-neo">
              <ShoppingBag className="w-12 h-12 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display text-white mb-2 uppercase tracking-tighter">
            Ripework
          </h1>
          <p className="text-gray-400 text-lg font-mono">
            {message ? (
              <span className="text-primary font-bold">{message}</span>
            ) : (
              <>&gt;&gt; DECENTRALIZED_MARKETPLACE_INIT</>
            )}
          </p>
        </div>

        <div className="bg-surface border-2 border-white p-8 shadow-neo-white animate-fade-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 font-display uppercase">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 text-sm font-mono uppercase">
              {isSignUp
                ? '>> JOIN_MARKETPLACE_PROTOCOL'
                : '>> AUTHENTICATE_USER_SESSION'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 font-mono uppercase">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none transition-all font-mono"
                  placeholder="JOHNDOE"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 font-mono uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none transition-all font-mono"
                placeholder="USER@EXAMPLE.COM"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 font-mono uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-600 focus:border-primary focus:shadow-neo outline-none transition-all font-mono"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border-2 border-red-500 text-red-500 px-4 py-3 text-sm flex items-center font-mono font-bold uppercase">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black border-2 border-primary py-3.5 font-bold hover:bg-white hover:border-white hover:text-black transition-all shadow-neo hover:shadow-neo-white disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono"
            >
              {loading ? 'PROCESSING...' : isSignUp ? 'SIGN UP' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t-2 border-white/20">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-primary hover:text-white transition-colors text-sm font-bold font-mono uppercase"
            >
              {isSignUp
                ? '>> ALREADY_HAVE_ACCOUNT? SIGN_IN'
                : ">> NO_ACCOUNT? SIGN_UP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
