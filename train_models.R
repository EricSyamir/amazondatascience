# Model Training Script — Amazon Sales Dataset
# Trains 2 prediction models and exports them as JSON for use in the Next.js dashboard
#
# Prediction 1: Linear Regression  → predict product rating (1–5)
# Prediction 2: KNN Classifier     → predict if product is high-rated (rating >= 4.2)
#
# Features used (no category — avoids category bias):
#   discounted_price, actual_price, discount_pct, discount_amount
#
# Output files (written to both dashboard_data/ and dashboard/public/dashboard_data/):
#   model_lr.json  — LR intercept + coefficients + scaling params + metrics
#   model_knn.json — KNN training data (normalised) + k + scaling params + metrics

library(dplyr)
library(readr)
library(jsonlite)
library(class)

set.seed(42)

# ── 1. Load & clean data ──────────────────────────────────────────────────────

cat("Loading data...\n")
raw <- read_csv("amazon_sales_data.csv", locale = locale(encoding = "UTF-8"),
                show_col_types = FALSE)

clean_price <- function(x) {
  if (is.na(x)) return(NA_real_)
  x <- gsub("[\u20b9,]", "", as.character(x))
  x <- trimws(x)
  nums <- regmatches(x, gregexpr("\\d+\\.?\\d*", x))[[1]]
  if (length(nums)) as.numeric(nums[1]) else NA_real_
}

clean_discount <- function(x) {
  if (is.na(x)) return(NA_real_)
  val <- suppressWarnings(as.numeric(gsub("%", "", as.character(x))))
  if (is.na(val)) NA_real_ else val
}

df <- raw %>%
  mutate(
    discounted_price = vapply(discounted_price, clean_price, numeric(1)),
    actual_price     = vapply(actual_price,     clean_price, numeric(1)),
    discount_pct     = vapply(discount_percentage, clean_discount, numeric(1)),
    rating           = suppressWarnings(as.numeric(rating)),
    discount_amount  = actual_price - discounted_price
  ) %>%
  filter(
    !is.na(discounted_price), !is.na(actual_price),
    !is.na(discount_pct),     !is.na(rating),
    discounted_price > 0, actual_price > 0,
    discount_pct >= 0, discount_pct <= 100,
    rating >= 1, rating <= 5
  )

cat(sprintf("Clean rows: %d\n", nrow(df)))

# ── 2. Feature matrix & targets ───────────────────────────────────────────────
#
# LR uses 3 features — discount_amount is excluded because it equals
# (actual_price - discounted_price), making it perfectly collinear and causing
# an NA coefficient that propagates as NaN in JavaScript.
# KNN is unaffected by collinearity, so it keeps all 4 features.

LR_FEATURES  <- c("discounted_price", "actual_price", "discount_pct")
KNN_FEATURES <- c("discounted_price", "actual_price", "discount_pct", "discount_amount")

X_lr  <- df[, LR_FEATURES]
X_knn <- df[, KNN_FEATURES]
y_reg <- df$rating
y_cls <- as.integer(df$rating >= 4.2)   # 1 = high-rated, 0 = not

cat(sprintf("Class balance — high-rated: %d  (%.1f%%)  |  other: %d  (%.1f%%)\n",
    sum(y_cls), 100 * mean(y_cls), sum(1 - y_cls), 100 * mean(1 - y_cls)))

# ── 3. Standardise (z-score) per feature set ─────────────────────────────────

scale_features <- function(X, feat_names) {
  means <- colMeans(X)
  stds  <- apply(X, 2, sd)
  stds[stds == 0] <- 1
  scaled <- as.data.frame(mapply(function(col, m, s) (col - m) / s, X, means, stds))
  colnames(scaled) <- feat_names
  list(scaled = scaled, means = means, stds = stds)
}

lr_scaled  <- scale_features(X_lr,  LR_FEATURES)
knn_scaled <- scale_features(X_knn, KNN_FEATURES)

# ── 4. Train / test split (80 / 20) ──────────────────────────────────────────

n         <- nrow(df)
train_idx <- sample(n, floor(0.8 * n))
test_idx  <- setdiff(seq_len(n), train_idx)

# LR split
Xtr_lr <- lr_scaled$scaled[train_idx, ];  Xte_lr <- lr_scaled$scaled[test_idx, ]
# KNN split
Xtr_knn <- knn_scaled$scaled[train_idx, ]; Xte_knn <- knn_scaled$scaled[test_idx, ]

ytr_reg <- y_reg[train_idx];   yte_reg <- y_reg[test_idx]
ytr_cls <- y_cls[train_idx];   yte_cls <- y_cls[test_idx]

# ═════════════════════════════════════════════════════════════════════════════
# MODEL 1 — Linear Regression
# ═════════════════════════════════════════════════════════════════════════════

cat("\n── Linear Regression ──\n")

lm_df    <- cbind(Xtr_lr, rating = ytr_reg)
lm_model <- lm(rating ~ ., data = lm_df)

preds_lr <- predict(lm_model, newdata = Xte_lr)
preds_lr <- pmax(1, pmin(5, preds_lr))

mae  <- mean(abs(preds_lr - yte_reg))
rmse <- sqrt(mean((preds_lr - yte_reg)^2))
ss_res <- sum((yte_reg - preds_lr)^2)
ss_tot <- sum((yte_reg - mean(yte_reg))^2)
r2   <- 1 - ss_res / ss_tot

cat(sprintf("  MAE:  %.4f\n  RMSE: %.4f\n  R²:   %.4f\n", mae, rmse, r2))

coefs <- coef(lm_model)

# Verify no NA coefficients
if (any(is.na(coefs))) stop("NA coefficients detected — check feature collinearity!")
cat("  All coefficients are valid (no NA).\n")

model_lr <- list(
  type          = "linear_regression",
  features      = LR_FEATURES,
  intercept     = as.numeric(coefs[1]),
  coefficients  = as.list(coefs[-1]),
  feature_means = as.list(lr_scaled$means),
  feature_stds  = as.list(lr_scaled$stds),
  metrics       = list(mae = round(mae, 4), rmse = round(rmse, 4), r2 = round(r2, 4)),
  description   = "Predicts product rating (1–5) from 3 pricing features — no category or collinear bias"
)

# ═════════════════════════════════════════════════════════════════════════════
# MODEL 2 — KNN Classifier
# ═════════════════════════════════════════════════════════════════════════════

cat("\n── KNN Classifier ──\n")

best_k <- 5; best_acc <- 0
for (k in c(3, 5, 7, 9, 11, 13, 15)) {
  preds_k <- knn(Xtr_knn, Xte_knn, cl = ytr_cls, k = k)
  acc     <- mean(as.integer(as.character(preds_k)) == yte_cls)
  cat(sprintf("  k = %2d  accuracy = %.4f\n", k, acc))
  if (acc > best_acc) { best_acc <- acc; best_k <- k }
}
cat(sprintf("Best k = %d  (accuracy = %.4f)\n", best_k, best_acc))

final_preds <- knn(Xtr_knn, Xte_knn, cl = ytr_cls, k = best_k)
knn_labels  <- as.integer(as.character(final_preds))

# Confusion matrix metrics
tp <- sum(knn_labels == 1 & yte_cls == 1)
fp <- sum(knn_labels == 1 & yte_cls == 0)
fn <- sum(knn_labels == 0 & yte_cls == 1)
tn <- sum(knn_labels == 0 & yte_cls == 0)

precision <- if ((tp + fp) > 0) tp / (tp + fp) else 0
recall    <- if ((tp + fn) > 0) tp / (tp + fn) else 0
f1        <- if ((precision + recall) > 0) 2 * precision * recall / (precision + recall) else 0

cat(sprintf("  Precision: %.4f  Recall: %.4f  F1: %.4f\n", precision, recall, f1))
cat(sprintf("  Confusion matrix — TP:%d FP:%d FN:%d TN:%d\n", tp, fp, fn, tn))

# Export training data (normalised) for JavaScript KNN inference
knn_train_data <- lapply(seq_len(nrow(Xtr_knn)), function(i) {
  list(f = round(as.numeric(Xtr_knn[i, ]), 6), l = as.integer(ytr_cls[i]))
})

model_knn <- list(
  type          = "knn_classifier",
  k             = best_k,
  features      = KNN_FEATURES,
  threshold     = 4.2,
  feature_means = as.list(knn_scaled$means),
  feature_stds  = as.list(knn_scaled$stds),
  training_data = knn_train_data,
  metrics       = list(
    accuracy  = round(best_acc, 4),
    precision = round(precision, 4),
    recall    = round(recall,    4),
    f1        = round(f1,        4),
    confusion  = list(tp = tp, fp = fp, fn = fn, tn = tn)
  ),
  description = "Classifies if a product will be high-rated (>=4.2) — no category bias"
)

# ── 5. Write JSON to both data dirs ──────────────────────────────────────────

output_dirs <- c("dashboard_data", "dashboard/public/dashboard_data")
for (d in output_dirs) {
  dir.create(d, showWarnings = FALSE, recursive = TRUE)
  write_json(model_lr,  file.path(d, "model_lr.json"),
             pretty = TRUE, auto_unbox = TRUE, digits = 10)
  write_json(model_knn, file.path(d, "model_knn.json"),
             pretty = TRUE, auto_unbox = TRUE, digits = 6)
  cat(sprintf("Written to %s/\n", d))
}

cat("\nDone. Models ready for the dashboard.\n")
