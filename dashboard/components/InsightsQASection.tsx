'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  Star,
  TrendingUp,
  Percent,
  Package,
  Tag,
  MessageSquare,
  Link2,
  Award,
  X,
  ChevronRight,
} from 'lucide-react'

interface InsightItem {
  id: string
  cardTitle?: string
  question: string
  answer: string
}

const ICONS: Record<string, React.ReactNode> = {
  q1: <Star className="w-6 h-6" />,
  q2: <BarChart3 className="w-6 h-6" />,
  q3: <TrendingUp className="w-6 h-6" />,
  q4: <Percent className="w-6 h-6" />,
  q5: <Package className="w-6 h-6" />,
  q6: <Tag className="w-6 h-6" />,
  q7: <MessageSquare className="w-6 h-6" />,
  q8: <Link2 className="w-6 h-6" />,
  q9: <Award className="w-6 h-6" />,
}

export default function InsightsQASection() {
  const [items, setItems] = useState<InsightItem[]>([])
  const [selected, setSelected] = useState<InsightItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/insights_qa.json')
      .then(res => res.json())
      .then((data: InsightItem[]) => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading insights:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-32 flex items-center justify-center text-gray-500">
          Loading insights...
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Data Insights
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Click a card to explore insights from the analysis.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="group flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-200">
                {ICONS[item.id] ?? <BarChart3 className="w-6 h-6" />}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-gray-800 block truncate">
                  {item.cardTitle ?? item.question.slice(0, 40)}
                  {!item.cardTitle && item.question.length > 40 ? '…' : ''}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  Learn more
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="insight-modal-title"
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 id="insight-modal-title" className="text-lg font-bold text-gray-900 pr-4">
                {selected.question}
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <p className="text-gray-600 leading-relaxed">
                {selected.answer}
              </p>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-full py-2 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
