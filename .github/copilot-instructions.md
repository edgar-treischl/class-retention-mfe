# Copilot Instructions for class-retention-mfe

## Project Overview

This is a **Module Federation micro-frontend (MFE)** built with React + TypeScript + Vite. It visualizes class retention data (students repeating grades) across different German school types over multiple years (2020-2024). The app is designed to be consumed as a remote module by other applications using Webpack Module Federation.

## Build, Test, and Lint Commands

```bash
# Development server (runs on port 5174 with CORS enabled)
yarn dev

# Production build (outputs to ./dist)
yarn build

# Lint all files
yarn lint

# Preview production build locally (port 5174)
yarn preview
```

**Note:** There are no tests configured in this project.

## Module Federation Configuration

This MFE exposes its main component for consumption by host applications:

- **Remote name:** `class-retention-mfe`
- **Exposed module:** `./App` → `./src/App.tsx`
- **Entry point:** `remoteEntry.js` (generated in dist during build)
- **Shared dependencies:** `react`, `react-dom`

### Important Configuration Details

- **Base path is set to `/class-retention-mfe/`** in `vite.config.ts` for GitHub Pages deployment
- If deploying elsewhere or consuming from a different URL, update the `base` config accordingly
- The dev and preview servers run on **port 5174** with `host: true` and `cors: true` to enable cross-origin module loading

## Architecture

### Component Structure

```
src/
├── App.tsx              # Root component, manages view state and year/school type selection
├── main.tsx             # Entry point, adds body/root classes for styling
├── retention.ts         # Data layer: types, filtering, calculations, constants
├── components/
│   ├── ExplorerView.tsx # Horizontal bar chart showing retention rates by school type
│   └── DatasetView.tsx  # Line chart showing retention trends over time
└── data/
    └── retention.json   # Source data (German school retention statistics)
```

### Data Flow

1. **retention.ts** is the single source of truth for:
   - All TypeScript types (`RetentionDatum`, `SchoolType`, `SchoolYear`, etc.)
   - Data transformation (raw JSON → validated `RetentionDatum[]`)
   - Filtering logic (`filterRetentionBySchoolType()`, `getDataForYear()`)
   - Statistical calculations (`buildBarChartStats()`, `getYearOverYearChange()`)
   - Chart configuration constants (`CHART_WIDTH`, `CHART_PADDING`, `SCHOOL_TYPE_COLORS`)

2. **App.tsx** orchestrates:
   - View switching (Retention Rates vs Trends Over Time)
   - School year selection
   - School type filtering
   - All state is lifted to App and passed down as props

3. **Components are controlled and stateless:**
   - `ExplorerView` and `DatasetView` receive all data via props
   - No local state for data manipulation
   - Chart rendering is done with pure SVG (no external charting library)

### Styling Approach

- Uses vanilla CSS with scoped class names
- Body gets `.penguins-app-body` class in `main.tsx` (legacy class name retained for consistency)
- Component styles in `App.css`, global styles in `index.css`
- CSS classes follow BEM-like naming (e.g., `.panel-header`, `.view-tab.is-active`)

## Key Conventions

### Type Safety

- All retention data types, school types, and school years are defined in `retention.ts`
- Use the exported types: `RetentionDatum`, `SchoolType`, `SchoolTypeFilter`, `SchoolYear`
- Avoid inline type definitions; import from `retention.ts` for consistency

### Data Filtering Pattern

- All data access happens through functions in `retention.ts`:
  - `getDataForYear(year)` - Get all school types for a specific year
  - `filterRetentionBySchoolType(filter)` - Filter by school type
  - `getTimeSeriesData()` - Get time series grouped by school type
- These functions return new arrays; original data is immutable
- Use these functions rather than filtering `RETENTION_DATA` directly

### Chart/Visualization Constants

- Chart dimensions, padding, and colors are exported from `retention.ts`
- Keep all visualization-related constants centralized in `retention.ts` (not in component files)
- Color scheme for school types is defined in `SCHOOL_TYPE_COLORS`:
  - Grundschulen: blue (#3b82f6)
  - Mittelschulen: red (#ef4444)
  - Realschulen: green (#10b981)
  - Gymnasien: amber (#f59e0b)
  - Gesamtschulen: purple (#8b5cf6)

### Data Story and Context

The data represents grade retention (students repeating a grade) in German schools:

- **School types** (from primary to advanced): Grundschulen, Mittelschulen, Realschulen, Gymnasien, Gesamtschulen
- **Key insight**: Realschulen show the highest retention rates (~50%), followed by Gymnasien (~30-35%)
- **COVID impact**: Data from 2020/21 shows unusual patterns due to pandemic policies
- **Year-over-year changes**: Use `getYearOverYearChange()` to calculate percentage point differences

### Module Federation Integration

When integrating this MFE into a host application:

1. Host needs to load `remoteEntry.js` from the deployed URL
2. Import the component: `const App = React.lazy(() => import('class-retention-mfe/App'))`
3. Ensure React versions match between host and remote (currently using React 19.2.5)
4. Host must provide a container div for the MFE to mount into

### ESLint Configuration

- Uses flat config format (`eslint.config.js`)
- Configured for TypeScript + React with hooks and react-refresh support
- The `dist/` folder is ignored globally
- Lint errors should be fixed before committing

## Chart Implementation

Both views use **pure SVG** with manual scale calculations:

- **ExplorerView**: Horizontal bar chart with bars positioned using `xScale()` and `yScale()` functions
- **DatasetView**: Line chart with SVG `<path>` elements and `<circle>` markers
- Grid lines, axes, and labels are all SVG primitives
- No external charting libraries (D3, Chart.js, etc.) are used

When modifying charts:
- Update scale functions to ensure data fits within `CHART_PADDING` bounds
- Maintain axis labels and grid lines for readability
- Test with different year selections to ensure layout remains consistent

## Deployment

The project deploys to **GitHub Pages** via `.github/workflows/deploy.yml`:
- Triggers on pushes to `main` branch
- Uses Yarn with frozen lockfile
- Builds and uploads to GitHub Pages
- Deployed URL includes `/class-retention-mfe/` base path
