'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

const INSIGHT_DATA_URL: Record<string, string> = {
  q1: '/dashboard_data/insight_q1_avg_rating_by_category.json',
  q2: '/dashboard_data/insight_q2_top_products_by_category.json',
  q3: '/dashboard_data/insight_q3_price_distribution.json',
  q4: '/dashboard_data/insight_q4_avg_discount_by_category.json',
  q5: '/dashboard_data/insight_q5_popular_products.json',
  q6: '/dashboard_data/insight_q6_keywords.json',
  q7: '/dashboard_data/insight_q7_popular_reviews.json',
  q8: '/dashboard_data/insight_q8_correlation.json',
  q9: '/dashboard_data/insight_q9_top5_categories.json',
}

interface InsightDetailViewProps {
  insightId: string
}

export default function InsightDetailView({ insightId }: InsightDetailViewProps) {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = INSIGHT_DATA_URL[insightId]
    if (!url) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [insightId])

  if (loading) {
    return (
      <div className="py-4 text-center text-gray-500 text-sm">
        Loading data...
      </div>
    )
  }

  if (!data) return null

  switch (insightId) {
    case 'q1': {
      const rows = data as { category_short: string; avg_rating: number }[]
      return (
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Category</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-gray-800">{r.category_short}</td>
                  <td className="py-2 px-2 text-right font-medium">{r.avg_rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'q2': {
      const rows = data as { category: string; product_name: string; rating_count: number; rating: number }[]
      return (
        <div className="overflow-x-auto -mx-2 max-h-64 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 sticky top-0 bg-white">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Category</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Product</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Reviews</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Rating</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-gray-800">{r.category}</td>
                  <td className="py-2 px-2 text-gray-700">{r.product_name}</td>
                  <td className="py-2 px-2 text-right">{r.rating_count?.toLocaleString() ?? '-'}</td>
                  <td className="py-2 px-2 text-right font-medium">{r.rating ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'q3': {
      const rows = data as { price_range: string; discounted_count: number; actual_count: number }[]
      return (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="price_range" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="discounted_count" fill="#3b82f6" name="Discounted price" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual_count" fill="#10b981" name="Actual price" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
    case 'q4': {
      const rows = data as { category_short: string; avg_discount: number }[]
      return (
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Category</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Avg Discount %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-gray-800">{r.category_short}</td>
                  <td className="py-2 px-2 text-right font-medium">{r.avg_discount}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'q5': {
      const rows = data as { product_name_short: string; occurrences: number; avg_rating: number; total_reviews: number }[]
      return (
        <div className="overflow-x-auto -mx-2 max-h-64 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Product</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Occurrences</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Avg Rating</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Total Reviews</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-gray-800">{r.product_name_short}</td>
                  <td className="py-2 px-2 text-right">{r.occurrences}</td>
                  <td className="py-2 px-2 text-right">{r.avg_rating}</td>
                  <td className="py-2 px-2 text-right">{r.total_reviews?.toLocaleString() ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'q6': {
      const rows = data as { keyword: string; count: number }[]
      return (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="keyword" width={55} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" name="Count" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
    case 'q7': {
      const rows = data as { review_title_short: string; count: number }[]
      return (
        <div className="overflow-x-auto -mx-2 max-h-64 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Review title</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-gray-800">{r.review_title_short}</td>
                  <td className="py-2 px-2 text-right font-medium">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'q8': {
      const payload = data as { correlation: number; scatter: { price: number; rating: number }[] }
      return (
        <div>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Correlation (price vs rating):</strong>{' '}
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{payload.correlation}</span>
            {' '}(weak positive)
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price" name="Price" tick={{ fontSize: 10 }} />
              <YAxis dataKey="rating" name="Rating" domain={[1, 5]} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={payload.scatter} fill="#3b82f6" name="Product" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )
    }
    case 'q9': {
      const rows = data as { category_short: string; avg_rating: number; product_count: number }[]
      return (
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Category</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Avg Rating</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Products</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-gray-800">{r.category_short}</td>
                  <td className="py-2 px-2 text-right font-medium">{r.avg_rating}</td>
                  <td className="py-2 px-2 text-right">{r.product_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    default:
      return null
  }
}
