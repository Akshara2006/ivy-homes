import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'
import { CompareProvider } from '@/context/CompareContext'
import { QueryProvider } from '@/context/QueryProvider'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ivy Homes — Property Discovery Atelier & Fair-Value Explorer',
  description: '100% verified residences at algorithmic fair value. 120-point engineering inspection, 0% brokerage, complete pricing transparency.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#FAF8F5] text-ink-900 antialiased selection:bg-brand-100 selection:text-brand-900" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <CompareProvider>
              {children}
            </CompareProvider>
            <Toaster
              position="bottom-right"
              richColors
              theme="light"
              toastOptions={{
                style: {
                  background: '#FFFFFF',
                  border: '1px solid #E8E2D5',
                  color: '#141C17',
                  boxShadow: '0 10px 30px -10px rgba(10, 52, 35, 0.15)',
                  fontFamily: 'var(--font-sans)',
                  borderRadius: '12px',
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
