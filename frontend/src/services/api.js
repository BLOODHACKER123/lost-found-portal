import axios from 'axios'

const baseURL = 'http://localhost:5000/api'

const instance = axios.create({ baseURL })

const setToken = (token) => {
  if (token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete instance.defaults.headers.common['Authorization']
}

export default {
  get: instance.get,
  post: instance.post,
  put: instance.put,
  delete: instance.delete,
  instance,
  setToken,
}
