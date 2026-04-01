'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, TrendingUp, Users, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import {
  loadModels,
  predictRating,
  predictHighRated,
  LRModel,
  KNNModel,
} from '@/lib/predict'

interface Models { lr: LRModel; knn: KNNModel }
type Tab = 'lr' | 'knn'

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-6 h-6 ${
            i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[60px]">
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold text-gray-700 mt-0.5">{value}</span>
    </div>
  )
}

export default function PredictionForm() {
  const [models, setModels]       = useState<Models | null>(null)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('lr')

  const [discountedPrice, setDiscountedPrice] = useState(1299)
  const [actualPrice, setActualPrice]         = useState(2999)
  const [discountPct, setDiscountPct]         = useState(57)

  const [ratingPred, setRatingPred] = useState<number | null>(null)
  const [knnResult, setKnnResult]   = useState<{ label: 0|1; confidence: number; neighbours: number } | null>(null)

  useEffect(() => {
    loadModels()
      .then(setModels)
      .catch(() => setLoadError('Could not load prediction models. Run train_models.R first.'))
  }, [])

  // Sync discount % from prices
  useEffect(() => {
    if (actualPrice > 0) {
      const pct = Math.round(((actualPrice - discountedPrice) / actualPrice) * 100)
      setDiscountPct(Math.max(0, Math.min(100, pct)))
    }
  }, [discountedPrice, actualPrice])

  const run = useCallback(() => {
    if (!models) return
    const input = { discounted_price: discountedPrice, actual_price: actualPrice, discount_pct: discountPct }
    setRatingPred(predictRating(input, models.lr))
    setKnnResult(predictHighRated(input, models.knn))
  }, [models, discountedPrice, actualPrice, discountPct])

  useEffect(() => { if (models) run() }, [models, run])

  const ratingColor = (r: number) =>
    r >= 4.2 ? 'text-green-600' : r >= 3.5 ? 'text-amber-500' : 'text-red-500'

  const discountAmount = actualPrice - discountedPrice

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}

      {!models && !loadError && (
        <div className="text-center py-12 text-gray-400 text-sm animate-pulse">Loading models…</div>
      )}

      {models && (
        <div className="space-y-5">
          {/* ── Shared Input ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-5 text-sm">
              <Info className="w-4 h-4 text-indigo-500" />
              Product Pricing Inputs
              <span className="ml-auto text-xs text-gray-400 font-normal">No category needed</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Discounted price */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Discounted Price (₹)</label>
                <input
                  type="number" min={1}
                  value={discountedPrice}
                  onChange={e => setDiscountedPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input type="range" min={100} max={20000} step={100}
                  value={discountedPrice}
                  onChange={e => setDiscountedPrice(Number(e.target.value))}
                  className="w-full mt-1.5 accent-indigo-600"
                />
              </div>

              {/* Actual price */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Actual Price (₹)</label>
                <input
                  type="number" min={1}
                  value={actualPrice}
                  onChange={e => setActualPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input type="range" min={100} max={30000} step={100}
                  value={actualPrice}
                  onChange={e => setActualPrice(Number(e.target.value))}
                  className="w-full mt-1.5 accent-indigo-600"
                />
              </div>
            </div>

            {/* Derived summary */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-blue-50 rounded-lg py-2 px-3">
                <p className="text-xs text-blue-500 font-medium">Discount %</p>
                <p className="text-lg font-bold text-blue-700">{discountPct}%</p>
              </div>
              <div className="bg-rose-50 rounded-lg py-2 px-3">
                <p className="text-xs text-rose-500 font-medium">Discount Amount</p>
                <p className="text-lg font-bold text-rose-700">₹{discountAmount.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg py-2 px-3">
                <p className="text-xs text-gray-500 font-medium">Saving</p>
                <p className="text-lg font-bold text-gray-700">
                  {actualPrice > 0 ? ((discountAmount / actualPrice) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div>
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('lr')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'lr'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Linear Regression
              </button>
              <button
                onClick={() => setActiveTab('knn')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'knn'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4" />
                KNN Classifier
              </button>
            </div>

            {/* ── Tab: Linear Regression ── */}
            {activeTab === 'lr' && (
              <div className="bg-white rounded-b-xl rounded-tr-xl border border-t-0 border-gray-200 p-6">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-gray-800">Predicted Rating</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Features: discounted price, actual price, discount %
                    </p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Linear Regression
                  </span>
                </div>

                {ratingPred !== null && (
                  <div className="text-center py-6 space-y-3">
                    <div className={`text-6xl font-black tracking-tight ${ratingColor(ratingPred)}`}>
                      {ratingPred.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-400">out of 5.0</p>
                    <StarRating value={ratingPred} />
                    <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                      ratingPred >= 4.2
                        ? 'bg-green-50 text-green-700'
                        : ratingPred >= 3.5
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {ratingPred >= 4.2 ? '🌟 Likely high-rated' : ratingPred >= 3.5 ? '👍 Average performance' : '⚠️ Below average'}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">Model performance on 20% holdout</p>
                  <div className="flex gap-2 flex-wrap">
                    <MetricPill label="R²"   value={models.lr.metrics.r2.toFixed(3)} />
                    <MetricPill label="MAE"  value={models.lr.metrics.mae.toFixed(3)} />
                    <MetricPill label="RMSE" value={models.lr.metrics.rmse.toFixed(3)} />
                  </div>
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                    Low R² is expected — pricing alone is a weak predictor of rating. Category (excluded to avoid bias) would be a much stronger predictor.
                  </p>
                </div>
              </div>
            )}

            {/* ── Tab: KNN Classifier ── */}
            {activeTab === 'knn' && (
              <div className="bg-white rounded-b-xl rounded-tr-xl border border-t-0 border-gray-200 p-6">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-gray-800">High-Rated Prediction</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Features: discounted price, actual price, discount %, discount amount
                    </p>
                  </div>
                  <span className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full">
                    KNN (k={models.knn.k})
                  </span>
                </div>

                {knnResult !== null && (
                  <div className="text-center py-6 space-y-3">
                    {knnResult.label === 1
                      ? <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
                      : <AlertCircle  className="w-14 h-14 text-amber-400 mx-auto" />
                    }
                    <p className={`text-2xl font-bold ${knnResult.label === 1 ? 'text-green-600' : 'text-amber-600'}`}>
                      {knnResult.label === 1 ? 'High-Rated' : 'Not High-Rated'}
                    </p>
                    <p className="text-xs text-gray-400">Threshold: rating ≥ 4.2</p>

                    <div className="max-w-xs mx-auto">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Confidence</span>
                        <span className="font-semibold">{Math.round(knnResult.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${knnResult.label === 1 ? 'bg-green-500' : 'bg-amber-400'}`}
                          style={{ width: `${Math.round(knnResult.confidence * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5 text-center">
                        {Math.round(knnResult.confidence * knnResult.neighbours)} of {knnResult.neighbours} nearest neighbours voted high-rated
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">Model performance on 20% holdout</p>
                  <div className="flex gap-2 flex-wrap">
                    <MetricPill label="Acc"  value={`${(models.knn.metrics.accuracy  * 100).toFixed(1)}%`} />
                    <MetricPill label="F1"   value={models.knn.metrics.f1.toFixed(3)} />
                    <MetricPill label="Prec" value={models.knn.metrics.precision.toFixed(3)} />
                    <MetricPill label="Rec"  value={models.knn.metrics.recall.toFixed(3)} />
                  </div>

                  {/* Confusion matrix mini */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 font-medium mb-2">Confusion matrix</p>
                    <div className="grid grid-cols-2 gap-1.5 max-w-[200px]">
                      {[
                        { label: 'TP', val: models.knn.metrics.confusion.tp, color: 'bg-green-100 text-green-700' },
                        { label: 'FP', val: models.knn.metrics.confusion.fp, color: 'bg-red-100 text-red-600' },
                        { label: 'FN', val: models.knn.metrics.confusion.fn, color: 'bg-orange-100 text-orange-600' },
                        { label: 'TN', val: models.knn.metrics.confusion.tn, color: 'bg-blue-100 text-blue-700' },
                      ].map(c => (
                        <div key={c.label} className={`rounded-lg px-3 py-1.5 text-center ${c.color}`}>
                          <p className="text-[10px] font-medium">{c.label}</p>
                          <p className="text-sm font-bold">{c.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
