'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface BusinessInsight {
  id: string
  question: string
  hypothesis: string
  test: string
  p_value: number
  significant: boolean
  interpretation: string
  recommendation: string
  [key: string]: unknown // For additional fields that vary by insight
}

export default function BusinessInsights() {
  const [insights, setInsights] = useState<BusinessInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/business_insights.json')
      .then(res => res.json())
      .then((data: BusinessInsight[]) => {
        setInsights(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-32 flex items-center justify-center text-gray-500">
          Loading business insights...
        </div>
      </div>
    )
  }

  if (insights.length === 0) return null

  const getSignificanceIcon = (significant: boolean) => {
    if (significant) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }
    return <XCircle className="w-5 h-5 text-gray-400" />
  }

  const getSignificanceBadge = (significant: boolean, pValue: number) => {
    if (significant) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Significant (p = {pValue.toExponential(2)})
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <XCircle className="w-3 h-3" />
        Not Significant (p = {pValue.toExponential(2)})
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Business Insights
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Statistical hypothesis tests to answer key business questions.
      </p>
      <div className="space-y-6">
        {insights.map((insight) => (
          <div key={insight.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">
                {insight.question}
              </h3>
              {getSignificanceIcon(insight.significant)}
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Hypothesis:</strong> {insight.hypothesis}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Test:</strong> {insight.test}
              </p>
            </div>

            {/* Show specific metrics based on insight type */}
            <div className="mb-3 space-y-1">
              {insight.id === 'insight1' && (
                <>
                  <p className="text-sm">
                    <strong>High discount (≥30%) mean rating:</strong> {String(insight.high_discount_mean)} (n={String(insight.high_discount_count)})
                  </p>
                  <p className="text-sm">
                    <strong>Low discount (&lt;30%) mean rating:</strong> {String(insight.low_discount_mean)} (n={String(insight.low_discount_count)})
                  </p>
                  <p className="text-sm">
                    <strong>t-statistic:</strong> {String(insight.t_statistic)}
                  </p>
                </>
              )}
              {insight.id === 'insight2' && (
                <>
                  <p className="text-sm">
                    <strong>High discount mean reviews:</strong> {typeof insight.high_discount_mean_reviews === 'number' ? insight.high_discount_mean_reviews.toLocaleString() : String(insight.high_discount_mean_reviews)}
                  </p>
                  <p className="text-sm">
                    <strong>Low discount mean reviews:</strong> {typeof insight.low_discount_mean_reviews === 'number' ? insight.low_discount_mean_reviews.toLocaleString() : String(insight.low_discount_mean_reviews)}
                  </p>
                  <p className="text-sm">
                    <strong>t-statistic:</strong> {String(insight.t_statistic)}
                  </p>
                </>
              )}
              {insight.id === 'insight3' && (
                <>
                  <p className="text-sm">
                    <strong>Top categories mean rating:</strong> {String(insight.top_categories_mean)}
                  </p>
                  <p className="text-sm">
                    <strong>Bottom categories mean rating:</strong> {String(insight.bottom_categories_mean)}
                  </p>
                  <p className="text-sm">
                    <strong>Top categories:</strong> {Array.isArray(insight.top_categories) ? insight.top_categories.join(', ') : String(insight.top_categories)}
                  </p>
                  <p className="text-sm">
                    <strong>Bottom categories:</strong> {Array.isArray(insight.bottom_categories) ? insight.bottom_categories.join(', ') : String(insight.bottom_categories)}
                  </p>
                  <p className="text-sm">
                    <strong>t-statistic:</strong> {String(insight.t_statistic)}
                  </p>
                </>
              )}
              {insight.id === 'insight4' && (
                <>
                  <p className="text-sm">
                    <strong>Price tier means:</strong> Low: {String((insight.tier_means as Record<string, unknown>)?.Low || 'N/A')}, Mid: {String((insight.tier_means as Record<string, unknown>)?.Mid || 'N/A')}, High: {String((insight.tier_means as Record<string, unknown>)?.High || 'N/A')}
                  </p>
                  <p className="text-sm">
                    <strong>F-statistic:</strong> {String(insight.f_statistic)}
                  </p>
                </>
              )}
              {insight.id === 'insight5' && (
                <>
                  <p className="text-sm">
                    <strong>Category discount means:</strong> {Object.entries((insight.category_discount_means as Record<string, number>) || {}).map(([k, v]) => `${k}: ${v}%`).join(', ')}
                  </p>
                  <p className="text-sm">
                    <strong>F-statistic:</strong> {String(insight.f_statistic)}
                  </p>
                </>
              )}
              {insight.id === 'insight6' && (
                <>
                  <p className="text-sm">
                    <strong>Correlation coefficient:</strong> {String(insight.correlation)}
                  </p>
                </>
              )}
              {insight.id === 'insight7' && (
                <>
                  <p className="text-sm">
                    <strong>Top products mean rating:</strong> {String(insight.top_products_mean)} (n={String(insight.top_products_count)})
                  </p>
                  <p className="text-sm">
                    <strong>Other products mean rating:</strong> {String(insight.other_products_mean)} (n={String(insight.other_products_count)})
                  </p>
                  <p className="text-sm">
                    <strong>t-statistic:</strong> {String(insight.t_statistic)}
                  </p>
                </>
              )}
            </div>

            <div className="mb-3">
              {getSignificanceBadge(insight.significant, insight.p_value)}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <p className="text-sm text-gray-700 mb-1">
                <strong>Interpretation:</strong> {insight.interpretation}
              </p>
              <p className="text-sm text-gray-800 font-medium">
                <strong>Recommendation:</strong> {insight.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
