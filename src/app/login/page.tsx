'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { isLoggedIn, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      router.push('/')
    }
  }, [isLoggedIn, isLoading, router])

  return <LoginForm />
}
