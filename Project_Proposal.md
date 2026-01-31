# Project Proposal: Amazon Sales Dataset Analysis

**Course:** TEB 2043 Data Science  
**Semester:** Jan 2026  
**Project Title:** Comprehensive Analysis of Amazon Sales Data: Insights for E-commerce Decision Making

---

## 1. Project Introduction

### 1.1 Brief Overview of the Project

This project aims to conduct a comprehensive exploratory data analysis (EDA) and predictive analytics on Amazon sales dataset to extract meaningful insights that can support strategic decision-making in e-commerce operations. The analysis will focus on understanding customer behavior, product performance, pricing strategies, and review sentiment to provide actionable recommendations for improving sales and customer satisfaction.

### 1.2 Objectives and Expected Outcomes

**Primary Objectives:**
- To analyze product performance across different categories
- To understand pricing strategies and discount effectiveness
- To evaluate customer satisfaction through ratings and reviews
- To identify key factors influencing product success
- To develop predictive models for product ratings and sales potential

**Expected Outcomes:**
- Comprehensive insights into product category performance
- Understanding of optimal pricing and discount strategies
- Customer sentiment analysis from reviews
- Interactive dashboard for data visualization (hosted on Vercel)
- Actionable recommendations for e-commerce optimization

### 1.3 Dashboard System (Deliverable)

The project includes an interactive web dashboard built with Next.js, React, and Recharts, deployable on Vercel at no cost. The dashboard will include:

- **Summary metrics:** Total products, categories, average rating, average price, average discount, total reviews
- **Charts:** Category performance (dual-axis), Price range analysis (dual-axis), Discount impact analysis (dual-axis)
- **Top Rated Products:** Table of top 5 products by rating
- **Product Keywords:** Bar chart of most frequent keywords from product names
- **Price vs Discount Distribution:** Bar chart of product counts by price range (discounted vs actual)
- **Price–Rating Correlation:** Scatter plot with correlation value (rating axis 3–5 for clarity)
- **Business Insights:** Statistical hypothesis tests answering 7 key business questions:
  1. Discounts vs Ratings (Do discounts hurt quality perception?) — Two-sample t-test
  2. Discounts vs Popularity (Do discounts drive engagement?) — One-sided t-test
  3. Category Quality Comparison (Which categories are strong/weak?) — t-test
  4. Price Tier vs Rating (Do expensive items get better ratings?) — One-way ANOVA
  5. Discount Level Differences by Category — ANOVA
  6. Correlation: discount vs rating — Pearson correlation test
  7. Top Products vs Others (Quality of best-sellers) — One-sided t-test
- **Data Insights:** Clickable cards linking to EDA questions with tables/charts (rating by category, top products by reviews, discount by category, popular products, review sentiment, top 5 categories)

---

## 2. Data Description

### 2.1 Source of the Dataset

The dataset is obtained from Kaggle, a popular open data source platform. The Amazon Sales Dataset contains real-world e-commerce data from Amazon's product listings.

**Dataset Link:** [Kaggle - Amazon Sales Dataset](https://www.kaggle.com/datasets/karkavelrajaj/amazon-sales-dataset)

### 2.2 Type of Data

The dataset is **structured data** containing both numerical and categorical variables. It includes:
- Product information (names, categories, prices)
- Customer review data (textual reviews, ratings)
- User information (user IDs, names)
- Product metadata (images, links)

### 2.3 Number of Records and Attributes

- **Total Records:** 1,465 products
- **Total Attributes:** 16 columns

### 2.4 Description of Key Variables

| Variable | Type | Description |
|----------|------|-------------|
| `product_id` | Categorical | Unique identifier for each product |
| `product_name` | Text | Name of the product |
| `category` | Categorical | Product category classification |
| `discounted_price` | Numerical | Price after discount (in ₹) |
| `actual_price` | Numerical | Original price before discount (in ₹) |
| `discount_percentage` | Numerical | Percentage discount applied |
| `rating` | Numerical | Average customer rating (scale: 1-5) |
| `rating_count` | Numerical | Number of customer ratings received |
| `about_product` | Text | Product description |
| `user_id` | Categorical | Unique identifier for reviewers |
| `user_name` | Text | Name of the reviewer |
| `review_id` | Categorical | Unique identifier for each review |
| `review_title` | Text | Title of the review |
| `review_content` | Text | Full text content of the review |
| `img_link` | URL | Link to product image |
| `product_link` | URL | Link to product page |

---

## 3. Background / Problem Statement

### 3.1 Motivation for Choosing the Dataset

E-commerce has become a dominant force in retail, with Amazon being one of the largest platforms globally. Understanding customer behavior, product performance, and pricing strategies is crucial for:
- **Businesses:** To optimize product listings, pricing, and marketing strategies
- **Consumers:** To make informed purchasing decisions
- **Platforms:** To improve recommendation systems and user experience

This dataset provides a rich source of information combining product attributes, pricing data, and customer feedback, making it ideal for comprehensive data science analysis.

### 3.2 Problem(s) to be Solved or Questions to be Answered

**Key Research Questions:**

1. **Product Performance Analysis:**
   - Which product categories have the highest ratings?
   - What is the relationship between price and customer satisfaction?
   - How do discounts affect product ratings and sales?

2. **Pricing Strategy:**
   - What is the optimal discount percentage for maximizing customer satisfaction?
   - Is there a correlation between price range and rating?
   - Which categories offer the best value for money?

3. **Customer Behavior:**
   - What are the common themes in positive vs. negative reviews?
   - How does review sentiment correlate with product ratings?
   - What factors influence customer satisfaction most?

4. **Predictive Insights:**
   - Can we predict product ratings based on price and discount?
   - What features are most important for product success?

### 3.3 Importance of the Analysis

**Business Impact:**
- **Revenue Optimization:** Understanding pricing strategies can help maximize revenue
- **Inventory Management:** Category analysis can inform inventory decisions
- **Marketing Strategy:** Review sentiment analysis can guide marketing campaigns
- **Product Development:** Insights can inform product improvement priorities

**Academic Value:**
- Application of data science techniques to real-world problems
- Integration of multiple analysis methods (EDA, NLP, predictive modeling)
- Development of practical skills in data visualization and dashboard creation

**Practical Applications:**
- E-commerce platform optimization
- Product recommendation systems
- Dynamic pricing strategies
- Customer satisfaction improvement initiatives

---

## 4. Methodology Overview

The project will follow the standard data science workflow:

1. **Data Understanding:** Exploratory data analysis to understand data structure and quality
2. **Data Preparation:** Cleaning, preprocessing, and feature engineering (Python; output: JSON/CSV for dashboard)
3. **Data Analysis:** Statistical analysis, correlation studies, and pattern identification (including per-question datasets for EDA Q1–Q9)
4. **Statistical Hypothesis Testing:** Conduct 7 business-focused hypothesis tests (t-tests, ANOVA, correlation tests) to answer key business questions with statistical rigor
5. **Modeling:** Predictive models for ratings and sales potential (as applicable)
6. **Visualization:** Interactive Next.js dashboard with Recharts (tables and graphs per insight where applicable, plus Business Insights section)
7. **Reporting:** Comprehensive documentation of findings and recommendations; proposal, report, and dashboard as deliverables

---

## 5. Timeline

- **Week 5:** Project Proposal Submission ✓
- **Week 6-7:** Data cleaning and preprocessing
- **Week 8-9:** Exploratory data analysis and feature engineering
- **Week 10:** Model development and validation
- **Week 11:** Report writing and dashboard development
- **Week 12:** Final submission and presentation

---

## 6. Team Members

[To be filled with team member names and student IDs]

---

**Prepared by:** [Team Name]  
**Date:** [Submission Date]
