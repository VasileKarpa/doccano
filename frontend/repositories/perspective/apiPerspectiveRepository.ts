import axios from "axios";
import { Perspective } from "@/domain/models/perspective/perspective"; // Ajuste o caminho conforme necessário

export const apiPerspectiveRepository = {
  async getPerspectives(projectId: number): Promise<Perspective[]> {
    const {data} = await axios.get(`/v1/projects/${projectId}/perspective`);
    return data;
  },

  async listPerspectives(projectId: number, query: any): Promise<{ results: Perspective[]; count: number }> {
    const queryString = new URLSearchParams(query).toString();
    const {data} = await axios.get(`/v1/projects/${projectId}/perspective?${queryString}`);
    return data;
  },

  async createPerspective(projectId: number, payload: Partial<Perspective>) {
    await axios.post(`/v1/projects/${projectId}/perspective`, payload);
  },

  async deletePerspective(projectId: number, perspectiveId: number): Promise<void> {
    await axios.delete(`/v1/projects/${projectId}/perspective/${perspectiveId}`);
  },

  async getPerspectiveDetails(projectId: number, perspectiveId: number): Promise<Perspective> {
    const {data} = await axios.get(`/v1/projects/${projectId}/perspective/${perspectiveId}`);
    return data;
  },

  // Método para obter perspectivas associadas a um anotador
  async getPerspectivesByAnnotator(projectId: number, perspectiveId: number): Promise<Perspective[]> {
    const {data} = await axios.get(`/v1/projects/${projectId}/perspective/${perspectiveId}/annotators`);
    return data;
  },

  // Método para associar um anotador a uma perspectiva
  async associateAnnotatorToPerspective(
      projectId: number,
      perspectiveId: number,
      annotatorId: number
  ): Promise<void> {
    await axios.post(`/v1/projects/${projectId}/perspective/${perspectiveId}/annotators/`, {annotator: annotatorId});
  },
}