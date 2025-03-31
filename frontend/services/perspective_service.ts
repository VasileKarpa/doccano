import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/v1/perspectives/'

export const getPerspectives = () => axios.get(`${API_URL}perspectives/`)
export const getAnnotationPerspectives = () => axios.get(`${API_URL}annotation-perspectives/`)
export const linkAnnotationToPerspective = (data: { content_type: number; object_id: number; perspective: number }) =>
  axios.post(`${API_URL}annotation-perspectives/`, data)
export const deleteAnnotationPerspective = (id: number) =>
  axios.delete(`${API_URL}annotation-perspectives/${id}/`)
