'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  ShoppingCart, 
  BarChart3, 
  Package,
  Users,
  X
} from 'lucide-react'

interface SidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Sidebar({ onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Penjualan', href: '/dashboard/sales', icon: ShoppingCart },
    { name: 'Produk', href: '/dashboard/products', icon: Package },
    { name: 'Laporan', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Customer', href: '/dashboard/customers', icon: Users },
  ]

  const handleItemClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  return (
    <div className={`bg-white shadow-lg h-full flex flex-col ${
      isMobile ? 'w-64' : 'w-64'
    }`}>
      {/* Header dengan Close Button untuk Mobile */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b">
        <h1 className="text-xl font-bold text-gray-800 truncate">Froze and Grill Data</h1>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-2 lg:p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleItemClick}
                className={`flex items-center px-3 py-3 text-sm font-medium transition-all rounded-lg ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

    </div>
  )
}