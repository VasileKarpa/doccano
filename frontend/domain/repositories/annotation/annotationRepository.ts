import { AxiosInstance } from 'axios'
import { AnnotationRepository } from './annotationRepositoryInterface'
import { Annotation } from '~/domain/models/annotation/annotation'

export class APIAnnotationRepository implements AnnotationRepository {
  constructor(private axios: AxiosInstance) {}

  async listAnnotations(
    projectId: number,
    filters?: { perspective?: number; member?: number }
  ): Promise<{ results: Annotation[]; count: number }> {
    console.log('Fetching annotations with params:', {
      projectId,
      filters,
      url: `/projects/${projectId}/annotations/`
    })

    try {
      const response = await this.axios.get(`/projects/${projectId}/annotations/`, {
        params: filters
      })
      console.log('Annotations response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error fetching annotations:', {
        projectId,
        filters,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      })
      throw error
    }
  }

  async getAnnotation(projectId: number, annotationId: number): Promise<Annotation> {
    const response = await this.axios.get(`/projects/${projectId}/annotations/${annotationId}/`)
    return response.data
  }

  async createAnnotation(projectId: number, payload: Partial<Annotation>): Promise<Annotation> {
    const response = await this.axios.post(`/projects/${projectId}/annotations/`, payload)
    return response.data
  }

  async updateAnnotation(
    projectId: number,
    annotationId: number,
    payload: Partial<Annotation>
  ): Promise<Annotation> {
    const response = await this.axios.put(
      `/projects/${projectId}/annotations/${annotationId}/`,
      payload
    )
    return response.data
  }

  async deleteAnnotation(projectId: number, annotationId: number): Promise<void> {
    await this.axios.delete(`/projects/${projectId}/annotations/${annotationId}/`)
  }
} 