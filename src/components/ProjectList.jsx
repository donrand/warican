import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function ProjectList({ onSelect }) {
  const [projects, setProjects] = useState([])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    setProjects(data || [])
  }

  const createProject = async () => {
    const name = newName.trim()
    if (!name) return
    const { data } = await supabase
      .from('projects')
      .insert({ name })
      .select()
      .single()
    setNewName('')
    if (data) onSelect(data)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') createProject()
  }

  return (
    <div className="app">
      <h1>WARICAN 割り勘</h1>

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
              <span className="project-date">
                {new Date(p.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectList
