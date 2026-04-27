import retentionData from './data/retention.json'

export const SCHOOL_TYPES = ['Grundschulen', 'Mittelschulen', 'Realschulen', 'Gymnasien', 'Gesamtschulen'] as const

export type SchoolType = (typeof SCHOOL_TYPES)[number]
export type SchoolTypeFilter = SchoolType | 'All school types'
export type SchoolYear = string // e.g., "2024/25"

export type RetentionDatum = {
  syear: SchoolYear
  stype: SchoolType
  group: string
  number: number
  year: string
  n_overall: number
  percent: number
}

type RawRetentionDatum = {
  syear: string
  stype: string
  group: string
  number: number
  year: string
  n_overall: number
  percent: number
}

export type SchoolTypeOption = {
  key: SchoolTypeFilter
  label: string
}

export type DatasetSummary = {
  totalYears: number
  totalRetentions: number
  schoolTypes: SchoolType[]
  yearRange: string
  latestYear: SchoolYear
}

// School type options for filtering
export const SCHOOL_TYPE_OPTIONS: SchoolTypeOption[] = [
  { key: 'All school types', label: 'All school types' },
  { key: 'Grundschulen', label: 'Grundschulen (Primary)' },
  { key: 'Mittelschulen', label: 'Mittelschulen (Secondary)' },
  { key: 'Realschulen', label: 'Realschulen (Intermediate)' },
  { key: 'Gymnasien', label: 'Gymnasien (Grammar)' },
  { key: 'Gesamtschulen', label: 'Gesamtschulen (Comprehensive)' },
]

// Color scheme for school types
export const SCHOOL_TYPE_COLORS: Record<SchoolType, string> = {
  Grundschulen: '#3b82f6',      // blue
  Mittelschulen: '#ef4444',     // red
  Realschulen: '#10b981',       // green
  Gymnasien: '#f59e0b',         // amber
  Gesamtschulen: '#8b5cf6',     // purple
}

// Chart configuration
export const CHART_WIDTH = 800
export const CHART_HEIGHT = 500
export const CHART_PADDING = {
  top: 40,
  right: 80,
  bottom: 80,
  left: 140,
}

// Transform and validate raw data
function isValidSchoolType(value: string): value is SchoolType {
  return SCHOOL_TYPES.includes(value as SchoolType)
}

export const RETENTION_DATA: RetentionDatum[] = (retentionData as RawRetentionDatum[])
  .filter((row) => row.group === 'Insgesamt' && isValidSchoolType(row.stype))
  .map((row) => ({
    syear: row.syear,
    stype: row.stype as SchoolType,
    group: row.group,
    number: row.number,
    year: row.year,
    n_overall: row.n_overall,
    percent: row.percent,
  }))

// Get unique school years sorted
export const SCHOOL_YEARS: SchoolYear[] = Array.from(
  new Set(RETENTION_DATA.map((d) => d.syear))
).sort((a, b) => {
  const yearA = parseInt(a.split('/')[0])
  const yearB = parseInt(b.split('/')[0])
  return yearB - yearA // Most recent first
})

// Filter retention data by school type
export function filterRetentionBySchoolType(filter: SchoolTypeFilter): RetentionDatum[] {
  if (filter === 'All school types') {
    return RETENTION_DATA
  }
  return RETENTION_DATA.filter((d) => d.stype === filter)
}

// Get data for a specific school year
export function getDataForYear(year: SchoolYear): RetentionDatum[] {
  return RETENTION_DATA.filter((d) => d.syear === year)
}

// Get time series data for trend chart (all years, grouped by school type)
export function getTimeSeriesData(): Map<SchoolType, RetentionDatum[]> {
  const grouped = new Map<SchoolType, RetentionDatum[]>()
  
  SCHOOL_TYPES.forEach((type) => {
    const data = RETENTION_DATA.filter((d) => d.stype === type).sort((a, b) => {
      const yearA = parseInt(a.year)
      const yearB = parseInt(b.year)
      return yearA - yearB // Chronological order
    })
    grouped.set(type, data)
  })
  
  return grouped
}

// Calculate dataset summary
export const DATASET_SUMMARY: DatasetSummary = {
  totalYears: SCHOOL_YEARS.length,
  totalRetentions: RETENTION_DATA.reduce((sum, d) => sum + d.number, 0),
  schoolTypes: [...SCHOOL_TYPES],
  yearRange: `${SCHOOL_YEARS[SCHOOL_YEARS.length - 1]} - ${SCHOOL_YEARS[0]}`,
  latestYear: SCHOOL_YEARS[0],
}

// Build statistics for bar chart view
export function buildBarChartStats(data: RetentionDatum[]) {
  if (data.length === 0) {
    return {
      totalStudents: 0,
      totalRetentions: 0,
      overallRate: 0,
      bySchoolType: [],
    }
  }

  const totalRetentions = data.reduce((sum, d) => sum + d.number, 0)
  const totalStudents = data[0]?.n_overall || 0
  const overallRate = totalStudents > 0 ? (totalRetentions / totalStudents) * 100 : 0

  const bySchoolType = SCHOOL_TYPES.map((type) => {
    const datum = data.find((d) => d.stype === type)
    return {
      type,
      count: datum?.number || 0,
      percent: datum?.percent || 0,
    }
  }).filter(item => item.count > 0)

  return {
    totalStudents,
    totalRetentions,
    overallRate: parseFloat(overallRate.toFixed(2)),
    bySchoolType,
  }
}

// Format percentage for display
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

// Format number with thousands separator
export function formatNumber(value: number): string {
  return value.toLocaleString('de-DE')
}

// Get year-over-year change for a school type
export function getYearOverYearChange(currentYear: SchoolYear, schoolType: SchoolType): number | null {
  const currentData = RETENTION_DATA.find((d) => d.syear === currentYear && d.stype === schoolType)
  
  const currentYearNum = parseInt(currentYear.split('/')[0])
  const previousYear = `${currentYearNum - 1}/${(currentYearNum % 100).toString().padStart(2, '0')}`
  const previousData = RETENTION_DATA.find((d) => d.syear === previousYear && d.stype === schoolType)
  
  if (!currentData || !previousData) {
    return null
  }
  
  return parseFloat((currentData.percent - previousData.percent).toFixed(2))
}
