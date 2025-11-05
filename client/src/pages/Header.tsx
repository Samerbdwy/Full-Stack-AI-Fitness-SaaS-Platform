// src/pages/Header.tsx
import { Menu } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useUser();

  return (
    <header className="bg-savage-steel border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-800 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        {/* Right Section - Cleaned up */}
        <div className="flex items-center gap-4">
          {/* 🔥 REMOVED: Notification and Settings buttons */}
          
          {/* Clerk User Button Only */}
          <div className="flex items-center gap-2">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  rootBox: "flex items-center",
                  userButtonAvatarBox: "w-8 h-8",
                  userButtonTrigger: "hover:bg-gray-800 rounded-lg p-2 transition-colors"
                }
              }}
            />
            <span className="hidden sm:block text-sm font-medium">
              {user?.firstName || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;