'use client'

import { useEffect, useState } from 'react'
import StatCard from '@/components/StatCard'
import CategoryChart from '@/components/CategoryChart'
import PriceRangeChart from '@/components/PriceRangeChart'
import DiscountChart from '@/components/DiscountChart'
import TopProductsTable from '@/components/TopProductsTable'
import { TrendingUp, Package, Star, DollarSign } from 'lucide-react'

interface SummaryStats {
  total_products: number
  total_categories: number
  avg_rating: number
  avg_price: number
  avg_discount: number
  total_reviews: number
}

export default function Home() {
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/summary_stats.json')
      .then(res => res.json())
      .then(data => {
        setSummaryStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading summary stats:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Amazon Sales Dataset Analysis
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Comprehensive E-commerce Data Science Dashboard
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Statistics */}
        {summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Products"
              value={summaryStats.total_products.toLocaleString()}
              icon={<Package className="w-8 h-8" />}
              color="blue"
            />
            <StatCard
              title="Categories"
              value={summaryStats.total_categories.toString()}
              icon={<TrendingUp className="w-8 h-8" />}
              color="green"
            />
            <StatCard
              title="Avg Rating"
              value={summaryStats.avg_rating.toFixed(2)}
              icon={<Star className="w-8 h-8" />}
              color="yellow"
            />
            <StatCard
              title="Avg Price"
              value={`₹${summaryStats.avg_price.toFixed(0)}`}
              icon={<DollarSign className="w-8 h-8" />}
              color="purple"
            />
          </div>
        )}

        {/* Additional Stats Row */}
        {summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Average Discount
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {summaryStats.avg_discount.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Reviews
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {summaryStats.total_reviews.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Category Performance
            </h2>
            <CategoryChart />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Price Range Analysis
            </h2>
            <PriceRangeChart />
          </div>
        </div>

        {/* Discount Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Discount Impact Analysis
          </h2>
          <DiscountChart />
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Top Rated Products
          </h2>
          <TopProductsTable />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            Data Science Project - TEB 2043 | Jan 2026 Semester
          </p>
        </div>
      </footer>
    </main>
  )
}
