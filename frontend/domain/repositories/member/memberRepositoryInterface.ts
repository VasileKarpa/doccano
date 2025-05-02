import { Member } from '~/domain/models/member/member'

export interface MemberRepository {
  listMembers(projectId: number): Promise<{ results: Member[]; count: number }>
  getMember(projectId: number, memberId: number): Promise<Member>
  createMember(projectId: number, payload: Partial<Member>): Promise<Member>
  updateMember(projectId: number, memberId: number, payload: Partial<Member>): Promise<Member>
  deleteMember(projectId: number, memberId: number): Promise<void>
} 