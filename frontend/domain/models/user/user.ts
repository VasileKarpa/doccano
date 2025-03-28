export class UserItem {
  constructor(
    readonly id: number,
    readonly username: string,
    readonly email: string,
    readonly isSuperuser: boolean,
    readonly isStaff: boolean,
    readonly isActive: boolean,
    readonly first_name: string,
    readonly last_name: string,
    readonly date_joined: string,
    readonly last_login: string
  ) {}
}
