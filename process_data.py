"""
Data Processing Script for Amazon Sales Dataset Analysis
Generates processed data and insights for the dashboard and report
"""

import pandas as pd
import numpy as np
import json
import re
from collections import Counter

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

print("\nData processing complete!")
print(f"\nSummary Statistics:")
for key, value in summary_stats.items():
    print(f"  {key}: {value}")
