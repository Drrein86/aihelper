import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Types
export interface Task {
  id: number
  text: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
  category: 'personal' | 'business' | 'financial'
  dueDate?: Date
  createdAt: Date
}

export interface Event {
  id: number
  title: string
  time: string
  date: Date
  type: 'meeting' | 'task' | 'payment' | 'personal'
  duration?: number
  location?: string
  description?: string
}

export interface FinancialData {
  balance: number
  investments: number
  investmentChange: number
  monthlyBudget: number
  portfolio: {
    stocks: number
    bonds: number
    crypto: number
    realEstate: number
    cash: number
  }
  performanceHistory: number[]
  riskLevel: 'low' | 'medium' | 'high'
  monthlyIncome: number
  monthlyExpenses: number
  savingsGoal: number
  upcomingPayments: Array<{
    id: number
    name: string
    amount: number
    dueDate: Date
    type: 'bill' | 'subscription' | 'insurance'
  }>
  financialGoals: Array<{
    id: number
    name: string
    targetAmount: number
    currentAmount: number
    targetDate: Date
    priority: 'high' | 'medium' | 'low'
  }>
}

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export interface UserProfile {
  name: string
  preferences: {
    theme: 'light' | 'dark'
    language: 'he' | 'en'
    notifications: boolean
    aiPersonality: 'professional' | 'friendly' | 'humorous'
  }
}

interface AppState {
  // User
  user: UserProfile
  setUser: (user: Partial<UserProfile>) => void
  
  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: number, updates: Partial<Task>) => void
  deleteTask: (id: number) => void
  toggleTask: (id: number) => void
  
  // Events
  events: Event[]
  addEvent: (event: Omit<Event, 'id'>) => void
  updateEvent: (id: number, updates: Partial<Event>) => void
  deleteEvent: (id: number) => void
  
  // Financial
  financial: FinancialData
  updateFinancial: (updates: Partial<FinancialData>) => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markNotificationRead: (id: number) => void
  clearNotifications: () => void
  
  // UI State
  activeView: 'dashboard' | 'calendar' | 'tasks' | 'finance' | 'settings'
  setActiveView: (view: AppState['activeView']) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Chat
  chatMessages: Array<{
    id: number
    text: string
    isUser: boolean
    timestamp: Date
  }>
  addChatMessage: (message: Omit<AppState['chatMessages'][0], 'id' | 'timestamp'>) => void
  clearChat: () => void
}

export const useStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial User Data
    user: {
      name: 'אליאור',
      preferences: {
        theme: 'light',
        language: 'he',
        notifications: true,
        aiPersonality: 'friendly'
      }
    },
    setUser: (user) => set((state) => ({ 
      user: { ...state.user, ...user } 
    })),

    // Initial Tasks
    tasks: [
      {
        id: 1,
        text: 'שלח מייל למיקי',
        done: false,
        priority: 'high',
        category: 'business',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      },
      {
        id: 2,
        text: 'תשלום חשמל',
        done: false,
        priority: 'medium',
        category: 'financial',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
      },
      {
        id: 3,
        text: 'פגישה עם יועץ השקעות',
        done: true,
        priority: 'high',
        category: 'financial',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      },
      {
        id: 4,
        text: 'קניות לסוף השבוע',
        done: false,
        priority: 'low',
        category: 'personal',
        createdAt: new Date(),
      },
      {
        id: 5,
        text: 'תזכורת יום הולדת אמא',
        done: false,
        priority: 'high',
        category: 'personal',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) // 12 days from now
      }
    ],
    addTask: (task) => set((state) => ({
      tasks: [...state.tasks, {
        ...task,
        id: Math.max(...state.tasks.map(t => t.id)) + 1,
        createdAt: new Date()
      }]
    })),
    updateTask: (id, updates) => set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    })),
    deleteTask: (id) => set((state) => ({
      tasks: state.tasks.filter(task => task.id !== id)
    })),
    toggleTask: (id) => set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, done: !task.done } : task
      )
    })),

    // Initial Events
    events: [
      {
        id: 1,
        title: 'פגישה עם משי',
        time: '14:00',
        date: new Date(),
        type: 'meeting',
        duration: 60,
        location: 'משרד',
        description: 'דיון על פרויקט חדש'
      },
      {
        id: 2,
        title: 'שיחת זום עם הצוות',
        time: '10:30',
        date: new Date(),
        type: 'meeting',
        duration: 30,
        location: 'זום'
      },
      {
        id: 3,
        title: 'תשלום חשמל',
        time: '16:00',
        date: new Date(),
        type: 'payment',
        duration: 15
      },
      {
        id: 4,
        title: 'אימון כושר',
        time: '18:00',
        date: new Date(),
        type: 'personal',
        duration: 60,
        location: 'חדר כושר'
      },
      {
        id: 5,
        title: 'סיום פרויקט A',
        time: '12:00',
        date: new Date(),
        type: 'task',
        duration: 120
      },
      {
        id: 6,
        title: 'ארוחת צהריים עם רועי',
        time: '13:30',
        date: new Date(),
        type: 'personal',
        duration: 90,
        location: 'מסעדת הסושי'
      },
      {
        id: 7,
        title: 'פגישה עם רואה חשבון',
        time: '09:00',
        date: new Date(),
        type: 'meeting',
        duration: 45,
        location: 'משרד רו"ח'
      },
      {
        id: 8,
        title: 'תשלום ביטוח רכב',
        time: '11:00',
        date: new Date(),
        type: 'payment',
        duration: 10
      },
      {
        id: 9,
        title: 'חזרה על מצגת',
        time: '15:30',
        date: new Date(),
        type: 'task',
        duration: 30
      },
      {
        id: 10,
        title: 'שיחה עם אמא',
        time: '20:00',
        date: new Date(),
        type: 'personal',
        duration: 30,
        location: 'טלפון'
      },
      // Tomorrow's events
      {
        id: 11,
        title: 'פגישת בוקר עם מנהל',
        time: '08:30',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'meeting',
        duration: 45,
        location: 'משרד'
      },
      {
        id: 12,
        title: 'סדנה על AI',
        time: '14:00',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'task',
        duration: 180,
        location: 'מרכז ההשקעות'
      },
      {
        id: 13,
        title: 'רופא שיניים',
        time: '16:30',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'personal',
        duration: 60,
        location: 'מרפאה'
      }
    ],
    addEvent: (event) => set((state) => ({
      events: [...state.events, {
        ...event,
        id: Math.max(...state.events.map(e => e.id)) + 1
      }]
    })),
    updateEvent: (id, updates) => set((state) => ({
      events: state.events.map(event => 
        event.id === id ? { ...event, ...updates } : event
      )
    })),
    deleteEvent: (id) => set((state) => ({
      events: state.events.filter(event => event.id !== id)
    })),

    // Initial Financial Data
    financial: {
      balance: 3500,
      investments: 12400,
      investmentChange: 2.4,
      monthlyBudget: 8000,
      portfolio: {
        stocks: 5000,
        bonds: 3000,
        crypto: 2000,
        realEstate: 1000,
        cash: 1000
      },
      performanceHistory: [1000, 1050, 1100, 1150, 1200],
      riskLevel: 'medium',
      monthlyIncome: 5000,
      monthlyExpenses: 3000,
      savingsGoal: 10000,
      upcomingPayments: [
        {
          id: 1,
          name: 'חשמל',
          amount: 450,
          dueDate: new Date(2024, 11, 28),
          type: 'bill'
        },
        {
          id: 2,
          name: 'ביטוח רכב',
          amount: 1200,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          type: 'insurance'
        }
      ],
             financialGoals: [
         {
           id: 1,
           name: 'קרן חירום',
           targetAmount: 50000,
           currentAmount: 18000,
           targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
           priority: 'high'
         },
         {
           id: 2,
           name: 'מכונית חדשה',
           targetAmount: 120000,
           currentAmount: 45000,
           targetDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months from now
           priority: 'medium'
         },
         {
           id: 3,
           name: 'דירה להשקעה',
           targetAmount: 800000,
           currentAmount: 120000,
           targetDate: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000), // 24 months from now
           priority: 'high'
         }
       ]
    },
    updateFinancial: (updates) => set((state) => ({
      financial: { ...state.financial, ...updates }
    })),

    // Initial Notifications
    notifications: [
      {
        id: 1,
        title: 'יועץ AI מתקדם זמין! 🧠',
        message: 'המערכת הפיננסית החכמה שלך מוכנה לעבודה עם ניתוח סיכונים והמלצות השקעה',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        read: false
      },
      {
        id: 2,
        title: 'הזדמנות השקעה חמה! 🚀',
        message: 'ETF טכנולוגיה עלה 12% השבוע - כדאי לשקול השקעה',
        type: 'info',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false
      },
      {
        id: 3,
        title: 'התראת סיכון ⚠️',
        message: 'הפיזור בתיק ההשקעות שלך נמוך - מומלץ לגוון',
        type: 'warning',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false
      },
      {
        id: 4,
        title: 'מטרה כספית קרובה! 🎯',
        message: 'קרן החירום שלך הגיעה ל-36% - כל הכבוד!',
        type: 'success',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: false
      },
      {
        id: 5,
        title: 'עדכון השקעות 📈',
        message: 'תיק ההשקעות שלך עלה ב-2.4% השבוע - ₪298 רווח',
        type: 'success',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true
      },
      {
        id: 6,
        title: 'תזכורת תשלום 💸',
        message: 'ביטוח רכב - ₪1,200 יפקע בעוד 5 ימים',
        type: 'warning',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        read: false
      }
    ],
    addNotification: (notification) => set((state) => ({
      notifications: [...state.notifications, {
        ...notification,
        id: Math.max(...state.notifications.map(n => n.id)) + 1,
        timestamp: new Date()
      }]
    })),
    markNotificationRead: (id) => set((state) => ({
      notifications: state.notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    })),
    clearNotifications: () => set({ notifications: [] }),

    // Initial UI State
    activeView: 'dashboard',
    setActiveView: (view) => set({ activeView: view }),
    sidebarOpen: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    // Initial Chat
    chatMessages: [
      {
        id: 1,
        text: 'שלום אליאור! 👋 אני העוזר החכם שלך. מה אפשר לעזור לך היום?',
        isUser: false,
        timestamp: new Date()
      }
    ],
    addChatMessage: (message) => set((state) => ({
      chatMessages: [...state.chatMessages, {
        ...message,
        id: Math.max(...state.chatMessages.map(m => m.id)) + 1,
        timestamp: new Date()
      }]
    })),
    clearChat: () => set({
      chatMessages: [{
        id: 1,
        text: 'שלום אליאור! 👋 אני העוזר החכם שלך. מה אפשר לעזור לך היום?',
        isUser: false,
        timestamp: new Date()
      }]
    })
  }))
) 