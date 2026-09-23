import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await login({ email, password })
      nav('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || String(err))
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="card">
          <div className="card-header">
            <h2>Welcome Back</h2>
            <p className="mb-0">Sign in to your account</p>
          </div>
          <form onSubmit={submit} className="card-body">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                className="form-control" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="you@example.com" 
                type="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-control" 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>
            {error && <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>}
            <button className="btn btn-primary btn-block" type="submit">Sign In</button>
          </form>
          <p className="form-help">Don't have an account? <a href="/register">Create one</a></p>
        </div>
      </div>
    </div>
  )
}
