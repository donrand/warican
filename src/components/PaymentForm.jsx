import { useState } from 'react'

const DESCRIPTION_SAMPLES = ['ランチ代', '夕食代', '飲み会', '交通費', 'カフェ代', '宿泊費', '買い物']

function PaymentForm({ members, onAdd }) {
  const [payer, setPayer] = useState(members[0] || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [participants, setParticipants] = useState([...members])
  const [amountError, setAmountError] = useState('')

  const toggleParticipant = (member) => {
    setParticipants(prev =>
      prev.includes(member) ? prev.filter(m => m !== member) : [...prev, member]
    )
  }

  const handleDescriptionClick = () => {
    if (!description) {
      const sample = DESCRIPTION_SAMPLES[Math.floor(Math.random() * DESCRIPTION_SAMPLES.length)]
      setDescription(sample)
    }
  }

  const handleAdd = () => {
    const amt = parseInt(amount, 10)
    if (!amt || amt <= 0) {
      setAmountError('金額を入力してください')
      return
    }
    if (participants.length === 0) return
    setAmountError('')
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
          onChange={e => { setAmount(e.target.value); setAmountError('') }}
          style={{ marginTop: 4, borderColor: amountError ? '#e74c3c' : '' }}
        />
        {amountError && (
          <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: 4 }}>{amountError}</p>
        )}
      </div>
      <div>
        <label>内容（任意）</label>
        <input
          type="text"
          placeholder="クリックでサンプル入力"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onClick={handleDescriptionClick}
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
