'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCompare } from '@/context/CompareContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Home,
  Building2,
  KeyRound,
  Heart,
  BarChart3,
  LogOut,
  GitCompareArrows,
  ShieldCheck,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Resale Homes', icon: Home },
  { href: '/rentals', label: 'Rentals', icon: KeyRound },
  { href: '/projects', label: 'New Launches', icon: Building2 },
  { href: '/compare', label: 'Compare', icon: GitCompareArrows },
  { href: '/insights', label: 'Intelligence', icon: BarChart3 },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { items: compareItems } = useCompare()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-subtle transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-800 text-white flex items-center justify-center shadow-atelier transition-transform duration-300 group-hover:scale-105">
                <span className="font-serif font-bold text-lg text-brass-400">IV</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-serif font-bold tracking-tight text-ink-950">
                    Ivy Homes
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    ATELIER
                  </span>
                </div>
                <span className="text-[10px] text-ink-500 font-medium block -mt-1 tracking-wide">
                  Verified Proptech Atelier
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                const isCompare = href === '/compare'

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all relative',
                      active
                        ? 'text-brand-800 bg-brand-50/80 font-bold'
                        : 'text-ink-600 hover:text-ink-950 hover:bg-surface-subtle'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', active ? 'text-brand-700' : 'text-ink-400')} />
                    <span>{label}</span>
                    {isCompare && compareItems.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-brass-500 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                        {compareItems.length}
                      </span>
                    )}
                    {active && (
                      <span className="absolute bottom-0 inset-x-3 h-0.5 bg-brand-700 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Controls & Saved */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/saved">
              <Button
                variant={pathname === '/saved' ? 'primary' : 'ghost'}
                size="sm"
                className="relative text-xs gap-1.5"
              >
                <Heart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-ink-900 leading-tight truncate max-w-[120px]">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-brand-700 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-brand-600" />
                    Verified Member
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-surface-subtle border border-border-medium flex items-center justify-center text-xs font-bold text-brand-800 font-serif">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  title="Sign out"
                  className="text-ink-400 hover:text-red-600"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm" className="text-xs font-semibold">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
