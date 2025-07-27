import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'עוזר חכם - הדשבורד האישי שלי',
  description: 'העוזר שחושב בשבילך - ניהול זמן, משימות, פיננסים והמלצות חכמות',
  keywords: ['דשבורד', 'עוזר חכם', 'AI', 'ניהול זמן', 'פיננסים'],
  authors: [{ name: 'Smart Dashboard Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ec4899" />
      </head>
      <body className="font-hebrew bg-gradient-soft min-h-screen">
        <div id="root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 