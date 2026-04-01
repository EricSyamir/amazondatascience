// Client-side inference for LR, KNN, and Naive Bayes models trained in R.
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
  k_selection_rule?: string
  features: string[]
  threshold: number
  feature_means: Record<string, number>
  feature_stds: Record<string, number>
  training_data: Array<{ f: number[]; l: number }>
  metrics: { accuracy: number; precision: number; recall: number; f1: number; confusion: { tp: number; fp: number; fn: number; tn: number } }
  description: string
}

export interface NBFeatStats {
  mean: number
  sd: number
}

export interface NBClassStats {
  prior: number
  n: number
  feat_stats: Record<string, NBFeatStats>
}

export interface NBModel {
  type: string
  features: string[]
  threshold: number
  classes: number[]
  class_stats: Record<string, NBClassStats>
  metrics: { accuracy: number; precision: number; recall: number; f1: number; confusion: { tp: number; fp: number; fn: number; tn: number } }
  description: string
}

export interface PredictionInput {
  discounted_price: number
  actual_price: number
  discount_pct: number
}

// Full pool of available features — each model picks what it needs via model.features
function buildFeaturePool(input: PredictionInput): Record<string, number> {
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
  const pool = buildFeaturePool(input)
  const raw  = Object.fromEntries(model.features.map(f => [f, pool[f]]))
  const norm = normalize(raw, model.feature_means, model.feature_stds)

  let pred = model.intercept
  for (const [key, coef] of Object.entries(model.coefficients)) {
    if (typeof coef !== 'number' || !isFinite(coef)) continue
    pred += coef * (norm[key] ?? 0)
  }
  return Math.max(1, Math.min(5, pred))
}

// ── Prediction 2: KNN Classifier ─────────────────────────────────────────────

export interface KNNResult {
  label: 0 | 1
  confidence: number   // fraction of k neighbours that voted "high-rated"
  neighbours: number
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0))
}

export function predictHighRated(input: PredictionInput, model: KNNModel): KNNResult {
  const pool    = buildFeaturePool(input)
  const raw     = Object.fromEntries(model.features.map(f => [f, pool[f]]))
  const norm    = normalize(raw, model.feature_means, model.feature_stds)
  const normVec = model.features.map(f => norm[f] ?? 0)

  const distances = model.training_data.map(pt => ({
    dist:  euclideanDistance(pt.f, normVec),
    label: pt.l,
  }))
  distances.sort((a, b) => a.dist - b.dist)

  const nearest    = distances.slice(0, model.k)
  const votes      = nearest.reduce((s, p) => s + p.label, 0)
  const confidence = votes / model.k

  return { label: confidence >= 0.5 ? 1 : 0, confidence, neighbours: model.k }
}

// ── Prediction 3: Gaussian Naive Bayes ───────────────────────────────────────

export interface NBResult {
  label: 0 | 1
  probHighRated: number   // posterior probability P(high-rated | x), 0–1
  probNotHighRated: number
}

// Log of Gaussian PDF: log N(x; μ, σ)
function logGaussian(x: number, mu: number, sigma: number): number {
  const s = sigma <= 0 ? 1e-9 : sigma
  return -0.5 * Math.log(2 * Math.PI * s * s) - ((x - mu) ** 2) / (2 * s * s)
}

export function predictHighRatedNB(input: PredictionInput, model: NBModel): NBResult {
  const pool = buildFeaturePool(input)

  const logScores: Record<string, number> = {}
  for (const cls of model.classes.map(String)) {
    const cs = model.class_stats[cls]
    let score = Math.log(cs.prior)
    for (const feat of model.features) {
      const { mean, sd } = cs.feat_stats[feat]
      score += logGaussian(pool[feat] ?? 0, mean, sd)
    }
    logScores[cls] = score
  }

  // Numerically stable softmax to get probabilities
  const maxLog  = Math.max(...Object.values(logScores))
  const expScores = Object.fromEntries(
    Object.entries(logScores).map(([k, v]) => [k, Math.exp(v - maxLog)])
  )
  const total = Object.values(expScores).reduce((s, v) => s + v, 0)

  const probHigh    = (expScores['1'] ?? 0) / total
  const probNotHigh = (expScores['0'] ?? 0) / total
  const label       = probHigh >= 0.5 ? 1 : 0

  return { label, probHighRated: probHigh, probNotHighRated: probNotHigh }
}

// ── Model loaders (cached) ────────────────────────────────────────────────────

let _lrModel:  LRModel  | null = null
let _knnModel: KNNModel | null = null
let _nbModel:  NBModel  | null = null

export async function loadModels(): Promise<{ lr: LRModel; knn: KNNModel; nb: NBModel }> {
  if (_lrModel && _knnModel && _nbModel) return { lr: _lrModel, knn: _knnModel, nb: _nbModel }

  const [lr, knn, nb] = await Promise.all([
    fetch('/dashboard_data/model_lr.json').then(r => r.json()),
    fetch('/dashboard_data/model_knn.json').then(r => r.json()),
    fetch('/dashboard_data/model_nb.json').then(r => r.json()),
  ])

  _lrModel  = lr  as LRModel
  _knnModel = knn as KNNModel
  _nbModel  = nb  as NBModel
  return { lr: _lrModel, knn: _knnModel, nb: _nbModel }
}
