import { AxiosInstance } from 'axios'
import { StatisticsRepository } from './statisticsRepositoryInterface'
import { Annotation } from '~/domain/models/annotation/annotation'
import { APIMemberRepository } from '@/repositories/member/apiMemberRepository'
import { APIPerspectiveRepository } from '~/domain/repositories/perspective/perspectiveRepository'
import { APIAnnotationRepository } from '~/domain/repositories/annotation/annotationRepository'

export class StatisticsRepositoryImpl implements StatisticsRepository {
  private memberRepository: APIMemberRepository
  private perspectiveRepository: APIPerspectiveRepository
  private annotationRepository: APIAnnotationRepository

  constructor($axios: AxiosInstance) {
    this.memberRepository = new APIMemberRepository()
    this.perspectiveRepository = new APIPerspectiveRepository($axios)
    this.annotationRepository = new APIAnnotationRepository($axios)
  }

  async generateDisagreementReport(
    projectId: number,
    filters: {
      dataset?: number
      discussion?: number
      perspective?: number
      member?: number
    }
  ): Promise<any> {
    const annotations = await this.annotationRepository.listAnnotations(projectId, {
      perspective: filters.perspective,
      member: filters.member
    })

    const annotationsByDoc = this.groupAnnotationsByDocument(annotations.results)
    const disagreements = []

    for (const [docId, docAnnotations] of Object.entries(annotationsByDoc)) {
      const pairs = this.getAnnotatorPairs(docAnnotations)
      
      for (const [annotator1, annotator2] of pairs) {
        const a1Annotations = docAnnotations.filter(a => a.member === annotator1)
        const a2Annotations = docAnnotations.filter(a => a.member === annotator2)
        
        const disagreementRate = this.calculateDisagreementRate(a1Annotations, a2Annotations)
        const disagreementCategories = this.getDisagreementCategories(a1Annotations, a2Annotations)
        
        disagreements.push({
          document: parseInt(docId),
          annotator1,
          annotator2,
          disagreementRate,
          disagreementCategories
        })
      }
    }

    return {
      items: disagreements
    }
  }

  async generatePerspectiveReport(
    projectId: number,
    filters: {
      dataset?: number
      discussion?: number
      perspective?: number
      member?: number
    }
  ): Promise<any> {
    const annotations = await this.annotationRepository.listAnnotations(projectId, {
      perspective: filters.perspective,
      member: filters.member
    })

    const annotationsByDocAndMember = this.groupAnnotationsByDocumentAndMember(annotations.results)
    const statistics = []

    for (const [docId, docAnnotations] of Object.entries(annotationsByDocAndMember)) {
      for (const [memberId, memberAnnotations] of Object.entries(docAnnotations)) {
        const categoryStats = this.calculateCategoryStatistics(memberAnnotations)
        
        statistics.push({
          document: parseInt(docId),
          annotator: parseInt(memberId),
          ...categoryStats
        })
      }
    }

    return {
      items: statistics
    }
  }

  async generateAnnotatorReport(
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
  }> {
    console.log('Starting generateAnnotatorReport with filters:', filters)
    
    const members = await this.memberRepository.list(projectId.toString())
    console.log('Fetched members:', members)
    
    const memberId = members.find(m => m.username === filters.member?.toString())?.id || filters.member
    console.log('Resolved memberId:', memberId)
    console.log('Original filters.member:', filters.member)

    let annotations
    try {
      annotations = await this.annotationRepository.listAnnotations(projectId, {
        perspective: filters.perspective,
        member: memberId
      })
      console.log('Fetched annotations:', annotations)
    } catch (error: any) {
      console.error('Error fetching annotations:', error)
      console.error('Error details:', {
        projectId,
        filters,
        memberId,
        errorMessage: error.message,
        errorResponse: error.response?.data
      })
      throw error
    }

    const statistics = []

    for (const member of members) {
      const memberAnnotations = annotations.results.filter((a: Annotation) => a.member === member.id)
      const totalAnnotations = memberAnnotations.length
      const categories = [...new Set(memberAnnotations.map((a: Annotation) => a.category))]
      
      // Agrupar anotações por dataset
      const annotationsByDataset = memberAnnotations.reduce((acc: Record<number, Annotation[]>, annotation: Annotation) => {
        if (!acc[annotation.document]) {
          acc[annotation.document] = []
        }
        acc[annotation.document].push(annotation)
        return acc
      }, {} as Record<number, Annotation[]>)

      // Calcular estatísticas por dataset
      const datasetStats = Object.entries(annotationsByDataset).map(([docId, docAnnotations]) => {
        const docCategories = [...new Set(docAnnotations.map((a: Annotation) => a.category))]
        const categoryCounts = docCategories.reduce((acc: Record<string, number>, category: string) => {
          acc[category] = docAnnotations.filter((a: Annotation) => a.category === category).length
          return acc
        }, {} as Record<string, number>)

        return {
          document: parseInt(docId),
          categories: docCategories.map(category => ({
            name: category,
            count: categoryCounts[category],
            percentage: ((categoryCounts[category] / docAnnotations.length) * 100).toFixed(1)
          }))
        }
      })

      statistics.push({
        annotator: member.username || member.id.toString(),
        total: totalAnnotations,
        categories: categories.join(', '),
        datasets: datasetStats
      })
    }

    return {
      items: statistics
    }
  }

  async generateHistoryReport(
    projectId: number,
    filters: {
      perspective?: number
      member?: number
      timeRange?: string
    }
  ): Promise<any> {
    const annotations = await this.annotationRepository.listAnnotations(projectId, {
      perspective: filters.perspective,
      member: filters.member
    })

    const sortedAnnotations = annotations.results.sort((a, b) => 
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    )

    const history = sortedAnnotations.map(annotation => ({
      date: new Date(annotation.updated_at).toLocaleString(),
      annotator: annotation.member.toString(),
      action: 'Anotação',
      changes: `Categoria: ${annotation.category}, Texto: ${annotation.text}`
    }))

    return {
      items: history
    }
  }

  async exportReport(reportData: any, format: 'csv' | 'json'): Promise<void> {
    if (format === 'csv') {
      const csvContent = this.convertToCSV(reportData.items)
      await this.downloadFile(csvContent, 'report.csv', 'text/csv')
    } else {
      const jsonContent = JSON.stringify(reportData.items, null, 2)
      await this.downloadFile(jsonContent, 'report.json', 'application/json')
    }
  }

  private async calculateAnnotatorDisagreementRate(
    projectId: number,
    memberId: number,
    perspectiveId?: number
  ): Promise<number> {
    const annotations = await this.annotationRepository.listAnnotations(projectId, {
      perspective: perspectiveId,
      member: memberId
    })

    const annotationsByDoc = this.groupAnnotationsByDocument(annotations.results)
    let totalDisagreements = 0
    let totalComparisons = 0

    for (const docAnnotations of Object.values(annotationsByDoc)) {
      const pairs = this.getAnnotatorPairs(docAnnotations)
      
      for (const [annotator1, annotator2] of pairs) {
        const a1Annotations = docAnnotations.filter(a => a.member === annotator1)
        const a2Annotations = docAnnotations.filter(a => a.member === annotator2)
        
        const disagreementRate = this.calculateDisagreementRate(a1Annotations, a2Annotations)
        totalDisagreements += disagreementRate
        totalComparisons++
      }
    }

    return totalComparisons > 0 ? totalDisagreements / totalComparisons : 0
  }

  private groupAnnotationsByDocument(annotations: Annotation[]): Record<number, Annotation[]> {
    return annotations.reduce((acc, annotation) => {
      const docId = annotation.document
      if (!acc[docId]) {
        acc[docId] = []
      }
      acc[docId].push(annotation)
      return acc
    }, {} as Record<number, Annotation[]>)
  }

  private groupAnnotationsByDocumentAndMember(annotations: Annotation[]): Record<number, Record<number, Annotation[]>> {
    return annotations.reduce((acc, annotation) => {
      const docId = annotation.document
      const memberId = annotation.member
      if (!acc[docId]) {
        acc[docId] = {}
      }
      if (!acc[docId][memberId]) {
        acc[docId][memberId] = []
      }
      acc[docId][memberId].push(annotation)
      return acc
    }, {} as Record<number, Record<number, Annotation[]>>)
  }

  private getAnnotatorPairs(annotations: Annotation[]): [number, number][] {
    const annotators = [...new Set(annotations.map(a => a.member))]
    const pairs: [number, number][] = []
    
    for (let i = 0; i < annotators.length; i++) {
      for (let j = i + 1; j < annotators.length; j++) {
        pairs.push([annotators[i], annotators[j]])
      }
    }
    
    return pairs
  }

  private calculateDisagreementRate(a1Annotations: Annotation[], a2Annotations: Annotation[]): number {
    let disagreements = 0
    
    for (const a1 of a1Annotations) {
      const matchingA2 = a2Annotations.find(a2 => this.annotationsMatch(a1, a2))
      if (!matchingA2) {
        disagreements++
      }
    }
    
    return disagreements / (a1Annotations.length || 1)
  }

  private getDisagreementCategories(a1Annotations: Annotation[], a2Annotations: Annotation[]): string[] {
    const categories = new Set<string>()
    
    a1Annotations.forEach(a1 => {
      const matchingA2 = a2Annotations.find(a2 => this.annotationsMatch(a1, a2))
      if (!matchingA2) {
        categories.add(a1.category)
      }
    })

    return Array.from(categories)
  }

  private calculateCategoryStatistics(annotations: Annotation[]): Record<string, any> {
    const total = annotations.length
    const categoryCounts = annotations.reduce((acc, annotation) => {
      acc[annotation.category] = (acc[annotation.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryCounts).reduce((acc, [category, count]) => {
      acc[`${category}_frequency`] = count
      acc[`${category}_percentage`] = (count / total) * 100
      return acc
    }, {} as Record<string, any>)
  }

  private annotationsMatch(a1: Annotation, a2: Annotation): boolean {
    return a1.category === a2.category && 
           a1.start === a2.start && 
           a1.end === a2.end
  }

  private convertToCSV(items: any[]): string {
    if (items.length === 0) return ''
    
    const headers = Object.keys(items[0])
    const rows = items.map(item => headers.map(header => item[header]))
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
  }

  private async downloadFile(content: string, filename: string, type: string): Promise<void> {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    await new Promise<void>(resolve => {
      link.click()
      resolve()
    })
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
} 