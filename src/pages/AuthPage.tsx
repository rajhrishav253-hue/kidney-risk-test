import { useState } from 'react';
import { Activity, AlertCircle, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { Spinner } from '@/components/ui';

function GoogleIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface AuthPageProps {
  mode: 'login' | 'register';
}

export function AuthPage({ mode }: AuthPageProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { navigate } = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      if (!fullName.trim()) return setError('Please enter your full name.');
      if (password.length < 6)
        return setError('Password must be at least 6 characters.');
      if (password !== confirm) return setError('Passwords do not match.');
    } else {
      if (!email.trim() || !password) return setError('Email and password are required.');
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signUp(fullName.trim(), email.trim().toLowerCase(), password);
      } else {
        await signIn(email.trim().toLowerCase(), password);
      }
      navigate({ name: 'dashboard' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        setError('An account with this email already exists. Try logging in.');
      } else if (msg.toLowerCase().includes('invalid credentials') || msg.toLowerCase().includes('invalid login')) {
        setError('Invalid email or password.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // OAuth redirect happens in-browser; on return the auth state listener picks it up.
    } catch (err) {
      setGoogleLoading(false);
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12 animate-fade-up">
      <div className="card p-8">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-[#04111f]">
            <Activity size={24} strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 font-[Space_Grotesk] text-2xl font-bold text-white">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {isRegister
              ? 'Start running private kidney risk assessments.'
              : 'Log in to view your assessments and history.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="label-text" htmlFor="full_name">Full name</label>
              <div className="relative mt-1.5">
                <UserIcon
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="label-text" htmlFor="email">Email</label>
            <div className="relative mt-1.5">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field !pl-10"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label-text" htmlFor="password">Password</label>
            <div className="relative mt-1.5">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field !pl-10"
                placeholder={isRegister ? 'At least 6 characters' : '••••••••'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                disabled={loading}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="label-text" htmlFor="confirm">Confirm password</label>
              <div className="relative mt-1.5">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-400/5 px-3.5 py-2.5 text-sm text-red-200">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                {isRegister ? 'Create account' : 'Log in'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#1f1f1f] transition hover:bg-slate-100 disabled:opacity-60"
        >
          {googleLoading ? (
            <Spinner className="!text-slate-500" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => navigate({ name: 'login' })}
                className="font-medium text-cyan-300 hover:text-cyan-200"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Need an account?{' '}
              <button
                onClick={() => navigate({ name: 'register' })}
                className="font-medium text-cyan-300 hover:text-cyan-200"
              >
                Register
              </button>
            </>
          )}
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-slate-500">
        By continuing you acknowledge this is an educational prototype, not a medical device.
      </p>
    </div>
  );
}
