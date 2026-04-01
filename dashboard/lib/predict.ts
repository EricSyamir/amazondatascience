// Client-side inference for LR and KNN models trained in R.
// Models are loaded from /dashboard_data/model_lr.json and model_knn.json.
// No server required — runs entirely in the browser (Vercel-compatible).

export interface LRModel {
  type: string
  features: string[]
  intercept: number
  coefficients: Record<string, number>
  feature_means: Record<string, number>
  feature_stds: Record<string, number>
  metrics: { mae: number; rmse: number; r2: number }
  description: string
}

export interface KNNModel {
  type: string
  k: number
  features: string[]
  threshold: number
  feature_means: Record<string, number>
  feature_stds: Record<string, number>
  training_data: Array<{ f: number[]; l: number }>
  metrics: { accuracy: number; precision: number; recall: number; f1: number; confusion: { tp: number; fp: number; fn: number; tn: number } }
  description: string
}

export interface PredictionInput {
  discounted_price: number
  actual_price: number
  discount_pct: number
}

// Build the 4-feature vector (same order as R training)
function buildFeatureVector(input: PredictionInput): Record<string, number> {
  return {
    discounted_price: input.discounted_price,
    actual_price:     input.actual_price,
    discount_pct:     input.discount_pct,
    discount_amount:  input.actual_price - input.discounted_price,
  }
}

function normalize(
  raw: Record<string, number>,
  means: Record<string, number>,
  stds: Record<string, number>
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const key of Object.keys(raw)) {
    out[key] = (raw[key] - (means[key] ?? 0)) / (stds[key] ?? 1)
  }
  return out
}

// ── Prediction 1: Linear Regression ──────────────────────────────────────────

export function predictRating(input: PredictionInput, model: LRModel): number {
  const raw  = buildFeatureVector(input)
  const norm = normalize(raw, model.feature_means, model.feature_stds)

  let pred = model.intercept
  for (const [key, coef] of Object.entries(model.coefficients)) {
    pred += coef * (norm[key] ?? 0)
  }
  return Math.max(1, Math.min(5, pred))
}

// ── Prediction 2: KNN Classifier ─────────────────────────────────────────────

export interface KNNResult {
  label: 0 | 1          // 1 = high-rated (>=4.2), 0 = not
  confidence: number    // fraction of k neighbours that voted "high-rated"
  neighbours: number    // k value used
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0))
}

export function predictHighRated(input: PredictionInput, model: KNNModel): KNNResult {
  const raw      = buildFeatureVector(input)
  const norm     = normalize(raw, model.feature_means, model.feature_stds)
  const normVec  = model.features.map(f => norm[f] ?? 0)

  const distances = model.training_data.map(pt => ({
    dist:  euclideanDistance(pt.f, normVec),
    label: pt.l,
  }))
  distances.sort((a, b) => a.dist - b.dist)

  const nearest    = distances.slice(0, model.k)
  const votes      = nearest.reduce((s, p) => s + p.label, 0)
  const confidence = votes / model.k

  return {
    label:       confidence >= 0.5 ? 1 : 0,
    confidence,
    neighbours:  model.k,
  }
}

// ── Model loaders (cached via module-level variable) ─────────────────────────

let _lrModel:  LRModel  | null = null
let _knnModel: KNNModel | null = null

export async function loadModels(): Promise<{ lr: LRModel; knn: KNNModel }> {
  if (_lrModel && _knnModel) return { lr: _lrModel, knn: _knnModel }

  const [lr, knn] = await Promise.all([
    fetch('/dashboard_data/model_lr.json').then(r => r.json()),
    fetch('/dashboard_data/model_knn.json').then(r => r.json()),
  ])

  _lrModel  = lr  as LRModel
  _knnModel = knn as KNNModel
  return { lr: _lrModel, knn: _knnModel }
}
