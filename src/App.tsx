import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
// import Dashboard from './pages/Dashboard';
import RedesignedDashboard from './pages/RedesignedDashboard';
import LoginPage from './pages/Auth';
import { Toaster } from './components/ui/sonner';
import { Progress } from './components/ui/progress';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

 if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Progress className="h-2 bg-primary-100" />
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <>
    <Toaster />
    <div className="min-h-screen bg-gray-50">
      {user ? <RedesignedDashboard /> : <LoginPage />}
    </div>
    </>
  );
}
