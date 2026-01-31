# Amazon Sales Dashboard

Interactive dashboard for Amazon Sales Dataset Analysis - Data Science Project

## Features

- 📊 Real-time data visualization
- 📈 Category performance analysis
- 💰 Price range insights
- 🎯 Discount impact analysis
- ⭐ Top-rated products table
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and deploy

### Option 3: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings (auto-detected for Next.js)
5. Click "Deploy"

## Project Structure

```
dashboard/
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── StatCard.tsx      # Statistics card component
│   ├── CategoryChart.tsx # Category performance chart
│   ├── PriceRangeChart.tsx # Price range analysis
│   ├── DiscountChart.tsx   # Discount impact chart
│   └── TopProductsTable.tsx # Top products table
├── public/
│   └── dashboard_data/   # JSON data files
└── package.json
```

## Data Files

The dashboard uses pre-processed JSON files located in `public/dashboard_data/`:
- `summary_stats.json` - Overall statistics
- `category_stats.json` - Category performance data
- `price_range_stats.json` - Price range analysis
- `discount_stats.json` - Discount impact data
- `top_rated_products.json` - Top products list

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

## License

This project is part of TEB 2043 Data Science course project.
