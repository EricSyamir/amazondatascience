'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface KeywordRow {
  keyword: string
  count: number
}

export default function ProductKeywordsChart() {
  const [data, setData] = useState<KeywordRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/insight_q6_keywords.json')
      .then(res => res.json())
      .then((data: KeywordRow[]) => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 50, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="keyword" width={50} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#8b5cf6" name="Count" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
