'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="price_range" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="avg_rating" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Avg Rating"
        />
        <Line 
          type="monotone" 
          dataKey="product_count" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Product Count"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
