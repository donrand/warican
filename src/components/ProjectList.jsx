import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function ProjectList({ onSelect }) {
  const [projects, setProjects] = useState([])
  const [newName, setNewName] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { setError(error.message); return }
    setProjects(data || [])
  }

  const createProject = async () => {
    const name = newName.trim()
    if (!name) return
    const { data, error } = await supabase
      .from('projects')
      .insert({ name })
      .select()
      .single()
    if (error) { setError(error.message); return }
    setNewName('')
    if (data) onSelect(data)
  }

  const deleteProject = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('このプロジェクトを削除しますか？')) return
    await supabase.from('projects').delete().eq('id', id)
    await loadProjects()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') createProject()
  }

  return (
    <div className="app">
      <h1>WARICAN 割り勘</h1>
      {error && (
        <div style={{ color: '#e74c3c', background: '#fdf0ef', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
          DB接続エラー: {error}
        </div>
      )}

      <div className="section">
        <h2>新しいプロジェクト</h2>
        <div className="row">
          <input
            type="text"
            placeholder="プロジェクト名（例: 旅行、飲み会）"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn-primary" onClick={createProject}>作成</button>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="section">
          <h2>プロジェクト一覧</h2>
          {projects.map(p => (
            <div key={p.id} className="project-item" onClick={() => onSelect(p)}>
              <span>{p.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="project-date">
                  {new Date(p.created_at).toLocaleDateString('ja-JP')}
                </span>
                <button className="btn-danger" onClick={e => deleteProject(e, p.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectList
