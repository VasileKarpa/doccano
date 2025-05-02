import axios from 'axios'
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

class ApiService {
  constructor() {
    console.log('Initializing API service with baseURL:', '/v1')
    console.log('API_URL environment variable:', process.env.API_URL)
    this.instance = axios.create({
      baseURL: '/v1'
    })
  }

  request(method, url, data = {}, config = {}) {
    console.log('Making request:', {
      method,
      url,
      baseURL: this.instance.defaults.baseURL,
      fullURL: `${this.instance.defaults.baseURL}${url}`,
      config
    })
    return this.instance({
      method,
      url,
      data,
      ...config
    })
  }

  get(url, config = {}) {
    return this.request('GET', url, {}, config)
  }

  post(url, data, config = {}) {
    return this.request('POST', url, data, config)
  }

  put(url, data, config = {}) {
    return this.request('PUT', url, data, config)
  }

  patch(url, data, config = {}) {
    return this.request('PATCH', url, data, config)
  }

  delete(url, data = {}, config = {}) {
    return this.request('DELETE', url, data, config)
  }
}

export default new ApiService()
