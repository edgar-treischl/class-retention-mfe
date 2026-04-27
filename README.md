# Class Retention MFE

A React + TypeScript + Vite micro-frontend (MFE) that visualizes class retention data (grade repetition) across different German school types over multiple years. Built with Module Federation to be consumed as a remote module by other applications.

## Overview

This application presents educational data showing how many students repeat grades across different school types in Germany:

- **Grundschulen** (Primary schools)
- **Mittelschulen** (Secondary schools)
- **Realschulen** (Intermediate schools)
- **Gymnasien** (Grammar schools)
- **Gesamtschulen** (Comprehensive schools)

The data spans from school year 2020/21 to 2024/25, revealing important trends about grade retention patterns.

## Features

### 📊 Two Interactive Views

1. **Retention Rates View**: Horizontal bar chart showing retention percentages by school type for a selected year
   - Filter by school year
   - Filter by specific school type or view all
   - Year-over-year comparison indicators
   - Summary statistics: total students, grade repetitions, and overall retention rate

2. **Trends Over Time View**: Line chart showing retention trends across all years
   - Compare trends between different school types
   - Visualize how retention numbers have changed over time
   - Interactive legend

## Development

```bash
# Install dependencies
yarn install

# Development server (runs on port 5174 with CORS enabled)
yarn dev

# Production build (outputs to ./dist)
yarn build

# Preview production build locally (port 5174)
yarn preview

# Lint all files
yarn lint
```

## Module Federation Configuration

This MFE exposes its main component for consumption by host applications:

- **Remote name:** `class-retention-mfe`
- **Exposed module:** `./App` → `./src/App.tsx`
- **Entry point:** `remoteEntry.js` (generated in dist during build)
- **Shared dependencies:** `react`, `react-dom`

### Integration Example

```javascript
// In your host application's module federation config
remotes: {
  'class-retention-mfe': 'http://localhost:5174/remoteEntry.js'
}

// In your React component
const RetentionApp = React.lazy(() => import('class-retention-mfe/App'))
```

## Data Story

The visualization tells an important story about the German education system:

1. **Realschulen show the highest retention rates** (~50% of all grade repetitions), despite being intermediate-level schools
2. **Gymnasien have the second-highest rates** (~30-35%), reflecting their rigorous academic standards
3. **Mittelschulen** show moderate retention rates (15-40%), with significant fluctuations during the COVID period
4. **Grundschulen** have very low retention rates (<1%), as grade repetition is rare in primary education
5. **The COVID-19 impact** is visible in the 2020/21 data, showing dramatic differences in retention patterns

### Key Insights

- **Recent trends (2024/25)**: Retention numbers have increased across most school types, returning to pre-pandemic levels
- **Year-over-year changes**: Some school types show positive changes (decreasing retention) while others show increases
- **Mittelschulen** experienced the most dramatic change after COVID-19, with retention rates jumping from ~39% to ~28% by 2021/22

## Deployment

The project deploys to **GitHub Pages** via `.github/workflows/deploy.yml`:
- Triggers on pushes to `main` branch
- Uses Yarn with frozen lockfile
- Builds and uploads to GitHub Pages
- Deployed URL includes `/class-retention-mfe/` base path

## Technology Stack

- **React 19** with TypeScript
- **Vite 8** for fast development and building
- **Module Federation** for micro-frontend architecture
- **ESLint** with flat config for code quality
- Pure SVG charts (no external charting library)
- Vanilla CSS with scoped class names

## Project Structure

```
src/
├── App.tsx              # Root component, view switching and state management
├── main.tsx             # Entry point
├── retention.ts         # Data layer: types, filtering, calculations
├── components/
│   ├── ExplorerView.tsx # Bar chart view for retention rates
│   └── DatasetView.tsx  # Line chart view for trends
└── data/
    └── retention.json   # Source data
```

## License

MIT
