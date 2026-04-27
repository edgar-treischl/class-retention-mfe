import { useState } from 'react'
import { DatasetView } from './components/DatasetView.tsx'
import { ExplorerView } from './components/ExplorerView.tsx'
import { InfoView } from './components/InfoView.tsx'
import {
  DATASET_SUMMARY,
  SCHOOL_YEARS,
  formatNumber,
  type SchoolYear,
} from './retention.ts'
import './App.css'

const VIEW_OPTIONS = [
  { key: 'retention', label: 'Retention Rates' },
  { key: 'trends', label: 'Trends Over Time' },
  { key: 'data', label: 'Data Info' },
] as const

type ViewKey = (typeof VIEW_OPTIONS)[number]['key']

export default function App() {
  const [view, setView] = useState<ViewKey>('retention')
  const [selectedYear, setSelectedYear] = useState<SchoolYear>(SCHOOL_YEARS[0])

  const title = view === 'retention' 
    ? 'Retention Rates' 
    : view === 'trends'
    ? 'Trends Over Time'
    : 'Data Information'
    
  const summaryValue = view === 'retention' 
    ? selectedYear
    : view === 'trends'
    ? formatNumber(DATASET_SUMMARY.totalRetentions)
    : DATASET_SUMMARY.totalYears.toString()
    
  const summaryLabel = view === 'retention' 
    ? 'school year' 
    : view === 'trends'
    ? 'total retentions'
    : 'years of data'

  return (
    <main className="penguins-app">
      <section className="panel">
        <header className="panel-header">
          <div>
            <p className="eyebrow">German School System</p>
            <h1>{title}</h1>
          </div>
          <div className="summary-chip">
            <strong>{summaryValue}</strong>
            <span>{summaryLabel}</span>
          </div>
        </header>

        <nav className="view-switch" aria-label="View selector">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={option.key === view ? 'view-tab is-active' : 'view-tab'}
              onClick={() => setView(option.key)}
            >
              {option.label}
            </button>
          ))}
        </nav>

        {view === 'retention' ? (
          <ExplorerView
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        ) : view === 'trends' ? (
          <DatasetView datasetSummary={DATASET_SUMMARY} />
        ) : (
          <InfoView />
        )}
      </section>
    </main>
  )
}
