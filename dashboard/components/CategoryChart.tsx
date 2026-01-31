'use client'

import { useEffect, useState } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CategoryData {
  category: string
  avg_rating: number
  product_count: number
}

export default function CategoryChart() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/category_stats.json')
      .then(res => res.json())
      .then((data: CategoryData[]) => {
        const sorted = data
          .filter(item => item.product_count > 0)
          .sort((a, b) => b.product_count - a.product_count)
          .slice(0, 10)
          .map(item => ({
            ...item,
            category: item.category.split('|').pop() || item.category,
          }))
        setData(sorted)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading category data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="category"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          tick={{ fontSize: 11 }}
        />
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
