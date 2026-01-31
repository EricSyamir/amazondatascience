"""
Data Processing Script for Amazon Sales Dataset Analysis
Generates processed data and insights for the dashboard and report
"""

import pandas as pd
import numpy as np
import json
import re
from collections import Counter
from scipy import stats

# Read the dataset
print("Loading data...")
df = pd.read_csv('amazon_sales_data.csv', encoding='utf-8')

# Basic statistics
print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# Data cleaning and preprocessing
print("\nCleaning data...")

# Clean price columns - remove currency symbols and convert to float
def clean_price(price_str):
    if pd.isna(price_str):
        return None
    # Remove currency symbols and commas
    price_str = str(price_str).replace('₹', '').replace(',', '').strip()
    # Extract numbers
    numbers = re.findall(r'\d+\.?\d*', price_str)
    if numbers:
        return float(numbers[0])
    return None

df['discounted_price_clean'] = df['discounted_price'].apply(clean_price)
df['actual_price_clean'] = df['actual_price'].apply(clean_price)

# Calculate discount amount
df['discount_amount'] = df['actual_price_clean'] - df['discounted_price_clean']

# Clean discount percentage
def clean_discount(discount_str):
    if pd.isna(discount_str):
        return None
    discount_str = str(discount_str).replace('%', '').strip()
    try:
        return float(discount_str)
    except:
        return None

df['discount_percentage_clean'] = df['discount_percentage'].apply(clean_discount)

# Clean rating
df['rating_clean'] = pd.to_numeric(df['rating'], errors='coerce')

# Clean rating_count
def clean_rating_count(count_str):
    if pd.isna(count_str):
        return None
    count_str = str(count_str).replace(',', '').strip()
    try:
        return int(float(count_str))
    except:
        return None

df['rating_count_clean'] = df['rating_count'].apply(clean_rating_count)

# Category analysis
category_stats = df.groupby('category').agg({
    'rating_clean': ['mean', 'count'],
    'discounted_price_clean': 'mean',
    'discount_percentage_clean': 'mean',
    'rating_count_clean': 'sum'
}).round(2)

category_stats.columns = ['avg_rating', 'product_count', 'avg_price', 'avg_discount', 'total_reviews']
category_stats = category_stats.reset_index()

# Price range analysis
df['price_range'] = pd.cut(df['discounted_price_clean'], 
                          bins=[0, 500, 1000, 2000, 5000, float('inf')],
                          labels=['0-500', '500-1000', '1000-2000', '2000-5000', '5000+'])

price_range_stats = df.groupby('price_range', observed=False).agg({
    'rating_clean': 'mean',
    'product_id': 'count'
}).round(2)
price_range_stats.columns = ['avg_rating', 'product_count']
price_range_stats = price_range_stats.reset_index()

# Discount analysis
df['discount_range'] = pd.cut(df['discount_percentage_clean'],
                              bins=[0, 10, 20, 30, 40, 50, 100],
                              labels=['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50%+'])

discount_stats = df.groupby('discount_range', observed=False).agg({
    'rating_clean': 'mean',
    'product_id': 'count'
}).round(2)
discount_stats.columns = ['avg_rating', 'product_count']
discount_stats = discount_stats.reset_index()

# Top products by rating (rename for dashboard compatibility)
top_rated = df.nlargest(20, 'rating_clean')[['product_name', 'category', 'rating_clean', 'rating_count_clean', 'discounted_price_clean']]
top_rated = top_rated.rename(columns={
    'rating_clean': 'rating',
    'rating_count_clean': 'rating_count',
    'discounted_price_clean': 'discounted_price'
})

# Top categories by average rating
top_categories = category_stats.nlargest(10, 'avg_rating')

# Save processed data for dashboard
print("\nSaving processed data...")

# Summary statistics
summary_stats = {
    'total_products': int(len(df)),
    'total_categories': int(df['category'].nunique()),
    'avg_rating': float(df['rating_clean'].mean()),
    'avg_price': float(df['discounted_price_clean'].mean()),
    'avg_discount': float(df['discount_percentage_clean'].mean()),
    'total_reviews': int(df['rating_count_clean'].sum())
}

# --- Per-Q&A insight data (tables/charts for dashboard) ---

# Q1: Average rating by category (table)
q1_avg_rating = category_stats[['category', 'avg_rating']].copy()
q1_avg_rating['category_short'] = q1_avg_rating['category'].str.split('|').str[-1]
q1_avg_rating = q1_avg_rating.sort_values('avg_rating', ascending=False).head(25)
q1_avg_rating[['category_short', 'avg_rating']].round(2).to_json('dashboard_data/insight_q1_avg_rating_by_category.json', orient='records', indent=2)

# Q2: Top products by rating_count per category (table)
q2_list = []
for cat, grp in df.groupby('category'):
    top3 = grp.nlargest(3, 'rating_count_clean')[['product_name', 'rating_count_clean', 'rating_clean']]
    cat_short = cat.split('|')[-1] if isinstance(cat, str) else str(cat)
    for _, row in top3.iterrows():
        q2_list.append({
            'category': cat_short,
            'product_name': (row['product_name'][:60] + '...') if len(str(row['product_name'])) > 60 else row['product_name'],
            'rating_count': int(row['rating_count_clean']) if pd.notna(row['rating_count_clean']) else 0,
            'rating': round(float(row['rating_clean']), 2) if pd.notna(row['rating_clean']) else None
        })
# Limit to first 30 rows for dashboard
with open('dashboard_data/insight_q2_top_products_by_category.json', 'w', encoding='utf-8') as f:
    json.dump(q2_list[:30], f, indent=2)

# Q3: Distribution of discounted vs actual prices (binned counts)
bins = [0, 500, 1000, 2000, 5000, 10000, float('inf')]
labels = ['0-500', '500-1k', '1k-2k', '2k-5k', '5k-10k', '10k+']
df['_disc_bin'] = pd.cut(df['discounted_price_clean'], bins=bins, labels=labels)
df['_actual_bin'] = pd.cut(df['actual_price_clean'], bins=bins, labels=labels)
q3_disc = df.groupby('_disc_bin', observed=False).size().reindex(labels, fill_value=0).reset_index(name='discounted_count')
q3_actual = df.groupby('_actual_bin', observed=False).size().reindex(labels, fill_value=0).reset_index(name='actual_count')
q3 = [{'price_range': str(r), 'discounted_count': int(d), 'actual_count': int(a)} for r, d, a in zip(q3_disc['_disc_bin'], q3_disc['discounted_count'], q3_actual['actual_count'])]
with open('dashboard_data/insight_q3_price_distribution.json', 'w', encoding='utf-8') as f:
    json.dump(q3, f, indent=2)
df.drop(columns=['_disc_bin', '_actual_bin'], inplace=True)

# Q4: Average discount by category (table)
q4_discount = category_stats[['category', 'avg_discount']].copy()
q4_discount['category_short'] = q4_discount['category'].str.split('|').str[-1]
q4_discount = q4_discount.sort_values('avg_discount', ascending=False).head(25)
q4_discount[['category_short', 'avg_discount']].round(2).to_json('dashboard_data/insight_q4_avg_discount_by_category.json', orient='records', indent=2)

# Q5: Most popular product names (value_counts)
q5_counts = df.groupby('product_name').agg({'product_id': 'count', 'rating_clean': 'mean', 'rating_count_clean': 'sum'}).reset_index()
q5_counts.columns = ['product_name', 'occurrences', 'avg_rating', 'total_reviews']
q5_counts = q5_counts.sort_values('total_reviews', ascending=False).head(15)
q5_counts['product_name_short'] = q5_counts['product_name'].apply(lambda x: (x[:55] + '...') if len(str(x)) > 55 else x)
q5_list = q5_counts[['product_name_short', 'occurrences', 'avg_rating', 'total_reviews']].round(2).to_dict('records')
with open('dashboard_data/insight_q5_popular_products.json', 'w', encoding='utf-8') as f:
    json.dump(q5_list, f, indent=2)

# Q6: Most popular keywords from product names
def extract_keywords(name):
    if not isinstance(name, str):
        return []
    return [w.lower() for w in name.split() if w.isalpha() and len(w) > 1]
all_kw = []
for name in df['product_name'].dropna():
    all_kw.extend(extract_keywords(name))
kw_counts = pd.Series(all_kw).value_counts().head(20)
q6 = [{'keyword': k, 'count': int(v)} for k, v in kw_counts.items()]
with open('dashboard_data/insight_q6_keywords.json', 'w', encoding='utf-8') as f:
    json.dump(q6, f, indent=2)

# Q7: Top review titles (value_counts)
if 'review_title' in df.columns:
    q7_titles = df['review_title'].dropna().astype(str).value_counts().head(15).reset_index()
    q7_titles.columns = ['review_title', 'count']
    q7_titles['review_title_short'] = q7_titles['review_title'].str[:50] + '...'
    q7_titles[['review_title_short', 'count']].to_json('dashboard_data/insight_q7_popular_reviews.json', orient='records', indent=2)
else:
    with open('dashboard_data/insight_q7_popular_reviews.json', 'w', encoding='utf-8') as f:
        json.dump([], f)

# Q8: Correlation discounted_price vs rating + sample for scatter
corr_val = df['discounted_price_clean'].corr(df['rating_clean'])
q8_sample = df[['discounted_price_clean', 'rating_clean']].dropna().sample(n=min(80, len(df)), random_state=42)
q8 = {'correlation': round(float(corr_val), 4), 'scatter': q8_sample.rename(columns={'discounted_price_clean': 'price', 'rating_clean': 'rating'}).round(2).to_dict('records')}
with open('dashboard_data/insight_q8_correlation.json', 'w', encoding='utf-8') as f:
    json.dump(q8, f, indent=2)

# Q9: Top 5 categories by rating (already have top_categories)
q9_top5 = category_stats.nlargest(5, 'avg_rating')[['category', 'avg_rating', 'product_count']].copy()
q9_top5['category_short'] = q9_top5['category'].str.split('|').str[-1]
q9_top5[['category_short', 'avg_rating', 'product_count']].round(2).to_json('dashboard_data/insight_q9_top5_categories.json', orient='records', indent=2)

# Save JSON files for dashboard
with open('dashboard_data/summary_stats.json', 'w', encoding='utf-8') as f:
    json.dump(summary_stats, f, indent=2)

category_stats.to_json('dashboard_data/category_stats.json', orient='records', indent=2)
price_range_stats.to_json('dashboard_data/price_range_stats.json', orient='records', indent=2)
discount_stats.to_json('dashboard_data/discount_stats.json', orient='records', indent=2)
top_rated.to_json('dashboard_data/top_rated_products.json', orient='records', indent=2)
top_categories.to_json('dashboard_data/top_categories.json', orient='records', indent=2)

# Save cleaned dataset
df_clean = df[[
    'product_id', 'product_name', 'category', 
    'discounted_price_clean', 'actual_price_clean', 'discount_percentage_clean',
    'rating_clean', 'rating_count_clean', 'price_range', 'discount_range'
]].rename(columns={
    'discounted_price_clean': 'discounted_price',
    'actual_price_clean': 'actual_price',
    'discount_percentage_clean': 'discount_percentage',
    'rating_clean': 'rating',
    'rating_count_clean': 'rating_count'
})

df_clean.to_csv('dashboard_data/cleaned_data.csv', index=False)

# --- Business Insights: Statistical Hypothesis Tests ---
print("\nComputing Business Insights (statistical tests)...")

business_insights = []

# 1. Discounts vs Ratings (Do discounts hurt quality perception?)
high_discount = df[df['discount_percentage_clean'] >= 30]['rating_clean'].dropna()
low_discount = df[df['discount_percentage_clean'] < 30]['rating_clean'].dropna()
if len(high_discount) > 0 and len(low_discount) > 0:
    t_stat, p_value = stats.ttest_ind(high_discount, low_discount)
    business_insights.append({
        'id': 'insight1',
        'question': 'Do discounts hurt quality perception?',
        'hypothesis': 'H0: Average rating of high-discount products = average rating of low-discount products',
        'test': 'Two-sample t-test',
        'high_discount_mean': round(float(high_discount.mean()), 3),
        'low_discount_mean': round(float(low_discount.mean()), 3),
        'high_discount_count': int(len(high_discount)),
        'low_discount_count': int(len(low_discount)),
        't_statistic': round(float(t_stat), 4),
        'p_value': round(float(p_value), 6),
        'significant': bool(p_value < 0.05),
        'interpretation': 'High discounts have {} ratings than low discounts'.format('significantly different' if p_value < 0.05 else 'similar'),
        'recommendation': 'Avoid over-discounting core products' if p_value < 0.05 and high_discount.mean() < low_discount.mean() else 'Discounts do not significantly impact quality perception'
    })

# 2. Discounts vs Popularity (Do discounts drive engagement?)
high_disc_reviews = df[df['discount_percentage_clean'] >= 30]['rating_count_clean'].dropna()
low_disc_reviews = df[df['discount_percentage_clean'] < 30]['rating_count_clean'].dropna()
if len(high_disc_reviews) > 0 and len(low_disc_reviews) > 0:
    t_stat, p_value = stats.ttest_ind(high_disc_reviews, low_disc_reviews)
    business_insights.append({
        'id': 'insight2',
        'question': 'Do discounts drive engagement?',
        'hypothesis': 'H0: Mean rating_count for high-discount products = mean rating_count for low-discount products',
        'test': 'One-sided two-sample t-test',
        'high_discount_mean_reviews': round(float(high_disc_reviews.mean()), 1),
        'low_discount_mean_reviews': round(float(low_disc_reviews.mean()), 1),
        't_statistic': round(float(t_stat), 4),
        'p_value': round(float(p_value), 6),
        'significant': bool(p_value < 0.05),
        'interpretation': 'High-discount products have {} reviews than low-discount products'.format('significantly more' if p_value < 0.05 and high_disc_reviews.mean() > low_disc_reviews.mean() else 'similar'),
        'recommendation': 'Discounts increase engagement' if p_value < 0.05 and high_disc_reviews.mean() > low_disc_reviews.mean() else 'Discounts do not significantly drive engagement'
    })

# 3. Category Quality Comparison (Which categories are strong/weak?)
# Top 5 vs Bottom 5 categories by avg rating
top_cats = category_stats.nlargest(5, 'avg_rating')['category'].tolist()
bottom_cats = category_stats.nsmallest(5, 'avg_rating')['category'].tolist()
top_cat_ratings = df[df['category'].isin(top_cats)]['rating_clean'].dropna()
bottom_cat_ratings = df[df['category'].isin(bottom_cats)]['rating_clean'].dropna()
if len(top_cat_ratings) > 0 and len(bottom_cat_ratings) > 0:
    t_stat, p_value = stats.ttest_ind(top_cat_ratings, bottom_cat_ratings)
    business_insights.append({
        'id': 'insight3',
        'question': 'Which categories are strong/weak?',
        'hypothesis': 'H0: Mean rating for top categories = mean rating for bottom categories',
        'test': 'Two-sample t-test',
        'top_categories_mean': round(float(top_cat_ratings.mean()), 3),
        'bottom_categories_mean': round(float(bottom_cat_ratings.mean()), 3),
        'top_categories': [cat.split('|')[-1] for cat in top_cats[:3]],
        'bottom_categories': [cat.split('|')[-1] for cat in bottom_cats[:3]],
        't_statistic': round(float(t_stat), 4),
        'p_value': round(float(p_value), 6),
        'significant': bool(p_value < 0.05),
        'interpretation': 'Top categories have {} ratings than bottom categories'.format('significantly higher' if p_value < 0.05 else 'similar'),
        'recommendation': 'Focus on high-performing categories; investigate low-performing ones' if p_value < 0.05 else 'Category ratings are similar'
    })

# 4. Price Tier vs Rating (Do expensive items get better ratings?)
df['price_tier'] = pd.qcut(df['discounted_price_clean'], q=3, labels=['Low', 'Mid', 'High'], duplicates='drop')
price_tiers = df.groupby('price_tier', observed=False)['rating_clean'].apply(lambda x: x.dropna().tolist())
if len(price_tiers) >= 3:
    f_stat, p_value = stats.f_oneway(*price_tiers.values)
    tier_means = {tier: round(float(df[df['price_tier'] == tier]['rating_clean'].mean()), 3) for tier in ['Low', 'Mid', 'High'] if tier in df['price_tier'].values}
    business_insights.append({
        'id': 'insight4',
        'question': 'Do expensive items get better ratings?',
        'hypothesis': 'H0: Mean rating is the same across price tiers',
        'test': 'One-way ANOVA',
        'tier_means': tier_means,
        'f_statistic': round(float(f_stat), 4),
        'p_value': round(float(p_value), 6),
        'significant': bool(p_value < 0.05),
        'interpretation': 'Price tiers have {} ratings'.format('significantly different' if p_value < 0.05 else 'similar'),
        'recommendation': 'Focus on {} price segment'.format(max(tier_means, key=tier_means.get)) if p_value < 0.05 else 'Price does not significantly affect ratings'
    })

# 5. Discount Level Differences by Category
# ANOVA: discount_percentage ~ category (top 10 categories by product count)
top_10_cats = category_stats.nlargest(10, 'product_count')['category'].tolist()
cat_discounts = df[df['category'].isin(top_10_cats)].groupby('category')['discount_percentage_clean'].apply(lambda x: x.dropna().tolist())
if len(cat_discounts) >= 2:
    f_stat, p_value = stats.f_oneway(*cat_discounts.values)
    cat_discount_means = {cat.split('|')[-1]: round(float(df[df['category'] == cat]['discount_percentage_clean'].mean()), 2) for cat in top_10_cats[:5]}
    business_insights.append({
        'id': 'insight5',
        'question': 'Different discount strategies per category?',
        'hypothesis': 'H0: Mean discount_percentage is equal across all categories',
        'test': 'One-way ANOVA',
        'category_discount_means': cat_discount_means,
        'f_statistic': round(float(f_stat), 4),
        'p_value': round(float(p_value), 6),
        'significant': bool(p_value < 0.05),
        'interpretation': 'Categories have {} discount levels'.format('significantly different' if p_value < 0.05 else 'similar'),
        'recommendation': 'Adjust pricing policy - some categories are over-subsidized' if p_value < 0.05 else 'Discount strategies are consistent across categories'
    })

# 6. Correlation: discount_percentage vs rating
discount_rating_corr = df['discount_percentage_clean'].corr(df['rating_clean'])
# Test H0: correlation = 0
n = len(df[['discount_percentage_clean', 'rating_clean']].dropna())
if n > 2:
    t_corr = discount_rating_corr * np.sqrt((n - 2) / (1 - discount_rating_corr**2))
    p_value_corr = 2 * (1 - stats.t.cdf(abs(t_corr), n - 2))
    business_insights.append({
        'id': 'insight6',
        'question': 'Correlation: discount vs rating',
        'hypothesis': 'H0: Correlation ρ = 0',
        'test': 'Pearson correlation test',
        'correlation': round(float(discount_rating_corr), 4),
        'p_value': round(float(p_value_corr), 6),
        'significant': bool(p_value_corr < 0.05),
        'interpretation': 'Discount and rating are {} correlated'.format('significantly' if p_value_corr < 0.05 else 'not significantly'),
        'recommendation': 'Discounts {} affect ratings'.format('do' if p_value_corr < 0.05 else 'do not significantly')
    })

# 7. Top Products vs Others (Quality of best-sellers)
top_10_pct_threshold = df['rating_count_clean'].quantile(0.9)
top_products = df[df['rating_count_clean'] >= top_10_pct_threshold]['rating_clean'].dropna()
other_products = df[df['rating_count_clean'] < top_10_pct_threshold]['rating_clean'].dropna()
if len(top_products) > 0 and len(other_products) > 0:
    t_stat, p_value = stats.ttest_ind(top_products, other_products)
    business_insights.append({
        'id': 'insight7',
        'question': 'Quality of best-sellers',
        'hypothesis': 'H0: Mean rating of top products = mean rating of other products',
        'test': 'One-sided two-sample t-test',
        'top_products_mean': round(float(top_products.mean()), 3),
        'other_products_mean': round(float(other_products.mean()), 3),
        'top_products_count': int(len(top_products)),
        'other_products_count': int(len(other_products)),
        't_statistic': round(float(t_stat), 4),
        'p_value': round(float(p_value), 6),
        'significant': bool(p_value < 0.05),
        'interpretation': 'Top products have {} ratings than others'.format('significantly higher' if p_value < 0.05 and top_products.mean() > other_products.mean() else 'similar'),
        'recommendation': 'Best-sellers are truly higher quality' if p_value < 0.05 and top_products.mean() > other_products.mean() else 'Best-sellers have similar quality to others'
    })

# Save business insights
with open('dashboard_data/business_insights.json', 'w', encoding='utf-8') as f:
    json.dump(business_insights, f, indent=2)

print("\nData processing complete!")
print(f"\nSummary Statistics:")
for key, value in summary_stats.items():
    print(f"  {key}: {value}")
print(f"\nBusiness Insights computed: {len(business_insights)}")
