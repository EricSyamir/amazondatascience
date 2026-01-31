'use client'

import { useEffect, useState } from 'react'

interface Product {
  product_name: string
  category: string
  rating?: number
  rating_clean?: number
  rating_count?: number | null
  rating_count_clean?: number | null
  discounted_price?: number
  discounted_price_clean?: number
}

export default function TopProductsTable() {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/dashboard_data/top_rated_products.json')
      .then(res => res.json())
      .then((data: Product[]) => {
        setData(data.slice(0, 15))
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading top products:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reviews
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((product, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {product.product_name.length > 50
                    ? `${product.product_name.substring(0, 50)}...`
                    : product.product_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {product.category.split('|').pop() || product.category}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    {(product.rating ?? product.rating_clean ?? 0).toFixed(2)}
                  </span>
                  <span className="ml-1 text-yellow-400">★</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(product.rating_count ?? product.rating_count_clean)?.toLocaleString() ?? 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ₹{((product.discounted_price ?? product.discounted_price_clean) ?? 0).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
