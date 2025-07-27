'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { getGoogleAuthUrl, isAuthenticated, logout } from '@/services/google-auth'

interface GoogleAuthButtonProps {
  className?: string
}

export default function GoogleAuthButton({ className }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const authenticated = isAuthenticated()

  const handleGoogleLogin = () => {
    setLoading(true)
    const authUrl = getGoogleAuthUrl()
    window.location.href = authUrl
  }

  const handleLogout = () => {
    logout()
  }

  if (authenticated) {
    return (
      <motion.button
        onClick={handleLogout}
        className={`flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-bold ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>🚪</span>
        <span>התנתק מ-Google</span>
      </motion.button>
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