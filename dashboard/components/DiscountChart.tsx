'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="discount_range" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="avg_rating" fill="#8b5cf6" name="Avg Rating" />
        <Bar dataKey="product_count" fill="#f59e0b" name="Product Count" />
      </BarChart>
    </ResponsiveContainer>
  )
}
