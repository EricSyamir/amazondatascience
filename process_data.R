# Data Processing Script for Amazon Sales Dataset Analysis (R version)
# Generates processed data and insights for the dashboard and report

library(dplyr)
library(readr)
library(stringr)
library(jsonlite)
library(purrr)
library(stats)

cat("Loading data...\n")
df <- read_csv("amazon_sales_data.csv", locale = locale(encoding = "UTF-8"))

cat(sprintf("Dataset shape: %d rows, %d columns\n", nrow(df), ncol(df)))
cat("Columns:\n")
print(colnames(df))

cat("\nCleaning data...\n")

# Clean price columns - remove currency symbols and convert to numeric
clean_price <- function(price_str) {
  if (is.na(price_str)) return(NA_real_)
  price_str <- gsub("₹", "", as.character(price_str), fixed = TRUE)
  price_str <- gsub(",", "", price_str, fixed = TRUE)
  price_str <- str_trim(price_str)
  nums <- str_extract_all(price_str, "\\d+\\.?\\d*")[[1]]
  if (length(nums) > 0) {
    return(as.numeric(nums[1]))
  } else {
    return(NA_real_)
  }
}

df$discounted_price_clean <- vapply(df$discounted_price, clean_price, numeric(1))
df$actual_price_clean     <- vapply(df$actual_price, clean_price, numeric(1))

# Calculate discount amount
df$discount_amount <- df$actual_price_clean - df$discounted_price_clean

# Clean discount percentage
clean_discount <- function(discount_str) {
  if (is.na(discount_str)) return(NA_real_)
  discount_str <- gsub("%", "", as.character(discount_str), fixed = TRUE)
  discount_str <- str_trim(discount_str)
  val <- suppressWarnings(as.numeric(discount_str))
  if (is.na(val)) return(NA_real_)
  val
}

df$discount_percentage_clean <- vapply(df$discount_percentage, clean_discount, numeric(1))

# Clean rating
df$rating_clean <- suppressWarnings(as.numeric(df$rating))

# Clean rating_count
clean_rating_count <- function(count_str) {
  if (is.na(count_str)) return(NA_integer_)
  count_str <- gsub(",", "", as.character(count_str), fixed = TRUE)
  count_str <- str_trim(count_str)
  val <- suppressWarnings(as.numeric(count_str))
  if (is.na(val)) return(NA_integer_)
  as.integer(val)
}

df$rating_count_clean <- vapply(df$rating_count, clean_rating_count, integer(1))

# Category analysis
category_stats <- df %>%
  group_by(category) %>%
  summarise(
    avg_rating  = round(mean(rating_clean, na.rm = TRUE), 2),
    product_count = n(),
    avg_price   = round(mean(discounted_price_clean, na.rm = TRUE), 2),
    avg_discount = round(mean(discount_percentage_clean, na.rm = TRUE), 2),
    total_reviews = sum(rating_count_clean, na.rm = TRUE),
    .groups = "drop"
  )

# Price range analysis
df$price_range <- cut(
  df$discounted_price_clean,
  breaks = c(0, 500, 1000, 2000, 5000, Inf),
  labels = c("0-500", "500-1000", "1000-2000", "2000-5000", "5000+"),
  right = TRUE
)

price_range_stats <- df %>%
  group_by(price_range) %>%
  summarise(
    avg_rating = round(mean(rating_clean, na.rm = TRUE), 2),
    product_count = n(),
    .groups = "drop"
  )

# Discount analysis
df$discount_range <- cut(
  df$discount_percentage_clean,
  breaks = c(0, 10, 20, 30, 40, 50, 100),
  labels = c("0-10%", "10-20%", "20-30%", "30-40%", "40-50%", "50%+"),
  right = TRUE
)

discount_stats <- df %>%
  group_by(discount_range) %>%
  summarise(
    avg_rating = round(mean(rating_clean, na.rm = TRUE), 2),
    product_count = n(),
    .groups = "drop"
  )

# Top products by rating
df_sorted_rating <- df %>%
  arrange(desc(rating_clean))
top_rated <- df_sorted_rating %>%
  slice(1:20) %>%
  select(product_name, category, rating_clean, rating_count_clean, discounted_price_clean) %>%
  rename(
    rating = rating_clean,
    rating_count = rating_count_clean,
    discounted_price = discounted_price_clean
  )

# Top categories by average rating
top_categories <- category_stats %>%
  arrange(desc(avg_rating)) %>%
  slice(1:10)

# Summary statistics
summary_stats <- list(
  total_products  = as.integer(nrow(df)),
  total_categories = as.integer(n_distinct(df$category)),
  avg_rating      = as.numeric(mean(df$rating_clean, na.rm = TRUE)),
  avg_price       = as.numeric(mean(df$discounted_price_clean, na.rm = TRUE)),
  avg_discount    = as.numeric(mean(df$discount_percentage_clean, na.rm = TRUE)),
  total_reviews   = as.integer(sum(df$rating_count_clean, na.rm = TRUE))
)

dir.create("dashboard_data", showWarnings = FALSE)

# --- Per-Q&A insight data (tables/charts for dashboard) ---

# Q1: Average rating by category (table)
q1_avg_rating <- category_stats %>%
  mutate(category_short = sapply(strsplit(category, "\\|"), function(x) tail(x, 1))) %>%
  arrange(desc(avg_rating)) %>%
  slice(1:25) %>%
  select(category_short, avg_rating)

write_json(q1_avg_rating, "dashboard_data/insight_q1_avg_rating_by_category.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

# Q2: Top products by rating_count per category (table)
q2_list <- list()
for (cat in unique(df$category)) {
  grp <- df %>% filter(category == cat)
  grp_sorted <- grp %>%
    arrange(desc(rating_count_clean))
  top3 <- head(grp_sorted, 3)
  cat_short <- if (!is.na(cat)) tail(strsplit(cat, "\\|")[[1]], 1) else as.character(cat)
  if (nrow(top3) > 0) {
    for (i in seq_len(nrow(top3))) {
      pname <- as.character(top3$product_name[i])
      if (nchar(pname) > 60) {
        pname_short <- paste0(substr(pname, 1, 60), "...")
      } else {
        pname_short <- pname
      }
      q2_list[[length(q2_list) + 1]] <- list(
        category = cat_short,
        product_name = pname_short,
        rating_count = ifelse(is.na(top3$rating_count_clean[i]), 0L, as.integer(top3$rating_count_clean[i])),
        rating = ifelse(is.na(top3$rating_clean[i]), NA_real_, round(as.numeric(top3$rating_clean[i]), 2))
      )
    }
  }
}
if (length(q2_list) > 30) {
  q2_list <- q2_list[1:30]
}
write_json(q2_list, "dashboard_data/insight_q2_top_products_by_category.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

# Q3: Distribution of discounted vs actual prices (binned counts)
bins <- c(0, 500, 1000, 2000, 5000, 10000, Inf)
labels <- c("0-500", "500-1k", "1k-2k", "2k-5k", "5k-10k", "10k+")

df$`_disc_bin` <- cut(df$discounted_price_clean, breaks = bins, labels = labels, right = TRUE)
df$`_actual_bin` <- cut(df$actual_price_clean, breaks = bins, labels = labels, right = TRUE)

q3_disc <- df %>%
  group_by(`_disc_bin`) %>%
  summarise(discounted_count = n(), .groups = "drop") %>%
  right_join(
    data.frame(`_disc_bin` = factor(labels, levels = labels), check.names = FALSE),
    by = "_disc_bin"
  ) %>%
  mutate(discounted_count = ifelse(is.na(discounted_count), 0L, discounted_count)) %>%
  arrange(`_disc_bin`)

q3_actual <- df %>%
  group_by(`_actual_bin`) %>%
  summarise(actual_count = n(), .groups = "drop") %>%
  right_join(
    data.frame(`_actual_bin` = factor(labels, levels = labels), check.names = FALSE),
    by = "_actual_bin"
  ) %>%
  mutate(actual_count = ifelse(is.na(actual_count), 0L, actual_count)) %>%
  arrange(`_actual_bin`)

q3 <- map2(
  as.character(labels),
  seq_along(labels),
  ~ list(
    price_range = .x,
    discounted_count = as.integer(q3_disc$discounted_count[.y]),
    actual_count = as.integer(q3_actual$actual_count[.y])
  )
)

write_json(q3, "dashboard_data/insight_q3_price_distribution.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

df <- df %>% select(-`_disc_bin`, -`_actual_bin`)

# Q4: Average discount by category (table)
q4_discount <- category_stats %>%
  mutate(category_short = sapply(strsplit(category, "\\|"), function(x) tail(x, 1))) %>%
  arrange(desc(avg_discount)) %>%
  slice(1:25) %>%
  select(category_short, avg_discount)

write_json(q4_discount, "dashboard_data/insight_q4_avg_discount_by_category.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

# Q5: Most popular product names (value_counts)
q5_counts <- df %>%
  group_by(product_name) %>%
  summarise(
    occurrences = n(),
    avg_rating = mean(rating_clean, na.rm = TRUE),
    total_reviews = sum(rating_count_clean, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  arrange(desc(total_reviews)) %>%
  slice(1:15)

q5_counts <- q5_counts %>%
  mutate(
    product_name_short = ifelse(
      nchar(product_name) > 55,
      paste0(substr(product_name, 1, 55), "..."),
      product_name
    )
  ) %>%
  mutate(
    avg_rating = round(avg_rating, 2),
    total_reviews = round(total_reviews, 2)
  )

q5_list <- q5_counts %>%
  select(product_name_short, occurrences, avg_rating, total_reviews) %>%
  split(seq_len(nrow(.))) %>%
  map(as.list)

write_json(q5_list, "dashboard_data/insight_q5_popular_products.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

# Q6: Most popular keywords from product names
extract_keywords <- function(name) {
  if (!is.character(name)) return(character(0))
  words <- unlist(strsplit(name, "\\s+"))
  words <- tolower(words)
  words <- words[str_detect(words, "^[a-zA-Z]+$")]
  words <- words[nchar(words) > 1]
  words
}

all_kw <- unlist(lapply(df$product_name[!is.na(df$product_name)], extract_keywords))
kw_counts <- sort(table(all_kw), decreasing = TRUE)[1:min(20, length(unique(all_kw)))]
q6 <- lapply(seq_along(kw_counts), function(i) {
  list(keyword = names(kw_counts)[i], count = as.integer(kw_counts[i]))
})
write_json(q6, "dashboard_data/insight_q6_keywords.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

# Q7: Top review titles (value_counts)
if ("review_title" %in% colnames(df)) {
  q7_titles <- df %>%
    filter(!is.na(review_title)) %>%
    mutate(review_title = as.character(review_title)) %>%
    count(review_title, name = "count") %>%
    arrange(desc(count)) %>%
    slice(1:15) %>%
    mutate(review_title_short = paste0(substr(review_title, 1, 50), "...")) %>%
    select(review_title_short, count)
  write_json(q7_titles, "dashboard_data/insight_q7_popular_reviews.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)
} else {
  write_json(list(), "dashboard_data/insight_q7_popular_reviews.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)
}

# Q8: Correlation discounted_price vs rating + sample for scatter
if (all(c("discounted_price_clean", "rating_clean") %in% colnames(df))) {
  corr_val <- suppressWarnings(cor(df$discounted_price_clean, df$rating_clean, use = "complete.obs"))
} else {
  corr_val <- NA_real_
}

q8_sample_df <- df %>%
  select(discounted_price_clean, rating_clean) %>%
  filter(!is.na(discounted_price_clean), !is.na(rating_clean))

set.seed(42)
n_sample <- min(80, nrow(q8_sample_df))
if (n_sample > 0) {
  q8_sample_df <- q8_sample_df %>%
    slice_sample(n = n_sample)
} else {
  q8_sample_df <- q8_sample_df[0, ]
}

q8_sample_df <- q8_sample_df %>%
  rename(price = discounted_price_clean, rating = rating_clean) %>%
  mutate(
    price = round(price, 2),
    rating = round(rating, 2)
  )

q8 <- list(
  correlation = round(as.numeric(corr_val), 4),
  scatter = q8_sample_df %>% split(seq_len(nrow(.))) %>% map(as.list)
)

write_json(q8, "dashboard_data/insight_q8_correlation.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

# Q9: Top 5 categories by rating
q9_top5 <- category_stats %>%
  arrange(desc(avg_rating)) %>%
  slice(1:5) %>%
  mutate(category_short = sapply(strsplit(category, "\\|"), function(x) tail(x, 1))) %>%
  select(category_short, avg_rating, product_count)

write_json(q9_top5, "dashboard_data/insight_q9_top5_categories.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

# Save JSON files for dashboard
write_json(summary_stats, "dashboard_data/summary_stats.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)
write_json(category_stats, "dashboard_data/category_stats.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)
write_json(price_range_stats, "dashboard_data/price_range_stats.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)
write_json(discount_stats, "dashboard_data/discount_stats.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)
write_json(top_rated, "dashboard_data/top_rated_products.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)
write_json(top_categories, "dashboard_data/top_categories.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

# Save cleaned dataset
df_clean <- df %>%
  select(
    product_id, product_name, category,
    discounted_price_clean, actual_price_clean, discount_percentage_clean,
    rating_clean, rating_count_clean, price_range, discount_range
  ) %>%
  rename(
    discounted_price = discounted_price_clean,
    actual_price = actual_price_clean,
    discount_percentage = discount_percentage_clean,
    rating = rating_clean,
    rating_count = rating_count_clean
  )

write_csv(df_clean, "dashboard_data/cleaned_data.csv")

# --- Business Insights: Statistical Hypothesis Tests ---
cat("\nComputing Business Insights (statistical tests)...\n")

business_insights <- list()

# 1. Discounts vs Ratings (Do discounts hurt quality perception?)
high_discount <- df$rating_clean[!is.na(df$discount_percentage_clean) & df$discount_percentage_clean >= 30]
low_discount  <- df$rating_clean[!is.na(df$discount_percentage_clean) & df$discount_percentage_clean < 30]

if (length(high_discount) > 0 && length(low_discount) > 0) {
  t_res <- t.test(high_discount, low_discount, var.equal = FALSE)
  p_value <- t_res$p.value
  insight1 <- list(
    id = "insight1",
    question = "Do discounts hurt quality perception?",
    hypothesis = "H0: Average rating of high-discount products = average rating of low-discount products",
    test = "Two-sample t-test",
    high_discount_mean = round(mean(high_discount, na.rm = TRUE), 3),
    low_discount_mean = round(mean(low_discount, na.rm = TRUE), 3),
    high_discount_count = length(high_discount),
    low_discount_count = length(low_discount),
    t_statistic = round(as.numeric(t_res$statistic), 4),
    p_value = round(p_value, 6),
    significant = as.logical(p_value < 0.05),
    interpretation = sprintf(
      "High discounts have %s ratings than low discounts",
      ifelse(p_value < 0.05, "significantly different", "similar")
    ),
    recommendation = ifelse(
      p_value < 0.05 && mean(high_discount, na.rm = TRUE) < mean(low_discount, na.rm = TRUE),
      "Avoid over-discounting core products",
      "Discounts do not significantly impact quality perception"
    )
  )
  business_insights[[length(business_insights) + 1]] <- insight1
}

# 2. Discounts vs Popularity (Do discounts drive engagement?)
high_disc_reviews <- df$rating_count_clean[!is.na(df$discount_percentage_clean) & df$discount_percentage_clean >= 30]
low_disc_reviews  <- df$rating_count_clean[!is.na(df$discount_percentage_clean) & df$discount_percentage_clean < 30]

if (length(high_disc_reviews) > 0 && length(low_disc_reviews) > 0) {
  t_res <- t.test(high_disc_reviews, low_disc_reviews, var.equal = FALSE)
  p_value <- t_res$p.value
  insight2 <- list(
    id = "insight2",
    question = "Do discounts drive engagement?",
    hypothesis = "H0: Mean rating_count for high-discount products = mean rating_count for low-discount products",
    test = "One-sided two-sample t-test",
    high_discount_mean_reviews = round(mean(high_disc_reviews, na.rm = TRUE), 1),
    low_discount_mean_reviews = round(mean(low_disc_reviews, na.rm = TRUE), 1),
    t_statistic = round(as.numeric(t_res$statistic), 4),
    p_value = round(p_value, 6),
    significant = as.logical(p_value < 0.05),
    interpretation = sprintf(
      "High-discount products have %s reviews than low-discount products",
      ifelse(p_value < 0.05 && mean(high_disc_reviews, na.rm = TRUE) > mean(low_disc_reviews, na.rm = TRUE),
             "significantly more", "similar")
    ),
    recommendation = ifelse(
      p_value < 0.05 && mean(high_disc_reviews, na.rm = TRUE) > mean(low_disc_reviews, na.rm = TRUE),
      "Discounts increase engagement",
      "Discounts do not significantly drive engagement"
    )
  )
  business_insights[[length(business_insights) + 1]] <- insight2
}

# 3. Category Quality Comparison (Which categories are strong/weak?)
top_cats <- category_stats %>% arrange(desc(avg_rating)) %>% slice(1:5) %>% pull(category)
bottom_cats <- category_stats %>% arrange(avg_rating) %>% slice(1:5) %>% pull(category)

top_cat_ratings <- df$rating_clean[df$category %in% top_cats]
bottom_cat_ratings <- df$rating_clean[df$category %in% bottom_cats]

top_cat_ratings <- top_cat_ratings[!is.na(top_cat_ratings)]
bottom_cat_ratings <- bottom_cat_ratings[!is.na(bottom_cat_ratings)]

if (length(top_cat_ratings) > 0 && length(bottom_cat_ratings) > 0) {
  t_res <- t.test(top_cat_ratings, bottom_cat_ratings, var.equal = FALSE)
  p_value <- t_res$p.value
  insight3 <- list(
    id = "insight3",
    question = "Which categories are strong/weak?",
    hypothesis = "H0: Mean rating for top categories = mean rating for bottom categories",
    test = "Two-sample t-test",
    top_categories_mean = round(mean(top_cat_ratings, na.rm = TRUE), 3),
    bottom_categories_mean = round(mean(bottom_cat_ratings, na.rm = TRUE), 3),
    top_categories = sapply(strsplit(top_cats[1:min(3, length(top_cats))], "\\|"), function(x) tail(x, 1)),
    bottom_categories = sapply(strsplit(bottom_cats[1:min(3, length(bottom_cats))], "\\|"), function(x) tail(x, 1)),
    t_statistic = round(as.numeric(t_res$statistic), 4),
    p_value = round(p_value, 6),
    significant = as.logical(p_value < 0.05),
    interpretation = sprintf(
      "Top categories have %s ratings than bottom categories",
      ifelse(p_value < 0.05, "significantly higher", "similar")
    ),
    recommendation = ifelse(
      p_value < 0.05,
      "Focus on high-performing categories; investigate low-performing ones",
      "Category ratings are similar"
    )
  )
  business_insights[[length(business_insights) + 1]] <- insight3
}

# 4. Price Tier vs Rating (Do expensive items get better ratings?)
# Create tertiles
price_vec <- df$discounted_price_clean
valid_price <- !is.na(price_vec)
df$price_tier <- NA_character_
if (sum(valid_price) >= 3) {
  # Use quantiles to create 3 tiers
  qcuts <- quantile(price_vec[valid_price], probs = seq(0, 1, length.out = 4), na.rm = TRUE)
  # Make unique breaks
  qcuts[1] <- -Inf
  qcuts[length(qcuts)] <- Inf
  df$price_tier[valid_price] <- cut(price_vec[valid_price],
                                    breaks = qcuts,
                                    labels = c("Low", "Mid", "High"),
                                    include.lowest = TRUE)
}

price_tiers_list <- df %>%
  filter(!is.na(price_tier)) %>%
  group_by(price_tier) %>%
  summarise(ratings = list(rating_clean[!is.na(rating_clean)]), .groups = "drop")

if (nrow(price_tiers_list) >= 3) {
  ratings_list <- price_tiers_list$ratings
  # oneway.test for price tier vs rating (invalid aov call removed — was unused)
  combined_ratings <- unlist(ratings_list)
  groups <- factor(rep(price_tiers_list$price_tier, times = sapply(ratings_list, length)))
  anova_res <- oneway.test(combined_ratings ~ groups)
  p_value <- anova_res$p.value

  tier_means <- list()
  for (tier in c("Low", "Mid", "High")) {
    if (tier %in% df$price_tier) {
      tier_means[[tier]] <- round(mean(df$rating_clean[df$price_tier == tier], na.rm = TRUE), 3)
    }
  }

  if (length(tier_means) > 0) {
    best_tier <- names(tier_means)[which.max(unlist(tier_means))]
  } else {
    best_tier <- NA_character_
  }

  insight4 <- list(
    id = "insight4",
    question = "Do expensive items get better ratings?",
    hypothesis = "H0: Mean rating is the same across price tiers",
    test = "One-way ANOVA",
    tier_means = tier_means,
    f_statistic = round(as.numeric(anova_res$statistic), 4),
    p_value = round(p_value, 6),
    significant = as.logical(p_value < 0.05),
    interpretation = sprintf(
      "Price tiers have %s ratings",
      ifelse(p_value < 0.05, "significantly different", "similar")
    ),
    recommendation = ifelse(
      !is.na(best_tier) && p_value < 0.05,
      paste0("Focus on ", best_tier, " price segment"),
      "Price does not significantly affect ratings"
    )
  )
  business_insights[[length(business_insights) + 1]] <- insight4
}

# 5. Discount Level Differences by Category
top_10_cats <- category_stats %>%
  arrange(desc(product_count)) %>%
  slice(1:10) %>%
  pull(category)

df_top10 <- df %>% filter(category %in% top_10_cats)

if (nrow(df_top10) > 0) {
  combined_discounts <- df_top10$discount_percentage_clean
  groups_cat <- factor(df_top10$category)
  anova_res <- oneway.test(combined_discounts ~ groups_cat)
  p_value <- anova_res$p.value

  # Means for first 5 categories
  cat_discount_means <- list()
  for (cat in head(top_10_cats, 5)) {
    cat_short <- tail(strsplit(cat, "\\|")[[1]], 1)
    cat_discount_means[[cat_short]] <- round(
      mean(df$discount_percentage_clean[df$category == cat], na.rm = TRUE),
      2
    )
  }

  insight5 <- list(
    id = "insight5",
    question = "Different discount strategies per category?",
    hypothesis = "H0: Mean discount_percentage is equal across all categories",
    test = "One-way ANOVA",
    category_discount_means = cat_discount_means,
    f_statistic = round(as.numeric(anova_res$statistic), 4),
    p_value = round(p_value, 6),
    significant = as.logical(p_value < 0.05),
    interpretation = sprintf(
      "Categories have %s discount levels",
      ifelse(p_value < 0.05, "significantly different", "similar")
    ),
    recommendation = ifelse(
      p_value < 0.05,
      "Adjust pricing policy - some categories are over-subsidized",
      "Discount strategies are consistent across categories"
    )
  )
  business_insights[[length(business_insights) + 1]] <- insight5
}

# 6. Correlation: discount_percentage vs rating
if (all(c("discount_percentage_clean", "rating_clean") %in% colnames(df))) {
  corr <- suppressWarnings(cor(df$discount_percentage_clean, df$rating_clean, use = "complete.obs"))
  complete_idx <- complete.cases(df[, c("discount_percentage_clean", "rating_clean")])
  n <- sum(complete_idx)
  if (n > 2 && !is.na(corr)) {
    t_corr <- corr * sqrt((n - 2) / (1 - corr^2))
    p_value_corr <- 2 * (1 - pt(abs(t_corr), df = n - 2))
    insight6 <- list(
      id = "insight6",
      question = "Correlation: discount vs rating",
      hypothesis = "H0: Correlation ρ = 0",
      test = "Pearson correlation test",
      correlation = round(as.numeric(corr), 4),
      p_value = round(p_value_corr, 6),
      significant = as.logical(p_value_corr < 0.05),
      interpretation = sprintf(
        "Discount and rating are %s correlated",
        ifelse(p_value_corr < 0.05, "significantly", "not significantly")
      ),
      recommendation = sprintf(
        "Discounts %s affect ratings",
        ifelse(p_value_corr < 0.05, "do", "do not significantly")
      )
    )
    business_insights[[length(business_insights) + 1]] <- insight6
  }
}

# 7. Top Products vs Others (Quality of best-sellers)
top_10_pct_threshold <- quantile(df$rating_count_clean, 0.9, na.rm = TRUE)
top_products <- df$rating_clean[df$rating_count_clean >= top_10_pct_threshold]
other_products <- df$rating_clean[df$rating_count_clean < top_10_pct_threshold]

top_products <- top_products[!is.na(top_products)]
other_products <- other_products[!is.na(other_products)]

if (length(top_products) > 0 && length(other_products) > 0) {
  t_res <- t.test(top_products, other_products, var.equal = FALSE)
  p_value <- t_res$p.value
  insight7 <- list(
    id = "insight7",
    question = "Quality of best-sellers",
    hypothesis = "H0: Mean rating of top products = mean rating of other products",
    test = "One-sided two-sample t-test",
    top_products_mean = round(mean(top_products, na.rm = TRUE), 3),
    other_products_mean = round(mean(other_products, na.rm = TRUE), 3),
    top_products_count = length(top_products),
    other_products_count = length(other_products),
    t_statistic = round(as.numeric(t_res$statistic), 4),
    p_value = round(p_value, 6),
    significant = as.logical(p_value < 0.05),
    interpretation = sprintf(
      "Top products have %s ratings than others",
      ifelse(p_value < 0.05 && mean(top_products, na.rm = TRUE) > mean(other_products, na.rm = TRUE),
             "significantly higher", "similar")
    ),
    recommendation = ifelse(
      p_value < 0.05 && mean(top_products, na.rm = TRUE) > mean(other_products, na.rm = TRUE),
      "Best-sellers are truly higher quality",
      "Best-sellers have similar quality to others"
    )
  )
  business_insights[[length(business_insights) + 1]] <- insight7
}

# Save business insights
write_json(business_insights, "dashboard_data/business_insights.json", pretty = TRUE, auto_unbox = TRUE, digits = 15)

cat("\nData processing complete!\n")
cat("\nSummary Statistics:\n")
for (nm in names(summary_stats)) {
  cat(sprintf("  %s: %s\n", nm, as.character(summary_stats[[nm]])))
}
cat(sprintf("\nBusiness Insights computed: %d\n", length(business_insights)))
