import { FC, useState, useEffect } from 'react'
import { Card, CardContent} from "@/components/ui/card"
import { supabase } from '../supabaseClient'
import { toast } from 'sonner'
import logo from "@/assets/SIS-logo-small.jpg"

const Header: FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };

    getCurrentUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error logging out');
    } else {
      toast.success('Logged out successfully');
    }
    setDropdownOpen(false);
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

          {/* Right side - User dropdown */}
          <div className="flex items-center">
            {userEmail && (
              <div className="relative">
                {/* User dropdown trigger */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 group"
                >
                  {/* User avatar */}
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  
                  {/* User email - hidden on mobile */}
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm text-white/90 font-medium leading-tight">
                      {userEmail.split('@')[0]}
                    </span>
                    <span className="text-xs text-white/60 leading-tight">
                      {userEmail.split('@')[1]}
                    </span>
                  </div>
                  
                  {/* Dropdown arrow */}
                  <svg 
                    className={`w-4 h-4 text-white/60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    
                    {/* Dropdown content */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 overflow-hidden">
                      {/* User info section */}
                      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                        <p className="text-sm font-medium text-neutral-900">Signed in as</p>
                        <p className="text-sm text-neutral-600 truncate">{userEmail}</p>
                      </div>
                      
                      {/* Logout button */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Header;
