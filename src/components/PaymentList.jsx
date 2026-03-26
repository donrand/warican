import { useState } from 'react'

function PaymentList({ payments, members, onRemove, onUpdate }) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditForm({
      payer: p.payer,
      amount: p.amount,
      description: p.description,
      participants: [...p.participants],
    })
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = () => {
    const amt = parseInt(editForm.amount, 10)
    if (!amt || amt <= 0 || editForm.participants.length === 0) return
    onUpdate(editingId, {
      payer: editForm.payer,
      amount: amt,
      description: editForm.description || '支払い',
      participants: editForm.participants,
    })
    setEditingId(null)
  }

  const toggleParticipant = (member) => {
    setEditForm(prev => ({
      ...prev,
      participants: prev.participants.includes(member)
        ? prev.participants.filter(m => m !== member)
        : [...prev.participants, member],
    }))
  }

  return (
    <div>
      {payments.map(p => (
        <div key={p.id}>
          {editingId === p.id ? (
            <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label>支払者</label>
                  <select value={editForm.payer} onChange={e => setEditForm(f => ({ ...f, payer: e.target.value }))} style={{ marginTop: 4 }}>
                    {members.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label>金額（円）</label>
                  <input type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <label>内容</label>
                  <input type="text" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <label>割り勘メンバー</label>
                  <div className="checkbox-group">
                    {members.map(m => (
                      <label key={m}>
                        <input type="checkbox" checked={editForm.participants.includes(m)} onChange={() => toggleParticipant(m)} />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={saveEdit}>保存</button>
                  <button onClick={cancelEdit} style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>キャンセル</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="payment-item">
              <div>
                <div>{p.description}</div>
                <div className="payment-info">
                  {p.payer} が支払い ／ 対象: {p.participants.join('・')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="amount">¥{p.amount.toLocaleString()}</span>
                <button onClick={() => startEdit(p)} style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>編集</button>
                <button className="btn-danger" onClick={() => onRemove(p.id)}>削除</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default PaymentList
