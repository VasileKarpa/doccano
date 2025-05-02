import { Perspective } from '~/domain/models/perspective/perspective'

export interface PerspectiveRepository {
  getPerspectives(projectId: number): Promise<Perspective[]>
  listPerspectives(projectId: number, query: any): Promise<{ results: Perspective[]; count: number }>
  createPerspective(projectId: number, payload: Partial<Perspective>): Promise<Perspective>
  deletePerspective(projectId: number, perspectiveId: number): Promise<void>
} 