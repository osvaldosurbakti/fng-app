'use client'

import { Heart } from 'lucide-react'

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex items-center mb-2 sm:mb-0">
            <span>© {currentYear} Froze and Grill Data</span>
            <span className="mx-2">•</span>
            <span className="flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> in Indonesia
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>v1.0.0</span>
            <span className="hidden sm:block">•</span>
            <div className="flex space-x-3">
              <a href="/help" className="hover:text-gray-900 transition-colors">
                Bantuan
              </a>
              <a href="/contact" className="hover:text-gray-900 transition-colors">
                Kontak
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}