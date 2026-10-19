import { AuthProvider, useAuth } from '@/lib/auth';
import { RouterProvider, useRouter, type Route } from '@/lib/router';
import { NavBar, Footer } from '@/components/NavBar';
import { FullPageSpinner } from '@/components/ui';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { AssessmentPage } from '@/pages/AssessmentPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DisclaimerPage } from '@/pages/DisclaimerPage';

const protectedRoutes: Route['name'][] = ['assessment', 'dashboard', 'history', 'profile'];
const authRoutes: Route['name'][] = ['login', 'register'];

function RouteRenderer() {
  const { route, navigate } = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">
          <FullPageSpinner label="Loading your session…" />
        </main>
        <Footer />
      </div>
    );
  }

  const isProtected = protectedRoutes.includes(route.name);
  const isAuthRoute = authRoutes.includes(route.name);

  if (isProtected && !user) {
    navigate({ name: 'login' });
    return null;
  }
  if (isAuthRoute && user) {
    navigate({ name: 'dashboard' });
    return null;
  }

  let page: React.ReactNode;
  switch (route.name) {
    case 'home':
      page = <HomePage />;
      break;
    case 'login':
      page = <AuthPage mode="login" />;
      break;
    case 'register':
      page = <AuthPage mode="register" />;
      break;
    case 'assessment':
      page = <AssessmentPage />;
      break;
    case 'dashboard':
      page = <DashboardPage />;
      break;
    case 'history':
      page = <HistoryPage />;
      break;
    case 'profile':
      page = <ProfilePage />;
      break;
    case 'disclaimer':
      page = <DisclaimerPage />;
      break;
    default:
      page = <HomePage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{page}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <RouteRenderer />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
