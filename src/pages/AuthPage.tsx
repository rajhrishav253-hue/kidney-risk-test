import { useState } from 'react';
import { Activity, AlertCircle, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { Spinner } from '@/components/ui';

interface AuthPageProps {
  mode: 'login' | 'register';
}

export function AuthPage({ mode }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
