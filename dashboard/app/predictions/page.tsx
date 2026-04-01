import PredictionForm from '@/components/PredictionForm'
import { Brain, TrendingUp, Users } from 'lucide-react'

export default function PredictionsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-7 h-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Product Predictions</h1>
        </div>
        <p className="text-gray-500 text-sm max-w-2xl">
          Enter a product's pricing details to get instant predictions from two
          machine-learning models trained on the Amazon Sales Dataset.
          No category input is used — predictions are based purely on pricing to avoid category bias.
        </p>
      </div>

      {/* Model Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-indigo-800">Model 1 — Linear Regression</h2>
          </div>
          <p className="text-sm text-indigo-700 mb-3">
            Predicts the <strong>expected customer rating (1–5)</strong> based on pricing.
          </p>
          <ul className="text-xs text-indigo-600 space-y-1">
            <li>📥 <strong>Input:</strong> Discounted price, Actual price, Discount %, Discount amount</li>
            <li>📤 <strong>Output:</strong> Continuous rating value (1.0 – 5.0)</li>
            <li>📊 <strong>Evaluation:</strong> R², MAE, RMSE on 20% holdout test set</li>
            <li>🛠️ <strong>Trained in:</strong> R — coefficients exported as JSON</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-purple-800">Model 2 — KNN Classifier</h2>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            Predicts whether a product will be <strong>high-rated (≥ 4.2)</strong> or not.
          </p>
          <ul className="text-xs text-purple-600 space-y-1">
            <li>📥 <strong>Input:</strong> Same 4 pricing features (standardised)</li>
            <li>📤 <strong>Output:</strong> High-rated / Not high-rated + confidence</li>
            <li>📊 <strong>Evaluation:</strong> Accuracy, F1, Precision, Recall</li>
            <li>🛠️ <strong>Trained in:</strong> R — training data exported as JSON for JS KNN</li>
          </ul>
        </div>
      </div>

      {/* Feature Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="font-medium text-gray-700 mb-3 text-sm">Features Used (Both Models)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Discounted Price', desc: 'Sale price in ₹', color: 'bg-blue-100 text-blue-700' },
            { name: 'Actual Price',     desc: 'Original price in ₹', color: 'bg-green-100 text-green-700' },
            { name: 'Discount %',       desc: 'Auto-computed from prices', color: 'bg-amber-100 text-amber-700' },
            { name: 'Discount Amount',  desc: 'Actual − Discounted', color: 'bg-rose-100 text-rose-700' },
          ].map(f => (
            <div key={f.name} className="rounded-lg p-3 bg-white border border-gray-200">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.color}`}>{f.name}</span>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Form */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Try it — Enter Product Details</h2>
        <PredictionForm />
      </div>

      {/* How it works on Vercel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-600 space-y-2">
        <h3 className="font-medium text-gray-800">How this works on Vercel (no server needed)</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Models are <strong>trained once in R</strong> using the full dataset.</li>
          <li>For <strong>Linear Regression</strong>, only the intercept + coefficients + scaling params are exported to <code className="bg-gray-100 px-1 rounded">model_lr.json</code> (~1 KB).</li>
          <li>For <strong>KNN</strong>, the standardised training points + label are exported to <code className="bg-gray-100 px-1 rounded">model_knn.json</code> (~80 KB). The KNN algorithm runs in TypeScript in your browser — no API call needed.</li>
          <li>Both JSON files live in <code className="bg-gray-100 px-1 rounded">dashboard/public/dashboard_data/</code> and are served as static assets by Vercel.</li>
        </ol>
      </div>
    </main>
  )
}
