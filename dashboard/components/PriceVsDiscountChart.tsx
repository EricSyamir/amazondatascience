'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PriceRow {
  price_range: string
  discounted_count: number
  actual_count: number
}

export default function PriceVsDiscountChart() {
  const [data, setData] = useState<PriceRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/insight_q3_price_distribution.json')
      .then(res => res.json())
      .then((data: PriceRow[]) => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
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
