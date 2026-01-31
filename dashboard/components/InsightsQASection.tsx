'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react'

interface QAItem {
  id: string
  question: string
  answer: string
}

export default function InsightsQASection() {
  const [items, setItems] = useState<QAItem[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/insights_qa.json')
      .then(res => res.json())
      .then((data: QAItem[]) => {
        setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading insights Q&A:', err)
        setLoading(false)
      })
  }, [])

  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id))
  }

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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-7 h-7 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Insights & Q&A
        </h2>
      </div>
      <p className="text-gray-600 mb-6 text-sm">
        Key questions and answers from the EDA. Click a question to expand the answer.
      </p>
      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = openId === item.id
          return (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                aria-expanded={isOpen}
              >
                <span className="flex-shrink-0 text-indigo-600">
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </span>
                <span className="font-medium text-gray-800">
                  {item.question}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 py-3 pl-12 pr-4 bg-white border-t border-gray-100">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
