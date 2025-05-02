export interface StatisticsRepository {
  generateDisagreementReport(
    projectId: number,
    filters: {
      dataset?: number
      discussion?: number
      perspective?: number
      member?: number
    }
  ): Promise<any>

  generatePerspectiveReport(
    projectId: number,
    filters: {
      dataset?: number
      discussion?: number
      perspective?: number
      member?: number
    }
  ): Promise<any>

  generateAnnotatorReport(
    projectId: number,
    filters: {
      dataset?: number
      discussion?: number
      perspective?: number
      member?: number
    }
  ): Promise<{
    items: Array<{
      annotator: string
      total: number
      categories: string
      datasets: Array<{
        document: number
        categories: Array<{
          name: string
          count: number
          percentage: string
        }>
      }>
    }>
  }>

  generateHistoryReport(
    projectId: number,
    filters: {
      perspective?: number
      member?: number
      timeRange?: string
    }
  ): Promise<any>

  exportReport(reportData: any, format: 'csv' | 'json'): Promise<void>
} 