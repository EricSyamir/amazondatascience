'use client'

import { useEffect, useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ScatterPoint {
  price: number
  rating: number
}

interface CorrelationData {
  correlation: number
  scatter: ScatterPoint[]
}

export default function PriceRatingCorrelationChart() {
  const [data, setData] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/insight_q8_correlation.json')
      .then(res => res.json())
      .then((data: CorrelationData) => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>
  if (!data) return null

  return (
    <div>
      <p className="text-sm text-gray-700 mb-3">
        <strong>Correlation (price vs rating):</strong>{' '}
        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{data.correlation}</span>
        {' '}(weak positive)
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="price" name="Price (₹)" tick={{ fontSize: 10 }} />
          <YAxis dataKey="rating" name="Rating" domain={[3, 5]} tick={{ fontSize: 10 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data.scatter} fill="#3b82f6" name="Product" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
