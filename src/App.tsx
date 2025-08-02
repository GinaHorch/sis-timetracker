import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import RedesignedDashboard from './pages/RedesignedDashboard';
import LoginPage from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
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
    <Router>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/reset-password" 
            element={<ResetPassword />} 
          />
          <Route 
            path="/" 
            element={user ? <RedesignedDashboard /> : <LoginPage />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <RedesignedDashboard /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}
