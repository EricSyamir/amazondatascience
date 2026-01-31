'use client'

import { useEffect, useState } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PriceRangeData {
  price_range: string
  avg_rating: number
  product_count: number
}

export default function PriceRangeChart() {
  const [data, setData] = useState<PriceRangeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/price_range_stats.json')
      .then(res => res.json())
      .then((data: PriceRangeData[]) => {
        setData(data.filter(item => item.price_range !== 'nan'))
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading price range data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="price_range" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" orientation="left" stroke="#10b981" tickFormatter={(v) => v.toLocaleString()} label={{ value: 'Product Count', angle: -90, position: 'insideLeft', style: { fill: '#10b981' } }} />
        <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" domain={[3, 5]} tickFormatter={(v) => v.toFixed(1)} label={{ value: 'Avg Rating', angle: 90, position: 'insideRight', style: { fill: '#3b82f6' } }} />
        <Tooltip formatter={(value, name) => [name === 'Avg Rating' ? Number(value).toFixed(2) : value, name]} />
        <Legend />
        <Bar yAxisId="left" dataKey="product_count" fill="#10b981" name="Product Count" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="avg_rating" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Avg Rating" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
