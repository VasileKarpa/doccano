import { RoleName } from '../role/role'

export class MemberItem {
  constructor(
    readonly id: number,
    readonly user: number,
    readonly role: number,
    readonly username: string,
    readonly rolename: RoleName
  ) {}

  get isProjectAdmin(): boolean {
    return this.rolename === 'project_admin'
  }
}

export interface Member {
  id: string
  username: string
  email: string
  role: string
  created_at: string
  updated_at: string
}
