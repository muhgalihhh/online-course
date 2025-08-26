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

  const toggleSidebar = () => {
    setIsCollapsed((prev: boolean) => !prev)
  }

  const collapseSidebar = () => {
    setIsCollapsed(true)
  }

  const expandSidebar = () => {
    setIsCollapsed(false)
  }

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed))
    }
  }, [isCollapsed])

  return {
    isCollapsed,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
  }
}