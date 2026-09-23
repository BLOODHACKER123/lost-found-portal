import React, { useEffect, useMemo, useState } from 'react'
import { Archive, ArrowRight, Camera, CheckCircle2, ChevronDown, Compass, Grid2X2, LogOut, MapPin, Plus, Search, ShieldCheck, Trash2, Upload, UserRound, X } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const initialForm = { title: '', description: '', category: 'Personal', location: '', type: 'found' }

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showComposer, setShowComposer] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    try {
      const res = await api.get('/items')
      setItems(res.data.items || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load items right now.')
    }
  }

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter
    const haystack = `${item.title} ${item.description} ${item.location} ${item.category}`.toLowerCase()
    return matchesFilter && haystack.includes(query.toLowerCase())
  }), [activeFilter, items, query])

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'
  const initials = displayName.slice(0, 2).toUpperCase()

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (form.title.trim().length < 3 || form.description.trim().length < 10 || !form.location.trim()) {
      setError('Add a title, a little detail, and where it was found.')
      return
    }
    try {
      const body = new FormData()
      Object.entries(form).forEach(([key, value]) => body.append(key, value))
      if (file) body.append('image', file)
      setUploading(true)
      const res = await api.instance.post('/items', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => event.total && setProgress(Math.round((event.loaded * 100) / event.total)),
      })
      setItems((current) => [res.data, ...current])
      setForm(initialForm)
      setFile(null)
      setShowComposer(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post this item.')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  async function removeItem(item) {
    if (!window.confirm(`Delete “${item.title}”?`)) return
    try {
      await api.delete(`/items/${item._id}`)
      setItems((current) => current.filter((entry) => entry._id !== item._id))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this item.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><span className="brand-dot" /> Foundly</div>
        <div className="sidebar-label">Workspace</div>
        <nav className="side-nav">
          <a className="side-link active" href="#feed"><Grid2X2 size={18} /> Overview</a>
          <a className="side-link" href="#feed"><Archive size={18} /> Your posts <span className="side-count">{items.length}</span></a>
          <a className="side-link" href="#how-it-works"><Compass size={18} /> How it works</a>
        </nav>
        <div className="sidebar-spacer" />
        <div className="side-trust"><ShieldCheck size={18} /><div><strong>Community first</strong><span>Your reports stay private.</span></div></div>
        <button className="side-link side-button" onClick={logout}><LogOut size={18} /> Sign out</button>
      </aside>

      <main className="dashboard-main">
        <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><span className="brand-dot" /> Foundly</div></div><div className="topbar-actions"><button className="icon-button" aria-label="Community status"><CheckCircle2 size={19} /></button><div className="user-chip"><span className="avatar">{initials}</span><span className="user-chip-name">{displayName}</span><ChevronDown size={15} /></div></div></header>
        <div className="dashboard-content">
          <section className="welcome-row"><div><p className="eyebrow">Wednesday, September 23</p><h1>Good morning, {displayName.split(' ')[0]}<span className="accent-dot">.</span></h1><p className="lede">A small update can make a big difference.</p></div><button className="button button-primary" onClick={() => setShowComposer(true)}><Plus size={18} /> Report an item</button></section>
          <section className="stat-grid" aria-label="Community stats"><div className="stat-card stat-featured"><div className="stat-icon"><CheckCircle2 size={19} /></div><div><span>Items reunited</span><strong>2,481</strong><small><span className="up">+12%</span> this month</small></div></div><div className="stat-card"><div className="stat-icon soft"><Archive size={19} /></div><div><span>Open reports</span><strong>{items.length}</strong><small>Across your community</small></div></div><div className="stat-card"><div className="stat-icon soft"><UserRound size={19} /></div><div><span>Your contributions</span><strong>{items.length}</strong><small>Thank you for helping</small></div></div></section>
          <section className="feed-section" id="feed"><div className="section-heading"><div><p className="eyebrow">The community board</p><h2>Recent reports</h2></div><button className="text-button" onClick={fetchItems}>Refresh <ChevronDown size={15} /></button></div>
            <div className="feed-toolbar"><div className="search-wrap"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by item, place, or detail" /></div><div className="filter-tabs"><button className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>All</button><button className={activeFilter === 'lost' ? 'active' : ''} onClick={() => setActiveFilter('lost')}>Lost</button><button className={activeFilter === 'found' ? 'active' : ''} onClick={() => setActiveFilter('found')}>Found</button></div></div>
            {error && <div className="alert alert-error feed-alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button></div>}
            {filteredItems.length === 0 ? <div className="empty-state"><div className="empty-icon"><Search size={22} /></div><h3>No reports match that search</h3><p>Try another keyword, or be the first to report something new.</p><button className="button button-secondary" onClick={() => setShowComposer(true)}><Plus size={17} /> Report an item</button></div> : <div className="item-grid">{filteredItems.map((item) => <article className="item-card" key={item._id}><div className="item-media">{item.image ? <img src={item.image} alt={item.title} /> : <div className={`placeholder-art ${item.type}`}><Camera size={28} /><span>{item.category || 'Item'}</span></div>}<span className={`status-pill ${item.type}`}>{item.type}</span></div><div className="item-content"><div className="item-meta"><span><MapPin size={13} /> {item.location || 'Location not listed'}</span><span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div><h3>{item.title}</h3><p>{item.description || 'No additional details provided.'}</p><div className="item-footer"><span className="category-label">{item.category || 'Personal'}</span>{item.reportedBy?._id === user?.id && <button className="delete-button" onClick={() => removeItem(item)} aria-label={`Delete ${item.title}`}><Trash2 size={16} /></button>}</div></div></article>)}</div>}
          </section>
        </div>
      </main>

      {showComposer && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowComposer(false)}><section className="composer-modal"><div className="modal-header"><div><p className="eyebrow">New report</p><h2>What did you find?</h2></div><button className="icon-button" onClick={() => setShowComposer(false)} aria-label="Close report form"><X size={19} /></button></div><form onSubmit={submit} className="composer-form"><div className="form-row"><label>Report type<select className="field" name="type" value={form.type} onChange={updateForm}><option value="found">I found something</option><option value="lost">I lost something</option></select></label><label>Category<select className="field" name="category" value={form.category} onChange={updateForm}><option>Personal</option><option>Electronics</option><option>Keys</option><option>Cards & IDs</option><option>Clothing</option><option>Other</option></select></label></div><label>Item title<input className="field" name="title" value={form.title} onChange={updateForm} placeholder="e.g. Navy canvas backpack" /></label><label>Where was it seen?<input className="field" name="location" value={form.location} onChange={updateForm} placeholder="e.g. Library, 2nd floor" /></label><label>Tell us a little more<textarea className="field textarea" name="description" value={form.description} onChange={updateForm} placeholder="Color, distinguishing marks, time of day..." rows="4" /></label><label className="upload-field"><Upload size={18} /><span>{file ? file.name : 'Add a photo (optional)'}</span><input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>{uploading && <div className="upload-progress"><span style={{ width: `${progress}%` }} /></div>}<button className="button button-primary button-wide" type="submit" disabled={uploading}>{uploading ? `Posting ${progress}%` : 'Publish report'} <ArrowRight size={17} /></button></form></section></div>}
    </div>
  )
}
