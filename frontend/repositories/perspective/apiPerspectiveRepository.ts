import axios from "axios";

export const apiPerspectiveRepository = {
  async getPerspectives(projectId: number): Promise<Perspective[]> {
    const { data } = await axios.get(`/v1/projects/${projectId}/perspective`);
    return data;
  },

  async createPerspective(projectId: number, payload: Partial<Perspective>) {
    await axios.post(`/v1/projects/${projectId}/perspective`, payload);
  },
  async deletePerspective(projectId: number, perspectiveId: number): Promise<void> {
    await axios.delete(`/v1/projects/${projectId}/perspective/${perspectiveId}`);
  },

  async getPerspectiveDetails(projectId: number, perspectiveId: number): Promise<Perspective> {
    const { data } = await axios.get(`/v1/projects/${projectId}/perspective/${perspectiveId}`);
    return data;
  },
};
