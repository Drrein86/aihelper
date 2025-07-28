'use client'

import { GoogleAuth } from 'google-auth-library'

// Google OAuth Config
export const GOOGLE_CONFIG = {
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 
    (typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : 'http://localhost:3000/api/auth/callback'),
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ')
}

// יצירת URL לאימות Google
export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.client_id || '',
    redirect_uri: GOOGLE_CONFIG.redirect_uri || '',
    scope: GOOGLE_CONFIG.scope,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  })
  
  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`
}

// Exchange code for tokens
export async function exchangeCodeForTokens(code: string) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CONFIG.client_id || '',
        client_secret: GOOGLE_CONFIG.client_secret || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_CONFIG.redirect_uri || '',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    return await response.json()
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    throw error
  }
}

// אחסון וקריאת tokens מ-cookies ו-localStorage
export const tokenStorage = {
  set: (tokens: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_tokens', JSON.stringify(tokens))
      // גם בקוקיז כגיבוי
      document.cookie = `google_tokens=${JSON.stringify(tokens)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
    }
  },
  
  get: () => {
    if (typeof window !== 'undefined') {
      // נסה קודם מ-localStorage
      let tokens = localStorage.getItem('google_tokens')
      if (tokens) {
        return JSON.parse(tokens)
      }
      
      // אם לא, נסה מהקוקיז
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('google_tokens='))
      if (tokenCookie) {
        try {
          const tokenValue = tokenCookie.split('=')[1]
          tokens = decodeURIComponent(tokenValue)
          // שמור גם ב-localStorage
          localStorage.setItem('google_tokens', tokens)
          return JSON.parse(tokens)
        } catch (error) {
          console.error('Failed to parse tokens from cookie:', error)
        }
      }
    }
    return null
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_tokens')
      // נקה גם את הקוקי
      document.cookie = 'google_tokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }
}

// בדיקה אם המשתמש מחובר
export function isAuthenticated(): boolean {
  const tokens = tokenStorage.get()
  return tokens && tokens.access_token
}

// התנתקות
export function logout() {
  tokenStorage.clear()
  window.location.href = '/'
} 