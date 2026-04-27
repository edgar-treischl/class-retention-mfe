import {
  buildBarChartStats,
  CHART_HEIGHT,
  CHART_PADDING,
  CHART_WIDTH,
  formatPercent,
  SCHOOL_TYPE_COLORS,
  SCHOOL_YEARS,
  getDataForYear,
  getYearOverYearChange,
  type SchoolYear,
} from '../retention.ts'

type ExplorerViewProps = {
  selectedYear: SchoolYear
  onYearChange: (value: SchoolYear) => void
}

export function ExplorerView({
  selectedYear,
  onYearChange,
}: ExplorerViewProps) {
  const yearData = getDataForYear(selectedYear)
  const filteredData = yearData
  
  const stats = buildBarChartStats(filteredData)
  
  const chartInnerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right

  // Calculate bar positions (horizontal bar chart)
  const maxPercent = Math.max(...stats.bySchoolType.map(d => d.percent), 50)
  const xScale = (value: number) => (value / maxPercent) * chartInnerWidth
  const barHeight = 50
  const barSpacing = 20

  // Get year-over-year changes for key school types
  const grundschuleChange = getYearOverYearChange(selectedYear, 'Grundschulen')
  const realschuleChange = getYearOverYearChange(selectedYear, 'Realschulen')
  const gymnasienChange = getYearOverYearChange(selectedYear, 'Gymnasien')

  return (
    <>
      <section className="stats-row" aria-label="Year-over-year changes">
        <section className="stat-card">
          <span className="stat-label">Grundschulen vs prev. year</span>
          <strong className={grundschuleChange === null ? '' : grundschuleChange > 0 ? 'stat-increase' : grundschuleChange < 0 ? 'stat-decrease' : ''}>
            {grundschuleChange === null ? 'N/A' : `${grundschuleChange > 0 ? '+' : ''}${grundschuleChange}%`}
          </strong>
        </section>
        <section className="stat-card">
          <span className="stat-label">Realschulen vs prev. year</span>
          <strong className={realschuleChange === null ? '' : realschuleChange > 0 ? 'stat-increase' : realschuleChange < 0 ? 'stat-decrease' : ''}>
            {realschuleChange === null ? 'N/A' : `${realschuleChange > 0 ? '+' : ''}${realschuleChange}%`}
          </strong>
        </section>
        <section className="stat-card">
          <span className="stat-label">Gymnasien vs prev. year</span>
          <strong className={gymnasienChange === null ? '' : gymnasienChange > 0 ? 'stat-increase' : gymnasienChange < 0 ? 'stat-decrease' : ''}>
            {gymnasienChange === null ? 'N/A' : `${gymnasienChange > 0 ? '+' : ''}${gymnasienChange}%`}
          </strong>
        </section>
      </section>

      <section className="split-layout">
        <div className="split-text">
          <div className="story-card">
            <h3>📊 Understanding Grade Retention</h3>
            <p className="story-text">
              This visualization shows how many students repeat grades across different school types in the German education system. 
              The data reveals striking patterns: <strong>Realschulen account for about half of all grade repetitions</strong>, 
              despite being "middle-tier" schools. This reflects the challenge many students face in this intermediate track.
            </p>
            <p className="story-text">
              <strong>Why does this matter?</strong> Grade retention has long-term impacts on student outcomes, self-esteem, 
              and educational trajectories. The high retention rates in Realschulen and Gymnasien suggest that academic 
              standards in these schools may create significant barriers for struggling students.
            </p>
          </div>
          
          <div className="story-card">
            <p className="story-text">
              <strong>💡 Key Insight:</strong> Realschulen show the highest retention rate, 
              reflecting the academic pressure in this intermediate track. The year-over-year changes 
              (shown below each bar) reveal whether retention is increasing or decreasing compared to the previous year.
            </p>
          </div>
        </div>

        <div className="split-chart">
          <div className="chart-card">
            <div className="card-heading">
              <div>
                <h2>Grade Retention by School Type</h2>
                <p>
                  Percentage of students repeating a grade in <strong>{selectedYear}</strong>
                </p>
              </div>
            </div>

            <div className="chart-frame">
              <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="chart"
                role="img"
                aria-label={`Bar chart showing retention rates for ${selectedYear}`}
              >
                {/* Grid lines */}
                {[0, 10, 20, 30, 40, 50].map((tick) => {
                  const x = CHART_PADDING.left + xScale(tick)
                  return (
                    <g key={`grid-${tick}`}>
                      <line
                        x1={x}
                        x2={x}
                        y1={CHART_PADDING.top}
                        y2={CHART_HEIGHT - CHART_PADDING.bottom}
                        className="grid-line"
                      />
                      <text
                        x={x}
                        y={CHART_HEIGHT - CHART_PADDING.bottom + 24}
                        textAnchor="middle"
                        className="axis-label"
                      >
                        {tick}%
                      </text>
                    </g>
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
                  Retention Rate (%)
                </text>

                {/* Bars */}
                {stats.bySchoolType.map((item, index) => {
                  const y = CHART_PADDING.top + index * (barHeight + barSpacing)
                  const width = xScale(item.percent)

                  return (
                    <g key={item.type}>
                      <rect
                        x={CHART_PADDING.left}
                        y={y}
                        width={width}
                        height={barHeight}
                        fill={SCHOOL_TYPE_COLORS[item.type]}
                        opacity={0.8}
                      />
                      <text
                        x={CHART_PADDING.left - 10}
                        y={y + barHeight / 2 + 5}
                        textAnchor="end"
                        className="axis-label"
                        style={{ fontSize: '13px' }}
                      >
                        {item.type}
                      </text>
                      <text
                        x={CHART_PADDING.left + width + 10}
                        y={y + barHeight / 2 + 5}
                        className="bar-label"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        {formatPercent(item.percent)}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            <div className="controls-section">
              <div className="control-group">
                <label htmlFor="year-select" className="control-label">
                  School year
                </label>
                <select
                  id="year-select"
                  className="control-select"
                  value={selectedYear}
                  onChange={(e) => onYearChange(e.target.value)}
                >
                  {SCHOOL_YEARS.map((year) => (
                    <option key={year} value={year}>
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
