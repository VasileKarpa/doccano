import { AxiosInstance } from 'axios'
import { Member } from '~/domain/models/member/member'
import { MemberRepository } from './memberRepositoryInterface'

export class APIMemberRepository implements MemberRepository {
  constructor(private axios: AxiosInstance) {}

  async listMembers(projectId: number): Promise<{ results: Member[]; count: number }> {
    const response = await this.axios.get(`/projects/${projectId}/members/`)
    return response.data
  }

  async getMember(projectId: number, memberId: number): Promise<Member> {
    const response = await this.axios.get(`/projects/${projectId}/members/${memberId}/`)
    return response.data
  }

  async createMember(projectId: number, payload: Partial<Member>): Promise<Member> {
    const response = await this.axios.post(`/projects/${projectId}/members/`, payload)
    return response.data
  }

  async updateMember(projectId: number, memberId: number, payload: Partial<Member>): Promise<Member> {
    const response = await this.axios.put(`/projects/${projectId}/members/${memberId}/`, payload)
    return response.data
  }

  async deleteMember(projectId: number, memberId: number): Promise<void> {
    await this.axios.delete(`/projects/${projectId}/members/${memberId}/`)
  }
} 