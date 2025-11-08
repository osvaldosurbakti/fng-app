'use client'

import { useEffect } from 'react'
import Sidebar from './Sidebar'

interface MobileSidebarHandlerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebarHandler({ isOpen, onClose }: MobileSidebarHandlerProps) {
  // Close sidebar when clicking on overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle effects
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    // Prevent body scroll when sidebar is open
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = 'unset'
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={handleOverlayClick}
      />
    </>
  )
}