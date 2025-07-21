import Dashboard from './pages/Dashboard';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <>
    <Toaster />
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
    </div>
    </>
  );
}
