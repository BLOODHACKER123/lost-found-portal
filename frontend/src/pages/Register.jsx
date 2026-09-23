import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, HeartHandshake, Search } from 'lucide-react'

export default function Register(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [name,setName]=useState('')
  const [error,setError]=useState(null)
  const { register } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try{
      await register({ name, email, password })
      nav('/login')
    }catch(err){
      setError(err.response?.data?.message || String(err))
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-story auth-story-register">
        <div className="brand-mark"><span className="brand-dot" /> Foundly</div>
        <div className="story-copy"><p className="eyebrow">Good things find their way back</p><h1>Be part of the return.</h1><p>Join a thoughtful community making lost-and-found feel more human, more visible, and a lot less awkward.</p></div>
        <div className="story-note"><HeartHandshake size={17} /><span>Built for kind people with busy lives</span></div>
      </section>
      <section className="auth-panel"><div className="auth-panel-inner">
        <div className="mobile-brand"><div className="brand-mark"><span className="brand-dot" /> Foundly</div></div>
        <div className="auth-heading"><div className="icon-badge"><Search size={19} /></div><p className="eyebrow">Join the network</p><h2>Make someone’s day.</h2><p>Create your free account and start returning the little things that matter.</p></div>
        <form onSubmit={submit} className="auth-form">
          <label>Full name<input className="field" value={name} onChange={e=>setName(e.target.value)} placeholder="Jordan Lee" required /></label>
          <label>Email address<input className="field" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" required /></label>
          <label>Password<input className="field" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" minLength="6" required /></label>
          {error && <div className="alert alert-error">{error.replace('Error: ', '')}</div>}
          <button className="button button-primary button-wide" type="submit">Create account <ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">Already have an account? <a href="/login">Sign in</a></p>
      </div></section>
    </main>
  )
}
