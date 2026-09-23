import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) api.setToken(token)
  }, [])

  const isAuthenticated = Boolean(user)

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    const data = res.data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    api.setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    api.setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
