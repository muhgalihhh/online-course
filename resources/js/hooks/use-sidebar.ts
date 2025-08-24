import { useState, useEffect } from 'react'

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage for saved state
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-sidebar-collapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev)
  }

  const collapseSidebar = () => {
    setIsCollapsed(true)
  }

  const expandSidebar = () => {
    setIsCollapsed(false)
  }

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }, [isMobile])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed))
    }
  }, [isCollapsed])

  return {
    isCollapsed,
    isMobile,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
  }
}