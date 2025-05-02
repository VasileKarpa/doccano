import { AxiosInstance } from 'axios'
import { APIMemberRepository } from '~/domain/repositories/member/memberRepository'
import { APIPerspectiveRepository } from '~/domain/repositories/perspective/perspectiveRepository'
import { APIAnnotationRepository } from '~/domain/repositories/annotation/annotationRepository'
import { StatisticsRepositoryImpl } from '~/domain/repositories/statistics/statisticsRepository'

export interface Repositories {
  member: APIMemberRepository
  perspective: APIPerspectiveRepository
  annotation: APIAnnotationRepository
  statistics: StatisticsRepositoryImpl
  metrics: {
    fetchCategoryDistribution(projectId: number | string, filters: any): Promise<any>
  }
}

export function createRepositories(axios: AxiosInstance): Repositories {
  const memberRepository = new APIMemberRepository(axios)
  const perspectiveRepository = new APIPerspectiveRepository(axios)
  const annotationRepository = new APIAnnotationRepository(axios)

  const repositories: Repositories = {
    member: memberRepository,
    perspective: perspectiveRepository,
    annotation: annotationRepository,
    statistics: new StatisticsRepositoryImpl(axios),
    metrics: {
      fetchCategoryDistribution: async (projectId: number | string, filters: any) => {
        const response = await axios.get(`/projects/${projectId}/metrics/category-distribution/`, { params: filters })
        return response.data
      }
    }
  }

  return repositories
} 