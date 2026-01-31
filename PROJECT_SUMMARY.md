# Amazon Sales Dataset - Complete Group Project

## 📋 Project Overview

This repository contains a complete Data Science group project analyzing Amazon sales data, including all required deliverables for TEB 2043 Data Science course.

## 📁 Project Structure

```
DS/
├── Project_Proposal.md          # Project proposal (Week 5 submission)
├── Project_Report.md            # Comprehensive project report (Week 11 submission)
├── DEPLOYMENT_GUIDE.md          # Step-by-step Vercel deployment guide
├── PROJECT_SUMMARY.md           # This file - project overview
│
├── amazon_sales_data.csv        # Original dataset
├── amazon-sales-dataset-eda.ipynb  # EDA notebook
├── process_data.py              # Data processing script
│
├── dashboard_data/              # Processed data for dashboard
│   ├── summary_stats.json
│   ├── category_stats.json
│   ├── price_range_stats.json
│   ├── discount_stats.json
│   ├── top_rated_products.json
│   └── cleaned_data.csv
│
└── dashboard/                   # Next.js dashboard application
    ├── app/                     # Next.js app directory
    ├── components/              # React components
    ├── public/                  # Static assets
    │   └── dashboard_data/      # JSON data files
    ├── package.json
    ├── next.config.js
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── vercel.json              # Vercel deployment config
    └── README.md                # Dashboard README
```

## ✅ Deliverables Checklist

### 1. Project Proposal ✓
- **File:** `Project_Proposal.md`
- **Submission:** Week 5
- **Contents:**
  - Project Introduction
  - Objectives and Expected Outcomes
  - Data Description
  - Background/Problem Statement
  - Methodology Overview

### 2. Project Report ✓
- **File:** `Project_Report.md`
- **Submission:** Week 11
- **Contents:**
  - Cover Page
  - Executive Summary
  - Problem Description (Business & Technical Goals)
  - Data Description with Schema
  - Data Preparation Methods
  - Solution (EDA, Analysis, Modeling)
  - Conclusion
  - Limitations and Future Improvements
  - Appendix

### 3. Dashboard System ✓
- **Location:** `dashboard/` folder
- **Technology:** Next.js + React + TypeScript + Tailwind CSS + Recharts
- **Features:**
  - Interactive data visualizations
  - Category performance charts
  - Price range analysis
  - Discount impact visualization
  - Top-rated products table
  - Responsive design
- **Deployment:** Ready for Vercel (free hosting)

## 🚀 Quick Start

### Running the Dashboard Locally

1. **Navigate to dashboard folder:**
```bash
cd dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
Visit [http://localhost:3000](http://localhost:3000)

### Processing Data

To regenerate dashboard data:

```bash
python process_data.py
```

This will update all JSON files in `dashboard_data/` folder.

### Deploying to Vercel

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

**Quick Steps:**
1. Push code to GitHub
2. Import repository in Vercel
3. Deploy (automatic)

## 📊 Dataset Information

- **Source:** Kaggle
- **Records:** 1,465 products
- **Categories:** 211 unique categories
- **Attributes:** 16 columns
- **Key Metrics:**
  - Average Rating: 4.10/5.0
  - Average Price: ₹3,125
  - Average Discount: 47.69%
  - Total Reviews: 26.7M+

## 🔍 Key Insights

1. **High Customer Satisfaction:** Average rating of 4.10 indicates strong customer satisfaction
2. **Aggressive Discounting:** 47.69% average discount shows competitive marketplace
3. **Category Variation:** Significant performance differences across 211 categories
4. **Price-Rating Correlation:** Optimal price range identified (₹1,000-₹2,000)
5. **Review Impact:** High review volumes correlate with product success

## 🛠️ Technologies Used

### Data Processing
- Python 3
- Pandas
- NumPy
- Regular Expressions

### Dashboard
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts (visualization)
- Lucide React (icons)

### Deployment
- Vercel (hosting)
- GitHub (version control)

## 📝 Report Sections

The project report covers:

1. **Executive Summary** - High-level overview and key findings
2. **Problem Description** - Business and technical objectives
3. **Data Description** - Dataset schema, statistics, and characteristics
4. **Data Preparation** - Cleaning, preprocessing, and feature engineering
5. **Solution** - EDA, statistical analysis, modeling, and insights
6. **Conclusion** - Summary and practical applications
7. **Limitations** - Current constraints and future improvements

## 🎯 Assessment Alignment

### Report Assessment (80% of project marks)
- ✅ Cover Page (5%)
- ✅ Executive Summary (10%)
- ✅ Problem Description (15%)
- ✅ Data Description (15%)
- ✅ Data Preparation (15%)
- ✅ Solution (20%)
- ✅ Conclusion (10%)
- ✅ Appendix (10%)

### Presentation Assessment (20% of project marks)
- Prepare presentation slides based on report
- Practice verbal delivery
- Prepare for Q&A session

## 📚 Additional Resources

- **Kaggle Dataset:** [Amazon Sales Dataset](https://www.kaggle.com/datasets/karkavelrajaj/amazon-sales-dataset)
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Recharts Docs:** https://recharts.org/

## 👥 Team Members

[Update with your team member names and student IDs]

## 📅 Timeline

- **Week 5:** Project Proposal Submission ✓
- **Week 6-10:** Data preparation, analysis, documentation
- **Week 11:** Report Submission ✓
- **Week 12:** Presentation

## 🎓 Course Information

- **Course:** TEB 2043 Data Science
- **Semester:** Jan 2026
- **Institution:** [Your University]

## 📧 Support

For questions or issues:
1. Check `DEPLOYMENT_GUIDE.md` for deployment help
2. Review dashboard `README.md` for technical details
3. Check browser console for errors
4. Verify all data files are in correct locations

---

**Project Status:** ✅ Complete - All deliverables ready for submission

**Last Updated:** [Current Date]
