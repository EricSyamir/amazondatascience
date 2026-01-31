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

# Top products by rating
top_rated = df.nlargest(20, 'rating_clean')[['product_name', 'category', 'rating_clean', 'rating_count_clean', 'discounted_price_clean']]

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
