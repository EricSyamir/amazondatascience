'use client'

import { useEffect, useState } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DiscountData {
  discount_range: string
  avg_rating: number
  product_count: number
}

export default function DiscountChart() {
  const [data, setData] = useState<DiscountData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/discount_stats.json')
      .then(res => res.json())
      .then((data: DiscountData[]) => {
        setData(data.filter(item => item.discount_range !== 'nan'))
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading discount data:', err)
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
        <XAxis dataKey="discount_range" />
        <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" tickFormatter={(v) => v.toLocaleString()} />
        <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" domain={[3, 5]} tickFormatter={(v) => v.toFixed(1)} />
        <Tooltip formatter={(value, name) => [name === 'Avg Rating' ? Number(value).toFixed(2) : value, name]} />
        <Legend />
        <Bar yAxisId="left" dataKey="product_count" fill="#f59e0b" name="Product Count" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="avg_rating" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} name="Avg Rating" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
