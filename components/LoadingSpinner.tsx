'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = 'חושב...' }: LoadingSpinnerProps) {
  return (
    <motion.div 
      className="flex items-center space-x-2 text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex space-x-1">
        <motion.div
          className="w-2 h-2 bg-pink-500 rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="w-2 h-2 bg-purple-500 rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0.1
          }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: 0.2
          }}
        />
      </div>
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  )
} 