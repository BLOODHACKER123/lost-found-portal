import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, KeyRound, Search } from 'lucide-react'

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
    <main className="auth-shell">
      <section className="auth-story">
        <div className="brand-mark"><span className="brand-dot" /> Foundly</div>
        <div className="story-copy">
          <p className="eyebrow">A little help goes a long way</p>
          <h1>Return what matters.</h1>
          <p>One calm place for your campus community to report, search, and reunite with the things that keep your day moving.</p>
        </div>
        <div className="story-note"><Search size={17} /><span>2,481 items reunited this year</span></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand"><div className="brand-mark"><span className="brand-dot" /> Foundly</div></div>
          <div className="auth-heading"><div className="icon-badge"><KeyRound size={19} /></div><p className="eyebrow">Welcome back</p><h2>Pick up where you left off.</h2><p>Sign in to keep an eye on your reports and messages.</p></div>
          <form onSubmit={submit} className="auth-form">
            <label>Email address<input className="field" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" required /></label>
            <label>Password<input className="field" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required /></label>
            {error && <div className="alert alert-error">{error.replace('Error: ', '')}</div>}
            <button className="button button-primary button-wide" type="submit">Sign in <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">New to Foundly? <a href="/register">Create an account</a></p>
        </div>
      </section>
    </main>
  )
}
