import { AxiosInstance } from 'axios'
import { PerspectiveRepository } from './perspectiveRepositoryInterface'
import { Perspective } from '~/domain/models/perspective/perspective'

export class APIPerspectiveRepository implements PerspectiveRepository {
  constructor(private axios: AxiosInstance) {}

  async getPerspectives(projectId: number): Promise<Perspective[]> {
    const response = await this.axios.get(`/projects/${projectId}/perspectives/`)
    return response.data.results
  }

  async listPerspectives(
    projectId: number,
    query: any
  ): Promise<{ results: Perspective[]; count: number }> {
    const response = await this.axios.get(`/projects/${projectId}/perspectives/`, {
      params: query
    })
    return response.data
  }

  async createPerspective(projectId: number, payload: Partial<Perspective>): Promise<Perspective> {
    const response = await this.axios.post(`/projects/${projectId}/perspectives/`, payload)
    return response.data
  }

  async deletePerspective(projectId: number, perspectiveId: number): Promise<void> {
    await this.axios.delete(`/projects/${projectId}/perspectives/${perspectiveId}/`)
  }
}