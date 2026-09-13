'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const DEMO_PERSONAS = [
  { email: 'demo1@ivy.homes', label: 'Demo 1: Buyer', role: 'First-time Homebuyer' },
  { email: 'demo2@ivy.homes', label: 'Demo 2: Investor', role: 'High-Yield Portfolio' },
  { email: 'demo3@ivy.homes', label: 'Demo 3: Relocator', role: 'Tech Corridor Move' },
]

export function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('demo1@ivy.homes')
  const [password, setPassword] = useState(() => {
    return (
      process.env.NEXT_PUBLIC_DEMO_PASSWORD ||
      (typeof window !== 'undefined' ? localStorage.getItem('ivy_demo_password') || '' : '') ||
      'a611f561de'
    )
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password || 'a611f561de')
      if (typeof window !== 'undefined' && password) {
        localStorage.setItem('ivy_demo_password', password)
      }
      toast.success('Welcome back to Ivy Homes!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (userEmail: string) => {
    setEmail(userEmail)
    const pass = 'a611f561de'
    setPassword(pass)
    setLoading(true)
    try {
      await login(userEmail, pass)
      if (typeof window !== 'undefined') {
        localStorage.setItem('ivy_demo_password', pass)
      }
      toast.success('Welcome back to Ivy Homes!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white border border-border-subtle rounded-3xl shadow-atelier overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Architectural Editorial Showcase (5 cols) */}
        <div className="hidden lg:relative lg:flex lg:col-span-5 flex-col justify-between p-10 bg-brand-950 text-white overflow-hidden">
          {/* Background image with architectural overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/residence-1.jpg"
              alt="Modern Architecture"
              fill
              className="object-cover opacity-35"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/80 to-brand-900/60" />
          </div>

          {/* Top Brand Identity */}
          <div className="relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-brand-800 border border-brand-700 flex items-center justify-center shadow-md mb-4">
              <span className="font-serif font-bold text-xl text-brass-400">IV</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              Ivy Homes
            </h2>
            <p className="text-brand-300 text-xs tracking-wider uppercase font-semibold mt-1">
              Property Discovery Atelier
            </p>
          </div>

          {/* Center Architectural Quote */}
          <div className="relative z-10 my-auto py-8">
            <blockquote className="text-xl font-serif font-medium leading-relaxed text-brand-100">
              “A home shouldn’t come with hidden compromises. Verified inspections, zero brokerage, and algorithmic fair value.”
            </blockquote>
            <div className="mt-4 flex items-center gap-2 text-xs text-brass-400 font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>120-Point Technical Verification</span>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 pt-6 border-t border-brand-800/80 grid grid-cols-2 gap-4 text-xs text-brand-200">
            <div>
              <span className="block font-bold font-mono text-base text-white">0%</span>
              <span className="text-[11px] text-brand-300">Brokerage Platform</span>
            </div>
            <div>
              <span className="block font-bold font-mono text-base text-white">100%</span>
              <span className="text-[11px] text-brand-300">Clean Legal Titles</span>
            </div>
          </div>
        </div>

        {/* Right Column: Atelier Sign In Box (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 block mb-1">
                Account Sign In
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-950 tracking-tight">
                Welcome to the Atelier
              </h1>
              <p className="text-sm text-ink-500 mt-1.5">
                Sign in to unlock full inspection reports, property comparisons, and verified seller coordinates.
              </p>
            </div>

            {/* Quick One-Click Demo Personas */}
            <div className="mb-6 p-4 rounded-2xl bg-[#FAF8F5] border border-border-subtle">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brass-600" />
                  Instant Demo Access
                </span>
                <span className="text-[11px] text-ink-400 font-medium">1-Click Auto Fill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_PERSONAS.map((p) => (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => quickLogin(p.email)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      email === p.email
                        ? 'bg-brand-50 border-brand-500 text-brand-900 font-semibold shadow-xs'
                        : 'bg-white border-border-subtle hover:border-brand-300 text-ink-700'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{p.label}</span>
                    <span className="block text-[10px] text-ink-500 truncate">{p.role}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="demo1@ivy.homes"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full mt-2 font-semibold shadow-atelier"
              >
                {loading ? 'Authenticating...' : 'Sign In to Explorer'}
              </Button>

              <div className="text-center text-[11px] text-ink-500 mt-2">
                <span>Demo credentials are pre-configured. Click any persona above for 1-click instant login.</span>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-ink-400">
              <span>All sessions authenticated and encrypted via Next.js Proxy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
