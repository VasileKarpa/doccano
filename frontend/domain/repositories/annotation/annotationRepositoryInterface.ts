import { Annotation } from '~/domain/models/annotation/annotation'

export interface AnnotationRepository {
  listAnnotations(
    projectId: number,
    filters?: { perspective?: number; member?: number }
  ): Promise<{ results: Annotation[]; count: number }>
  getAnnotation(projectId: number, annotationId: number): Promise<Annotation>
  createAnnotation(projectId: number, payload: Partial<Annotation>): Promise<Annotation>
  updateAnnotation(
    projectId: number,
    annotationId: number,
    payload: Partial<Annotation>
  ): Promise<Annotation>
  deleteAnnotation(projectId: number, annotationId: number): Promise<void>
} 