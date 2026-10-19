import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'assessment' }
  | { name: 'dashboard' }
  | { name: 'history' }
  | { name: 'profile' }
  | { name: 'disclaimer' };

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  switch (hash) {
    case 'login':
      return { name: 'login' };
    case 'register':
      return { name: 'register' };
    case 'assessment':
      return { name: 'assessment' };
    case 'dashboard':
      return { name: 'dashboard' };
    case 'history':
      return { name: 'history' };
    case 'profile':
      return { name: 'profile' };
    case 'disclaimer':
      return { name: 'disclaimer' };
    default:
      return { name: 'home' };
  }
}

function routeToHash(route: Route): string {
  return `#/${route.name}`;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (next: Route) => {
    const target = routeToHash(next);
    if (window.location.hash !== target) {
      window.location.hash = target;
    } else {
      setRoute(next);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
