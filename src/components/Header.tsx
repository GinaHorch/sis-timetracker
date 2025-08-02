import { FC } from 'react'
import { Card, CardContent} from "@/components/ui/card"
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import logo from "@/assets/SIS-logo-small.jpg"

const Header: FC = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error logging out');
    } else {
      toast.success('Logged out successfully');
    }
  };

  return (
    <Card className="sticky top-0 z-50 border-none rounded-xl shadow-medium bg-gradient-to-r from-primary-800 to-primary-700 text-white">
      <CardContent className="max-w-7xl mx-auto px-6 py-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Section */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <img
                src={logo}
                alt="SIS logo"
                className="h-25 w-40 rounded-lg border-2 border-white/20 shadow-soft bg-white/10 p-0.5"
              />
            </div>
            <div className="block">
              <h1 className="text-xl font-semibold tracking-tight text-white">
                SIS Time Tracker
              </h1>
              <p className="text-xs text-primary-100 font-medium tracking-wide sm:block hidden">
                Social Research & Tech Solutions
              </p>
            </div>
          </div>

          {/* Right side - User menu with logout */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Header;
