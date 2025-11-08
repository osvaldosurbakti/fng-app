'use client'

import { Calendar, Bell, User, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 flex items-center mt-1 text-sm">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{currentDate}</span>
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
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}