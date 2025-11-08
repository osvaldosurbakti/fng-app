'use client'

import { useState } from 'react'
import Header from './Header'
import MobileSidebarHandler from './MobileSidebarHandler'
import Sidebar from './Sidebar'
import Footer from './Footer' // Pilih salah satu footer di atas

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <>
      {/* Mobile Sidebar */}
      <MobileSidebarHandler 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
      />
      
      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={closeSidebar} isMobile={true} />
      </div>

      {/* Main Content Area dengan Footer */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header onMenuToggle={toggleSidebar} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}