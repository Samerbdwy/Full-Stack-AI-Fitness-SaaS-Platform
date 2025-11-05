import { motion } from 'framer-motion';
import { 
  Home, 
  Utensils, 
  BookOpen, 
  Heart, 
  X,
  Dumbbell,
  LogOut,
  Crown // 🆕 ADD CROWN ICON
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const { signOut } = useClerk();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/workouts', icon: Dumbbell, label: 'AI Workouts' },
    { path: '/nutrition', icon: Utensils, label: 'Nutrition' },
    { path: '/exercises', icon: BookOpen, label: 'Exercise Library' },
    { path: '/recovery', icon: Heart, label: 'Recovery' },
    { path: '/coaching', icon: Crown, label: 'Online Coaching' }, // 🆕 ADD ONLINE COACHING
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full w-64 bg-savage-steel border-r border-gray-800 p-4 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-savage-neon-green" />
          <span className="text-xl font-bold">FITAI</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-savage-neon-blue text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 text-gray-300 hover:bg-red-500 hover:text-white rounded-lg transition-all mt-auto"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </motion.div>
  );
};

export default Sidebar;