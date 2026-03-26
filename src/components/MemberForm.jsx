import { useState } from 'react'

function MemberForm({ members, onAdd, onRemove }) {
  const [name, setName] = useState('')

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setName('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div>
      <div className="row">
        <input
          type="text"
          placeholder="名前を入力"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-primary" onClick={handleAdd}>追加</button>
      </div>
      <div className="tag-list">
        {members.map(m => (
          <div key={m} className="tag">
            {m}
            <button className="btn-danger" onClick={() => onRemove(m)}>×</button>
          </div>
        ))}
      </div>
      {members.length < 2 && (
        <p className="no-data" style={{ marginTop: 8 }}>2人以上登録すると支払い入力ができます</p>
      )}
    </div>
  )
}

export default MemberForm
