'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  ShoppingCart, 
  BarChart3, 
  Package,
  Users
} from 'lucide-react'

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Penjualan', href: '/dashboard/sales', icon: ShoppingCart },
    { name: 'Produk', href: '/dashboard/products', icon: Package },
    { name: 'Laporan', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Customer', href: '/dashboard/customers', icon: Users },
  ]

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">POS System</h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}