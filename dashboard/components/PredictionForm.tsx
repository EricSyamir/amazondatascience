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

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  )
}

export default function PredictionForm() {
  const [models, setModels]         = useState<Models | null>(null)
  const [loadError, setLoadError]   = useState('')
  const [discountedPrice, setDiscountedPrice] = useState(1299)
  const [actualPrice, setActualPrice]         = useState(2999)
  const [discountPct, setDiscountPct]         = useState(57)
  const [ratingPred, setRatingPred]   = useState<number | null>(null)
  const [knnResult, setKnnResult]     = useState<{ label: 0|1; confidence: number; neighbours: number } | null>(null)

  // Load models once
  useEffect(() => {
    loadModels()
      .then(setModels)
      .catch(() => setLoadError('Could not load prediction models. Make sure train_models.R has been run.'))
  }, [])

  // Sync discount % when prices change
  useEffect(() => {
    if (actualPrice > 0) {
      const pct = Math.round(((actualPrice - discountedPrice) / actualPrice) * 100)
      setDiscountPct(Math.max(0, Math.min(100, pct)))
    }
  }, [discountedPrice, actualPrice])

  const runPredictions = useCallback(() => {
    if (!models) return
    const input = { discounted_price: discountedPrice, actual_price: actualPrice, discount_pct: discountPct }
    setRatingPred(predictRating(input, models.lr))
    setKnnResult(predictHighRated(input, models.knn))
  }, [models, discountedPrice, actualPrice, discountPct])

  // Auto-run when models load or inputs change
  useEffect(() => { if (models) runPredictions() }, [models, runPredictions])

  const ratingColor = (r: number) =>
    r >= 4.2 ? 'text-green-600' : r >= 3.5 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}

      {!models && !loadError && (
        <div className="text-center py-8 text-gray-400 text-sm">Loading models…</div>
      )}

      {models && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Input Form ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              Product Inputs
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Discounted Price (₹)
              </label>
              <input
                type="number"
                min={1}
                value={discountedPrice}
                onChange={e => setDiscountedPrice(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="range" min={100} max={20000} step={100}
                value={discountedPrice}
                onChange={e => setDiscountedPrice(Number(e.target.value))}
                className="w-full mt-1 accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Actual Price (₹)
              </label>
              <input
                type="number"
                min={1}
                value={actualPrice}
                onChange={e => setActualPrice(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="range" min={100} max={30000} step={100}
                value={actualPrice}
                onChange={e => setActualPrice(Number(e.target.value))}
                className="w-full mt-1 accent-indigo-600"
              />
            </div>

            <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Discount Amount</span>
                <span className="font-semibold text-gray-800">₹{(actualPrice - discountedPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount %</span>
                <span className="font-semibold text-indigo-700">{discountPct}%</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              No category input — models trained on pricing features only to avoid category bias.
            </p>
          </div>

          {/* ── Results ── */}
          <div className="space-y-4">
            {/* LR Result */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-800">Predicted Rating</h3>
                <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">Linear Regression</span>
              </div>

              {ratingPred !== null && (
                <div className="text-center space-y-2">
                  <span className={`text-5xl font-bold ${ratingColor(ratingPred)}`}>
                    {ratingPred.toFixed(2)}
                  </span>
                  <p className="text-sm text-gray-500">out of 5.0</p>
                  <StarRating value={ratingPred} />
                  <p className={`text-sm font-medium mt-1 ${ratingColor(ratingPred)}`}>
                    {ratingPred >= 4.2 ? '🌟 Likely high-rated' : ratingPred >= 3.5 ? '👍 Average performance' : '⚠️ Below average'}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">Model performance (test set)</p>
                <div className="flex gap-2">
                  <MetricBadge label="R²"   value={models.lr.metrics.r2.toFixed(3)} />
                  <MetricBadge label="MAE"  value={models.lr.metrics.mae.toFixed(3)} />
                  <MetricBadge label="RMSE" value={models.lr.metrics.rmse.toFixed(3)} />
                </div>
              </div>
            </div>

            {/* KNN Result */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800">High-Rated Prediction</h3>
                <span className="ml-auto text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">KNN (k={models.knn.k})</span>
              </div>

              {knnResult !== null && (
                <div className="text-center space-y-3">
                  {knnResult.label === 1 ? (
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                  )}
                  <p className={`text-xl font-bold ${knnResult.label === 1 ? 'text-green-600' : 'text-amber-600'}`}>
                    {knnResult.label === 1 ? 'High-Rated' : 'Not High-Rated'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Threshold: rating ≥ 4.2
                  </p>

                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${knnResult.label === 1 ? 'bg-green-500' : 'bg-amber-400'}`}
                      style={{ width: `${Math.round(knnResult.confidence * 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{Math.round(knnResult.confidence * 100)}%</span> of {knnResult.neighbours} nearest neighbours voted high-rated
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">Model performance (test set)</p>
                <div className="flex gap-2">
                  <MetricBadge label="Acc" value={`${(models.knn.metrics.accuracy * 100).toFixed(1)}%`} />
                  <MetricBadge label="F1"  value={models.knn.metrics.f1.toFixed(3)} />
                  <MetricBadge label="Prec" value={models.knn.metrics.precision.toFixed(3)} />
                  <MetricBadge label="Rec" value={models.knn.metrics.recall.toFixed(3)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
