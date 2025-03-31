import { dateFormat } from '@vuejs-community/vue-filter-date-format'
import { dateParse } from '@vuejs-community/vue-filter-date-parse'
import { Page } from '@/domain/models/page'
import { UserItem } from '@/domain/models/user/user'
import ApiService from '@/services/api.service'


function toModel(item: { [key: string]: any }): UserItem {
  return new UserItem(
    item.id,
    item.username,
    item.email,
    item.is_superuser,
    item.is_staff,
    item.is_active,
    item.first_name,
    item.last_name,
    dateFormat(dateParse(item.date_joined, 'YYYY-MM-DDTHH:mm:ss'), 'YYYY/MM/DD HH:mm'),
    item.last_login ? dateFormat(dateParse(item.last_login, 'YYYY-MM-DDTHH:mm:ss'), 'YYYY/MM/DD HH:mm') : "No login activity recorded yet"
  )
}

function toPayload(item: { [key: string]: any }): { [key: string]: any } {
  return {
    username: item.username,
    first_name: item.first_name,
    last_name: item.last_name,
    is_superuser: item.is_superuser,
    is_staff: item.is_staff,
    email: item.email,
    password1: item.password1,
    password2: item.password2
  }
}

export class APIUserRepository {
  constructor(private readonly request = ApiService) {}

  async getProfile(): Promise<UserItem> {
    const url = '/me'
    const response = await this.request.get(url)
    return toModel(response.data)
  }

  async list(query: any): Promise<Page<UserItem>> {
    try {
      const queryString = new URLSearchParams(query).toString()
      const url = queryString ? `/users?${queryString}` : `/users`
      const response = await this.request.get(url)

      let results, count, next, prev
      if (Array.isArray(response.data)) {
        results = response.data
        count = results.length
        next = null
        prev = null
      } else {
        results = response.data.results
        count = response.data.count
        next = response.data.next
        prev = response.data.previous
      }

      return new Page(
        count,
        next,
        prev,
        results.map((item: { [key: string]: any }) => toModel(item))
      )
    } catch (error) {
      console.error('Erro ao listar usuários:', error)
      throw error
    }
  }

  async bulkDelete(userIds: number[]): Promise<void> {
    const url = '/users/delete'; // nova rota
    await this.request.post(url, { ids: userIds }, { headers: { "Content-Type": "application/json" } });
  }

  async create(fields: { [key: string]: any }): Promise<UserItem> {
    const url = '/users/create'
    const payload = toPayload(fields)
    console.log('Payload enviado para o backend:', payload)
    const response = await this.request.post(url, payload)
    console.log('Resposta do backend:', response.data);
    return toModel(response.data)
  }

  async update(userId: number, fields: { [key: string]: any }): Promise<UserItem> {
  const url = `/users/${userId}/update`; // Define the update endpoint
  const payload = toPayload(fields);
  console.log('Updating user with payload:', payload);

  const response = await this.request.put(url, payload);
  return toModel(response.data);
}

}
