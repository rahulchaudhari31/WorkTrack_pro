import React from 'react';
import { Menu, Sun, Moon, Bell, LogOut } from 'lucide-react';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { dark, toggle }  = useTheme();
  const navigate          = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleNotificationClick = () => {
    toast('No new notifications', { icon: '🔔' });
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200
                       dark:border-gray-800 flex items-center px-4 gap-3 z-10 sticky top-0">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      <div className="flex-1" />

      <button
        onClick={toggle}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {dark
          ? <Sun  className="w-5 h-5 text-yellow-500" />
          : <Moon className="w-5 h-5 text-gray-600" />
        }
      </button>

      <button 
        onClick={handleNotificationClick}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600
                   dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20
                   hover:text-red-600 dark:hover:text-red-400 transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:block">Logout</span>
      </button>
    </header>
  );
};

export default Navbar;
