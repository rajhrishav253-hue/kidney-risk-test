import { Activity, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, type Route } from '@/lib/router';

const navItems: { label: string; route: Route; authRequired?: boolean }[] = [
  { label: 'Home', route: { name: 'home' } },
  { label: 'Assessment', route: { name: 'assessment' }, authRequired: true },
  { label: 'Dashboard', route: { name: 'dashboard' }, authRequired: true },
  { label: 'History', route: { name: 'history' }, authRequired: true },
  { label: 'Profile', route: { name: 'profile' }, authRequired: true },
  { label: 'Disclaimer', route: { name: 'disclaimer' } },
];

export function NavBar() {
  const { user, profile, signOut } = useAuth();
  const { route, navigate } = useRouter();
  const [open, setOpen] = useState(false);

  const items = navItems.filter((i) => !i.authRequired || user);

  const isActive = (r: Route) => r.name === route.name;

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#030711]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <button
          onClick={() => navigate({ name: 'home' })}
          className="flex items-center gap-2.5 transition hover:opacity-90"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-[#04111f]">
            <Activity size={20} strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-[Space_Grotesk] text-base font-bold tracking-tight text-white">
              AI KidneyGuard
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/60">
              Risk Assessment
            </span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                isActive(item.route)
                  ? 'bg-cyan-400/10 text-cyan-200'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-400">
                {profile?.full_name ?? user.email}
              </span>
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ name: 'home' });
                }}
                className="btn-ghost flex items-center gap-1.5 !px-3 !py-2 text-sm"
              >
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate({ name: 'login' })}
                className="btn-ghost !px-4 !py-2 text-sm"
              >
                Log in
              </button>
              <button
                onClick={() => navigate({ name: 'register' })}
                className="btn-primary !px-4 !py-2 text-sm"
              >
                Get started
              </button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-cyan-200 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-cyan-500/10 bg-[#030711]/95 px-5 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.route);
                  setOpen(false);
                }}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive(item.route)
                    ? 'bg-cyan-400/10 text-cyan-200'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? (
                <button
                  onClick={async () => {
                    await signOut();
                    setOpen(false);
                    navigate({ name: 'home' });
                  }}
                  className="btn-ghost flex-1 !py-2.5 text-sm"
                >
                  Sign out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate({ name: 'login' });
                      setOpen(false);
                    }}
                    className="btn-ghost flex-1 !py-2.5 text-sm"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      navigate({ name: 'register' });
                      setOpen(false);
                    }}
                    className="btn-primary flex-1 !py-2.5 text-sm"
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { navigate } = useRouter();
  return (
    <footer className="border-t border-cyan-500/10 bg-[#030711]/60 px-5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-white">AI KidneyGuard</p>
          <p className="mt-1 max-w-md text-xs text-slate-400">
            An educational ML risk-assessment prototype. Not a medical device.
            Not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
        <div className="flex gap-4 text-xs text-slate-400">
          <button onClick={() => navigate({ name: 'disclaimer' })} className="hover:text-cyan-300">
            Disclaimer
          </button>
          <button onClick={() => navigate({ name: 'home' })} className="hover:text-cyan-300">
            Home
          </button>
        </div>
      </div>
    </footer>
  );
}
