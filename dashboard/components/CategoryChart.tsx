'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
        // Get top 10 categories by product count
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
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="category" 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          fontSize={10}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="avg_rating" fill="#3b82f6" name="Avg Rating" />
        <Bar dataKey="product_count" fill="#10b981" name="Product Count" />
      </BarChart>
    </ResponsiveContainer>
  )
}
