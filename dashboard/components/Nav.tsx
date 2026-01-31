'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Lightbulb } from 'lucide-react'

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 text-gray-900 font-semibold hover:text-indigo-600 transition-colors">
            <BarChart3 className="w-6 h-6" />
            <span>Amazon Sales Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/business-insights"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/business-insights' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Business Insights
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
