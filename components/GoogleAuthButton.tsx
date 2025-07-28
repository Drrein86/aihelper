'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { getGoogleAuthUrl, isAuthenticated, logout } from '@/services/google-auth'
import { useStore } from '@/store/useStore'

interface GoogleAuthButtonProps {
  className?: string
}

export default function GoogleAuthButton({ className }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const authenticated = isAuthenticated()
  const { user } = useStore()

  const handleGoogleLogin = () => {
    setLoading(true)
    const authUrl = getGoogleAuthUrl()
    window.location.href = authUrl
  }

  const handleLogout = () => {
    logout()
  }

  if (authenticated && user.isGoogleConnected) {
    return (
      <div className="flex items-center gap-2">
        {/* פרופיל משתמש */}
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg border border-green-200">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs font-medium text-green-700">{user.given_name || user.name}</span>
        </div>
        
        {/* כפתור התנתקות */}
        <motion.button
          onClick={handleLogout}
          className={`flex items-center space-x-1 px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200 text-xs ${className}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="התנתק מ-Google"
        >
          <span className="text-xs">🚪</span>
        </motion.button>
      </div>
    )
  }

  return (
    <motion.button
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-bold disabled:opacity-50 ${className}`}
      whileHover={{ scale: loading ? 1 : 1.05 }}
      whileTap={{ scale: loading ? 1 : 0.95 }}
    >
      <span>📧</span>
      <span>{loading ? 'מתחבר...' : 'התחבר ל-Google'}</span>
    </motion.button>
  )
} 