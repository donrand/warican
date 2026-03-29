import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

function ProjectSettings({ project, onUpdate }) {
  const [name, setName] = useState(project.name)
  const [roundingUnit, setRoundingUnit] = useState(project.rounding_unit || 1)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await supabase
      .from('projects')
      .update({ name: name.trim() || project.name, rounding_unit: roundingUnit })
      .eq('id', project.id)
    onUpdate({ ...project, name: name.trim() || project.name, rounding_unit: roundingUnit })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleComplete = async () => {
    if (!window.confirm('このプロジェクトを完了にしますか？')) return
    await supabase.from('projects').update({ completed: true }).eq('id', project.id)
    onUpdate({ ...project, completed: true })
  }

  const handleReopen = async () => {
    if (!window.confirm('このプロジェクトを再開しますか？')) return
    await supabase.from('projects').update({ completed: false }).eq('id', project.id)
    onUpdate({ ...project, completed: false })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div>
        <label>プロジェクト名</label>
        <div className="row" style={{ marginTop: 4 }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label>端数処理</label>
        <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
          {[1, 10, 100].map(unit => (
            <label key={unit} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="rounding_unit"
                value={unit}
                checked={roundingUnit === unit}
                onChange={() => setRoundingUnit(unit)}
              />
              {unit === 1 ? '切り捨てなし' : `${unit}円単位`}
            </label>
          ))}
        </div>
        {roundingUnit > 1 && (
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 6 }}>
            割り勘の端数を切り捨て、余った分は支払者に還元されます
          </p>
        )}
      </div>

      <button
        className="btn-primary"
        onClick={handleSave}
        style={{ background: saved ? '#2e7d32' : '' }}
      >
        {saved ? '保存しました！' : '設定を保存'}
      </button>

      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
        <label>ステータス</label>
        <div style={{ marginTop: 8 }}>
          {!project.completed ? (
            <button onClick={handleComplete} style={{
              background: '#e8f5e9', color: '#2e7d32',
              border: '1px solid #a5d6a7', borderRadius: 4,
              padding: '8px 16px', cursor: 'pointer', fontSize: '0.9rem',
            }}>
              完了にする
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                background: '#e8f5e9', color: '#2e7d32',
                border: '1px solid #a5d6a7', borderRadius: 4,
                padding: '8px 16px', fontSize: '0.9rem',
              }}>完了済み</span>
              <button onClick={handleReopen} style={{
                background: '#f0f0f0', color: '#555',
                border: 'none', borderRadius: 4,
                padding: '8px 16px', cursor: 'pointer', fontSize: '0.9rem',
              }}>再開する</button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default ProjectSettings
