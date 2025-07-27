'use client'

import { GoogleAuth } from 'google-auth-library'

// Google OAuth Config
export const GOOGLE_CONFIG = {
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
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

// אחסון וקריאת tokens מ-localStorage
export const tokenStorage = {
  set: (tokens: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_tokens', JSON.stringify(tokens))
    }
  },
  
  get: () => {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem('google_tokens')
      return tokens ? JSON.parse(tokens) : null
    }
    return null
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_tokens')
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