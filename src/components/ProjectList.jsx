import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [newName, setNewName] = useState('')
  const [roundingUnit, setRoundingUnit] = useState(1)
  const [error, setError] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects').select('*').order('created_at', { ascending: false })
    if (error) { setError(error.message); return }
    setProjects(data || [])
  }

  const createProject = async () => {
    const name = newName.trim()
    if (!name) return
    const { data, error } = await supabase
      .from('projects').insert({ name, rounding_unit: roundingUnit }).select().single()
    if (error) { setError(error.message); return }
    setNewName('')
    setRoundingUnit(1)
    if (data) navigate(`/project/${data.id}`)
  }

  const deleteProject = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('このプロジェクトを削除しますか？')) return
    await supabase.from('projects').delete().eq('id', id)
    await loadProjects()
  }

  const copyUrl = (e, id) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/project/${id}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
            <div key={p.id} className="project-item" onClick={() => navigate(`/project/${p.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{p.name}</span>
                {p.completed && (
                  <span style={{ fontSize: '0.75rem', background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 20 }}>完了</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="project-date">{new Date(p.created_at).toLocaleDateString('ja-JP')}</span>
                <button
                  onClick={e => copyUrl(e, p.id)}
                  style={{ background: copiedId === p.id ? '#e8f5e9' : '#f0f0f0', color: copiedId === p.id ? '#2e7d32' : '#555', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {copiedId === p.id ? 'コピー済み' : 'URL'}
                </button>
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
