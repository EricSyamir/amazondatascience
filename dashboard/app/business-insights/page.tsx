'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BusinessInsights from '@/components/BusinessInsights'
import Nav from '@/components/Nav'

export default function BusinessInsightsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <BusinessInsights />
      </div>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            Data Science Project - TEB 2043 | Jan 2026 Semester
          </p>
        </div>
      </footer>
    </main>
  )
}
