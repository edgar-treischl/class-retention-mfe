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
  { key: 'trends', label: 'Time Trends' },
  { key: 'data', label: 'Data Info' },
] as const

type ViewKey = (typeof VIEW_OPTIONS)[number]['key']

export default function App() {
  const [view, setView] = useState<ViewKey>('retention')
  const [selectedYear, setSelectedYear] = useState<SchoolYear>(SCHOOL_YEARS[0])

  const title = view === 'retention' 
    ? 'Retention Rates' 
    : view === 'trends'
    ? 'Time Trends'
    : 'Data Information'
    
  const summaryValue = view === 'retention' 
    ? selectedYear
    : view === 'trends'
    ? formatNumber(DATASET_SUMMARY.totalRetentions)
    : DATASET_SUMMARY.totalYears.toString()

  return (
    <main className="class-retention-mfe">
      <section className="class-retention-mfe__panel">
        <header className="class-retention-mfe__panel-header">
          <div>
            <p className="class-retention-mfe__eyebrow">Demo: Bayerns Schule in Zahlen</p>
            <h1>{title}</h1>
          </div>
          <div className="class-retention-mfe__summary-chip">
            <strong>School Year:</strong>
            <span>{summaryValue}</span>
          </div>
        </header>

        <nav className="class-retention-mfe__view-switch" aria-label="View selector">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={option.key === view ? 'class-retention-mfe__view-tab class-retention-mfe__view-tab--active' : 'class-retention-mfe__view-tab'}
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
