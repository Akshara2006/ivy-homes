import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-4 text-center">
      <div className="max-w-md w-full p-8 bg-white border border-border-subtle rounded-3xl shadow-atelier animate-fade-in-up">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-800">
          <Building2 className="w-6 h-6" />
        </div>
        <span className="text-4xl font-serif font-bold text-ink-950 block">404</span>
        <h1 className="text-xl font-serif font-bold text-ink-900 mt-2">Residence Not Found</h1>
        <p className="text-xs text-ink-500 mt-2 mb-6 leading-relaxed">
          The property or document you are attempting to access has either expired, been de-listed, or relocated.
        </p>
        <Link href="/">
          <Button variant="primary" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Property Explorer
          </Button>
        </Link>
      </div>
    </div>
  )
}
