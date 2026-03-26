import { useState } from 'react'

function PaymentForm({ members, onAdd }) {
  const [payer, setPayer] = useState(members[0] || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [participants, setParticipants] = useState([...members])

  const toggleParticipant = (member) => {
    setParticipants(prev =>
      prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]
    )
  }

  const handleAdd = () => {
    const amt = parseInt(amount, 10)
    if (!payer || !amt || amt <= 0 || participants.length === 0) return
    onAdd({ payer, amount: amt, description: description.trim() || '支払い', participants })
    setAmount('')
    setDescription('')
    setParticipants([...members])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label>支払者</label>
        <select value={payer} onChange={e => setPayer(e.target.value)} style={{ marginTop: 4 }}>
          {members.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label>金額（円）</label>
        <input
          type="number"
          placeholder="例: 3000"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ marginTop: 4 }}
        />
      </div>
      <div>
        <label>内容（任意）</label>
        <input
          type="text"
          placeholder="例: ランチ代"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ marginTop: 4 }}
        />
      </div>
      <div>
        <label>割り勘メンバー</label>
        <div className="checkbox-group">
          {members.map(m => (
            <label key={m}>
              <input
                type="checkbox"
                checked={participants.includes(m)}
                onChange={() => toggleParticipant(m)}
              />
              {m}
            </label>
          ))}
        </div>
      </div>
      <button className="btn-primary" onClick={handleAdd}>支払いを追加</button>
    </div>
  )
}

export default PaymentForm
