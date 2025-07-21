import { FC } from 'react'
import { Card, CardContent} from "@/components/ui/card"
import logo from "@/assets/SIS-logo-small.jpg"

const Header: FC = () => {
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

          {/* Right side - can be used for navigation, user menu, etc. */}
          <div className="flex items-center space-x-4">
            {/* Optional: Add navigation items or user menu here */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Future: Navigation items */}
            </div>
            
            {/* Optional: User avatar or menu button */}
            <div className="flex items-center">
              {/* Future: User profile or settings button */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Header;
