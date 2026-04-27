import { useState } from 'react'
import {
  CHART_HEIGHT,
  CHART_PADDING,
  CHART_WIDTH,
  SCHOOL_TYPE_COLORS,
  SCHOOL_TYPES,
  getTimeSeriesData,
  formatNumber,
  SCHOOL_YEARS,
  type DatasetSummary,
  type SchoolType,
  type RetentionDatum,
} from '../retention.ts'

type DatasetViewProps = {
  datasetSummary: DatasetSummary
}

export function DatasetView({ datasetSummary }: DatasetViewProps) {
  const allYearsAvailable = SCHOOL_YEARS.map(sy => parseInt(sy.split('/')[0])).sort((a, b) => a - b)
  const [minYear, setMinYear] = useState(allYearsAvailable[0])
  const [maxYear, setMaxYear] = useState(allYearsAvailable[allYearsAvailable.length - 1])
  
  const timeSeriesData = getTimeSeriesData()
  
  // Filter data by year range
  const filteredTimeSeriesData = new Map<SchoolType, RetentionDatum[]>()
  timeSeriesData.forEach((data, schoolType) => {
    const filtered = data.filter(d => {
      const year = parseInt(d.year)
      return year >= minYear && year <= maxYear
    })
    if (filtered.length > 0) {
      filteredTimeSeriesData.set(schoolType, filtered)
    }
  })
  
  const chartInnerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

  // Get all data points for scaling
  const allNumbers: number[] = []
  filteredTimeSeriesData.forEach((data) => {
    data.forEach((d: RetentionDatum) => allNumbers.push(d.number))
  })

  const minNumber = Math.min(...allNumbers)
  const maxNumber = Math.max(...allNumbers)

  // Get filtered years
  const allYears: string[] = Array.from(filteredTimeSeriesData.values())[0]?.map((d: RetentionDatum) => d.year) || []
  const minYearNum = Math.min(...allYears.map((y: string) => parseInt(y)))
  const maxYearNum = Math.max(...allYears.map((y: string) => parseInt(y)))

  const xScale = (year: string) => {
    const yearNum = parseInt(year)
    const domain = maxYearNum - minYearNum || 1
    return CHART_PADDING.left + ((yearNum - minYearNum) / domain) * chartInnerWidth
  }

  const yScale = (value: number) => {
    const domain = maxNumber - minNumber || 1
    return CHART_HEIGHT - CHART_PADDING.bottom - ((value - minNumber) / domain) * chartInnerHeight
  }

  // Build tick values for Y axis
  const yTicks = [0, 2000, 4000, 6000, 8000]
  
  return (
    <>
      <section className="dataset-info">
        <div className="info-grid">
          <div className="info-card">
            <span className="info-label">Years tracked: </span>
            <strong className="info-value">{datasetSummary.totalYears}</strong>
          </div>
          <div className="info-card">
            <span className="info-label">Total retentions: </span>
            <strong className="info-value">{formatNumber(datasetSummary.totalRetentions)}</strong>
          </div>
          <div className="info-card">
            <span className="info-label">Year range: </span>
            <strong className="info-value">{datasetSummary.yearRange}</strong>
          </div>
          <div className="info-card">
            <span className="info-label">Latest year: </span>
            <strong className="info-value">{datasetSummary.latestYear}</strong>
          </div>
        </div>
      </section>

      <section className="split-layout">
        <div className="split-text">
          <div className="story-card">
            <h3>📈 The COVID-19 Impact on Grade Retention</h3>
            <p className="story-text">
              Did the COVID-19 pandemic fundamentally disrupted grade retention patterns?
              Notice the <strong>sharp drop in 2020/21</strong> when schools implemented emergency policies allowing most 
              students to advance regardless of performance. By 2021/22, retention numbers began climbing back toward 
              pre-pandemic levels.
            </p>
            <p className="story-text">
              <strong>Mittelschulen experienced the most dramatic swings</strong>, jumping from ~870 retentions in 2020 
              to over 2,600 by 2024. This volatility reflects both policy changes and the educational disruption faced 
              by students in vocational tracks during remote learning.
            </p>
          </div>
          
          <div className="story-card">
            <p className="story-text">
              <strong>💡 Reading this chart:</strong> Each line represents a school type. The dip in 2020-2021 
              shows pandemic policy effects, while the recovery shows a return to traditional retention patterns. 
              Use the year range controls below to focus on specific time periods.
            </p>
          </div>
        </div>

        <div className="split-chart">
          <div className="chart-card">
            <div className="card-heading">
              <div>
                <h2>Retention Trends Over Time</h2>
                <p>Number of students repeating a grade by school type ({minYear}-{maxYear})</p>
              </div>
            </div>

            <div className="chart-frame">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="chart"
            role="img"
            aria-label="Line chart showing retention trends over time by school type"
          >
            {/* Y-axis grid lines and labels */}
            {yTicks.map((tick) => {
              const y = yScale(tick)
              return (
                <g key={`y-${tick}`}>
                  <line
                    x1={CHART_PADDING.left}
                    x2={CHART_WIDTH - CHART_PADDING.right}
                    y1={y}
                    y2={y}
                    className="grid-line"
                  />
                  <text x={CHART_PADDING.left - 10} y={y + 4} className="axis-label axis-label-y">
                    {formatNumber(tick)}
                  </text>
                </g>
              )
            })}

            {/* X-axis labels */}
            {allYears.map((year: string) => {
              const x = xScale(year)
              return (
                <text
                  key={`x-${year}`}
                  x={x}
                  y={CHART_HEIGHT - CHART_PADDING.bottom + 24}
                  textAnchor="middle"
                  className="axis-label"
                >
                  {year}
                </text>
              )
            })}

            {/* Axes */}
            <line
              x1={CHART_PADDING.left}
              x2={CHART_WIDTH - CHART_PADDING.right}
              y1={CHART_HEIGHT - CHART_PADDING.bottom}
              y2={CHART_HEIGHT - CHART_PADDING.bottom}
              className="axis-line"
            />
            <line
              x1={CHART_PADDING.left}
              x2={CHART_PADDING.left}
              y1={CHART_PADDING.top}
              y2={CHART_HEIGHT - CHART_PADDING.bottom}
              className="axis-line"
            />

            {/* Axis labels */}
            <text
              x={CHART_WIDTH / 2}
              y={CHART_HEIGHT - 10}
              textAnchor="middle"
              className="axis-title"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              School Year
            </text>
            <text
              x={-CHART_HEIGHT / 2}
              y={20}
              textAnchor="middle"
              className="axis-title"
              transform={`rotate(-90, 20, ${CHART_HEIGHT / 2})`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Number of Retentions
            </text>

            {/* Lines and points for each school type */}
            {SCHOOL_TYPES.map((schoolType) => {
              const data = filteredTimeSeriesData.get(schoolType) || []
              if (data.length === 0) return null

              // Create path for line
              const pathData = data
                .map((d: RetentionDatum, i: number) => {
                  const x = xScale(d.year)
                  const y = yScale(d.number)
                  return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
                })
                .join(' ')

              return (
                <g key={schoolType}>
                  <path
                    d={pathData}
                    stroke={SCHOOL_TYPE_COLORS[schoolType]}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {data.map((d: RetentionDatum) => (
                    <circle
                      key={`${schoolType}-${d.year}`}
                      cx={xScale(d.year)}
                      cy={yScale(d.number)}
                      r={5}
                      fill={SCHOOL_TYPE_COLORS[schoolType]}
                    />
                  ))}
                </g>
              )
            })}
          </svg>
            </div>

            {/* Legend */}
            <div className="chart-legend">
              {SCHOOL_TYPES.map((schoolType) => (
                <div key={schoolType} className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: SCHOOL_TYPE_COLORS[schoolType] }}
                  />
                  <span className="legend-label">{schoolType}</span>
                </div>
              ))}
            </div>

            {/* Year range controls */}
            <div className="controls-section">
              <div className="control-group">
                <label htmlFor="min-year-select" className="control-label">
                  From year
                </label>
                <select
                  id="min-year-select"
                  className="control-select"
                  value={minYear}
                  onChange={(e) => setMinYear(parseInt(e.target.value))}
                >
                  {allYearsAvailable.map((year) => (
                    <option key={year} value={year} disabled={year > maxYear}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label htmlFor="max-year-select" className="control-label">
                  To year
                </label>
                <select
                  id="max-year-select"
                  className="control-select"
                  value={maxYear}
                  onChange={(e) => setMaxYear(parseInt(e.target.value))}
                >
                  {allYearsAvailable.map((year) => (
                    <option key={year} value={year} disabled={year < minYear}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
