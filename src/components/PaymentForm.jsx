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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <span className="form-label">支払者</span>
        <div className="toggle-group">
          {members.map(m => (
            <button
              key={m}
              className={`toggle-btn ${payer === m ? 'payer-active' : ''}`}
              onClick={() => setPayer(m)}
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
          placeholder="例: 3000"
          value={amount}
          onChange={e => { setAmount(e.target.value); setAmountError('') }}
          style={{ borderColor: amountError ? '#e74c3c' : '' }}
        />
        {amountError && (
          <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: 6 }}>{amountError}</p>
        )}
      </div>

      <div>
        <span className="form-label">内容（任意）</span>
        <input
          type="text"
          placeholder="例: ランチ代"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div className="sample-tags">
          {DESCRIPTION_SAMPLES.map(sample => (
            <button
              key={sample}
              className="sample-tag"
              onClick={() => setDescription(sample)}
              style={{
                background: description === sample ? '#2c7be5' : '#f0f0f0',
                color: description === sample ? '#fff' : '#555',
              }}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="form-label">メンバー</span>
        <div className="toggle-group">
          {members.map(m => (
            <button
              key={m}
              className={`toggle-btn ${participants.includes(m) ? 'active' : ''}`}
              onClick={() => toggleParticipant(m)}
            >
              {participants.includes(m) ? '✓ ' : ''}{m}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={handleAdd} style={{ width: '100%' }}>
        支払いを追加
      </button>
    </div>
  )
}

export default PaymentForm
