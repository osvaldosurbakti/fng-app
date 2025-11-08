import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'Sistem Penjualan - Dashboard',
  description: 'Dashboard sistem pencatatan penjualan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ fontFamily: 'Inter, sans-serif' }} className="h-full">
        <div className="min-h-full flex bg-zinc-50 dark:bg-black">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex">
            <Sidebar />
          </div>
          
          {/* Client Layout Wrapper */}
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  )
}