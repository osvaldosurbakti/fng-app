// components/Header.tsx
'use client';

import { Calendar, Bell, User, Menu, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/'); // Redirect ke homepage setelah logout
  };

  if (status === 'loading') {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="animate-pulse bg-gray-200 h-6 w-40 rounded"></div>
          </div>
          <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left Section - Menu Button & Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              Welcome, {session?.user?.name || 'User'}!
            </h1>
            <p className="text-gray-500 flex items-center mt-1 text-sm">
              <Calendar className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">{currentDate}</span>
              <span className="mx-2">•</span>
              <span className="capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                {session?.user?.role || 'user'}
              </span>
            </p>
          </div>
        </div>
        
        {/* Right Section - Notifications & User */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-sm font-medium text-gray-700 block">
                {session?.user?.name || 'Admin'}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {session?.user?.role || 'admin'}
              </span>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              aria-label="Sign out"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}