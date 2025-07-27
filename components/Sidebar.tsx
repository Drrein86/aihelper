'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useStore } from '@/store/useStore'

export default function Sidebar() {
  const [newTaskText, setNewTaskText] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  
  const { 
    tasks, 
    toggleTask, 
    addTask, 
    deleteTask,
    financial, 
    notifications, 
    markNotificationRead,
    addNotification 
  } = useStore()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleAddTask = () => {
    if (!newTaskText.trim()) return
    
    addTask({
      text: newTaskText,
      done: false,
      priority: 'medium',
      category: 'personal'
    })
    
    setNewTaskText('')
    setShowAddTask(false)
    
    // Add success notification
    addNotification({
      title: 'משימה נוספה',
      message: `המשימה "${newTaskText}" נוספה בהצלחה`,
      type: 'success',
      read: false
    })
  }

  const handlePayBill = (paymentId: number, billName: string, amount: number) => {
    // Simulate payment
    addNotification({
      title: 'תשלום בוצע',
      message: `תשלום ${billName} בסך ₪${amount} בוצע בהצלחה`,
      type: 'success',
      read: false
    })
  }

  const handleInvestment = () => {
    addNotification({
      title: 'המלצת השקעה',
      message: 'רוצה לקבל ייעוץ השקעות מותאם אישית?',
      type: 'info',
      read: false
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Tasks Card */}
      <motion.div 
        className="sidebar-card"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">✅ משימות היום</h3>
          <span className="text-xs bg-gradient-candy text-white px-2 py-1 rounded-full">
            {tasks.filter(t => !t.done).length}
          </span>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                task.done ? 'bg-gray-50 opacity-60' : 'bg-white'
              } hover:shadow-md transition-all duration-300`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-5 h-5 rounded-full border-2 ${
                  task.done 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-gray-300 hover:border-green-400'
                } transition-all duration-300`}
              >
                {task.done && <span className="text-white text-xs">✓</span>}
              </button>
              
              <div className="flex-1">
                <span className={`text-sm ${task.done ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.text}
                </span>
                <div className={`text-xs mt-1 px-2 py-1 rounded-full border inline-block ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'דחוף' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                </div>
              </div>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 text-sm transition-all duration-300"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
        
        {showAddTask ? (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="הקלד משימה חדשה..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddTask}
                className="flex-1 py-2 bg-gradient-candy text-white rounded-lg text-sm hover:scale-105 transition-all duration-300"
              >
                הוסף
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false)
                  setNewTaskText('')
                }}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-all duration-300"
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowAddTask(true)}
            className="w-full mt-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 text-sm transition-all duration-300"
          >
            + הוסף משימה
          </button>
        )}
      </motion.div>

      {/* Finance Card */}
      <motion.div 
        className="sidebar-card"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">💰 חשבונות ותשלומים</h3>
          <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">2</span>
        </div>
        
        <div className="space-y-3">
          {financial.upcomingPayments.map((payment) => (
            <div key={payment.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-red-800">{payment.name}</div>
                <div className="text-xs text-red-600">
                  {payment.dueDate.toLocaleDateString('he-IL')}
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-red-800">₪{payment.amount.toLocaleString()}</div>
                <button 
                  onClick={() => handlePayBill(payment.id, payment.name, payment.amount)}
                  className="text-xs text-red-600 hover:text-red-800 transition-all duration-300"
                >
                  שלם עכשיו
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800">💳 יתרה זמינה</div>
          <div className="text-xl font-bold text-green-800">₪{financial.balance.toLocaleString()}</div>
          <div className="text-xs text-green-600">מתקציב של ₪{financial.monthlyBudget.toLocaleString()}</div>
        </div>
      </motion.div>

      {/* Investment Card */}
      <motion.div 
        className="sidebar-card"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📈 השקעות</h3>
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">+2.4%</span>
        </div>
        
        <div className="space-y-3">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
            <div className="text-2xl font-bold text-gray-800">₪{financial.investments.toLocaleString()}</div>
            <div className="text-sm text-gray-600">סך השקעות</div>
            <div className={`text-xs mt-1 ${financial.investmentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financial.investmentChange >= 0 ? '+' : ''}₪{Math.round(financial.investments * financial.investmentChange / 100)} השבוע ({financial.investmentChange}%)
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">💡 המלצת היום</div>
            <div className="text-xs text-blue-600 mt-1">
              מדד נאסד״ק עלה 2%. רוצה להשקיע ₪500 נוספים?
            </div>
            <button 
              onClick={handleInvestment}
              className="mt-2 w-full py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-all duration-300"
            >
              קבל ייעוץ
            </button>
          </div>
        </div>
      </motion.div>

      {/* AI Recommendation Card */}
      <motion.div 
        className="sidebar-card animate-float"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">💡 המלצת היום</h3>
          <span className="text-xl">🤖</span>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-800 font-medium mb-2">
            "היום כדאי שתזמין פרחים לאשתך 🌹"
          </div>
          <div className="text-xs text-purple-600 mb-3">
            ראיתי שיום ההולדת שלה מתקרב, ואתה בדרך כלל שוכח...
          </div>
          <button className="w-full py-2 bg-gradient-candy text-white text-sm rounded-lg hover:scale-105 transition-all duration-300">
            תזמן עכשיו
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div 
        className="sidebar-card"
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">🔔 התראות</h3>
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.slice(0, 5).map((notification) => (
            <motion.div 
              key={notification.id}
              className={`flex items-start space-x-3 p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                notification.read ? 'bg-gray-50 opacity-60' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => markNotificationRead(notification.id)}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-lg">
                {notification.type === 'success' ? '✅' : 
                 notification.type === 'warning' ? '⚠️' : 
                 notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <div className="flex-1">
                <div className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                  {notification.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {notification.message}
                </div>
                <div className="text-xs text-gray-400">
                  {notification.timestamp.toLocaleString('he-IL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </motion.div>
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
              אין התראות חדשות 🎉
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 