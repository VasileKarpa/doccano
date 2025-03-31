import { ref } from 'vue'
import {
  getPerspectives,
  getAnnotationPerspectives,
  linkAnnotationToPerspective,
  deleteAnnotationPerspective
} from '@/services/perspective_service'

export function usePerspective() {
  const perspectives = ref([])
  const associations = ref([])

  const fetchPerspectives = async () => {
    const response = await getPerspectives()
    perspectives.value = response.data
  }

  const fetchAssociations = async (annotationId: number) => {
    const response = await getAnnotationPerspectives()
    associations.value = response.data.filter(a => a.object_id === annotationId)
  }

  const associate = async (contentTypeId: number, annotationId: number, perspectiveId: number) => {
    await linkAnnotationToPerspective({
      content_type: contentTypeId,
      object_id: annotationId,
      perspective: perspectiveId
    })
    await fetchAssociations(annotationId)
  }

  const removeAssociation = async (associationId: number, annotationId: number) => {
    await deleteAnnotationPerspective(associationId)
    await fetchAssociations(annotationId)
  }

  return {
    perspectives,
    associations,
    fetchPerspectives,
    fetchAssociations,
    associate,
    removeAssociation
  }
}

