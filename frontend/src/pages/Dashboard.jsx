import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard(){
  const { user } = useAuth()
  const [items,setItems] = useState([])
  const [title,setTitle] = useState('')
  const [file,setFile] = useState(null)
  const [uploading,setUploading] = useState(false)
  const [progress,setProgress] = useState(0)

  useEffect(()=>{fetchItems()},[])

  async function fetchItems(){
    try{
      const res = await api.get('/items')
      setItems(res.data)
    }catch(err){console.error(err)}
  }

  async function submit(e){
    e.preventDefault()
    if (!title || title.trim().length < 3) return alert('Title must be at least 3 characters')
    try{
      const form = new FormData()
      form.append('title', title)
      if (file) form.append('image', file)
      setUploading(true)
      setProgress(0)
      const res = await api.instance.post('/items', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total))
        }
      })

      // optimistic UI: prepend returned item if available
      const created = res.data
      if (created) setItems(prev => [created, ...prev])
      else fetchItems()

      setTitle('')
      if (file && file.preview) URL.revokeObjectURL(file.preview)
      setFile(null)
    }catch(err){console.error(err)}
    finally{setUploading(false); setProgress(0)}
  }

  return (
    <div className="main-content">
      <div className="page-title">
        <h1>Dashboard</h1>
        <p>👋 Welcome back, <span className="text-primary">{user?.name || user?.email}</span></p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3>📝 Post a Found Item</h3>
        </div>
        <form onSubmit={submit} className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Item Title</label>
            <input 
              className="form-control" 
              value={title} 
              onChange={e=>setTitle(e.target.value)}
              placeholder="e.g., Blue Backpack, Gold Watch, Keys..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Item Photo</label>
            <input 
              className="form-control" 
              type="file" 
              accept="image/*" 
              onChange={e=>{
                const f = e.target.files[0]
                if (f) f.preview = URL.createObjectURL(f)
                setFile(f)
              }} 
            />
            {file && <div className="mt-3"><img className="h-36 object-cover rounded-lg" src={file.preview} alt="preview" /></div>}
          </div>
          <div className="flex gap-4 items-center">
            <button className="btn btn-primary" type="submit" disabled={uploading}>
              {uploading ? `⏳ Uploading (${progress}%)` : '✅ Post Item'}
            </button>
            {uploading && <div className="flex-1 progress">
              <div className="progress-bar" style={{width:`${progress}%`}} />
            </div>}
          </div>
        </form>
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">📦 Found Items ({items.length})</h3>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <p>No items posted yet. Help others by posting found items! 🤝</p>
          </div>
        ) : (
          <div className="item-grid">
            {items.map(it=> (
              <div key={it._id} className="item-card">
                {it.image && <img className="item-image" src={it.image} alt={it.title} />}
                <div className="item-content">
                  <h4 className="item-title">{it.title}</h4>
                  <div className="item-date">Posted {new Date(it.createdAt).toLocaleDateString()}</div>
                  <div className="item-actions">
                    <button 
                      onClick={async()=>{
                        if (!confirm('Delete this item?')) return
                        try{
                          await api.delete(`/items/${it._id}`)
                          setItems(prev => prev.filter(x=>x._id !== it._id))
                        }catch(err){console.error(err)}
                      }} 
                      className="btn btn-danger"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
