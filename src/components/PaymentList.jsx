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
            <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <span className="form-label">支払者</span>
                  <div className="toggle-group">
                    {members.map(m => (
                      <button
                        key={m}
                        className={`toggle-btn ${editForm.payer === m ? 'payer-active' : ''}`}
                        onClick={() => setEditForm(f => ({ ...f, payer: m }))}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="form-label">金額（円）</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editForm.amount}
                    onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <span className="form-label">内容</span>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <span className="form-label">割り勘メンバー</span>
                  <div className="toggle-group">
                    {members.map(m => (
                      <button
                        key={m}
                        className={`toggle-btn ${editForm.participants.includes(m) ? 'active' : ''}`}
                        onClick={() => toggleParticipant(m)}
                      >
                        {editForm.participants.includes(m) ? '✓ ' : ''}{m}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={saveEdit} style={{ flex: 1 }}>保存</button>
                  <button className="btn-cancel" onClick={cancelEdit}>キャンセル</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="payment-item">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500 }}>{p.description}</div>
                <div className="payment-info">
                  {p.payer} が支払い ／ 対象: {p.participants.join('・')}
                </div>
              </div>
              <div className="payment-actions">
                <span className="amount">¥{p.amount.toLocaleString()}</span>
                <button className="btn-edit" onClick={() => startEdit(p)}>編集</button>
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
