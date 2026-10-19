import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Calendar, Save, LogOut, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { Spinner } from '@/components/ui';

export function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) setFullName(profile.full_name);
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user!.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    await refreshProfile();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 animate-fade-up">
      <div className="mb-7">
        <span className="chip mb-3">
          <UserIcon size={12} /> Profile
        </span>
        <h1 className="font-[Space_Grotesk] text-3xl font-bold text-white">
          Account & settings
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Update your name or sign out. Your email is tied to your authentication and cannot be changed here.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-[#04111f]">
            <Activity size={26} />
          </div>
          <div>
            <p className="font-[Space_Grotesk] text-lg font-semibold text-white">
              {profile?.full_name ?? 'Your account'}
            </p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="label-text" htmlFor="full_name">Full name</label>
            <input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field mt-1.5"
              disabled={saving}
            />
          </div>

          <div>
            <label className="label-text">Email</label>
            <div className="relative mt-1.5">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={user?.email ?? ''}
                readOnly
                className="input-field !pl-10 opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="label-text">Member since</label>
            <div className="relative mt-1.5">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={profile ? new Date(profile.created_at).toLocaleDateString() : ''}
                readOnly
                className="input-field !pl-10 opacity-60"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-300">{error}</p>
          )}
          {savedMsg && (
            <p className="text-sm text-emerald-300">Profile updated.</p>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Spinner /> : <Save size={16} />}
              Save changes
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-5 flex items-center justify-between p-6">
        <div>
          <h3 className="font-[Space_Grotesk] text-base font-semibold text-white">
            Sign out
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            End your current session on this device.
          </p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate({ name: 'home' });
          }}
          className="btn-ghost flex items-center gap-2"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}
