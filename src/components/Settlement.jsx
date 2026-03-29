import { useState, useMemo } from 'react'

function roundedShare(amount, n, unit) {
  return Math.ceil(amount / n / unit) * unit
}

function calculateBalances(members, payments, roundingUnit) {
  const balance = {}
  members.forEach(m => (balance[m] = 0))
  payments.forEach(({ payer, amount, participants }) => {
    const share = roundedShare(amount, participants.length, roundingUnit)
    participants.forEach(p => (balance[p] -= share))
    balance[payer] += share * participants.length
  })
  return balance
}

function calculateSettlement(members, payments, roundingUnit) {
  const regularPayments = payments.filter(p => p.participants.includes(p.payer))
  const coveredPayments = payments.filter(p => !p.participants.includes(p.payer))

  const balance = {}
  members.forEach(m => (balance[m] = 0))
  regularPayments.forEach(({ payer, amount, participants }) => {
    const share = roundedShare(amount, participants.length, roundingUnit)
    participants.forEach(p => (balance[p] -= share))
    balance[payer] += share * participants.length
  })

  const creditors = [], debtors = []
  Object.entries(balance).forEach(([name, amt]) => {
    if (amt > 0.5) creditors.push({ name, amount: amt })
    else if (amt < -0.5) debtors.push({ name, amount: -amt })
  })
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transactions = []
  let ci = 0, di = 0
  while (ci < creditors.length && di < debtors.length) {
    const cr = creditors[ci], db = debtors[di]
    const amt = Math.min(cr.amount, db.amount)
    transactions.push({ from: db.name, to: cr.name, amount: amt })
    cr.amount -= amt; db.amount -= amt
    if (cr.amount < 0.5) ci++
    if (db.amount < 0.5) di++
  }

  coveredPayments.forEach(({ payer, amount, participants }) => {
    const share = roundedShare(amount, participants.length, roundingUnit)
    participants.forEach(covered => {
      const fwdIdx = transactions.findIndex(t => t.from === covered && t.to === payer)
      if (fwdIdx >= 0) {
        transactions[fwdIdx].amount += share
      } else {
        const revIdx = transactions.findIndex(t => t.from === payer && t.to === covered)
        if (revIdx >= 0) {
          const t = transactions[revIdx]
          if (t.amount > share + 0.5) {
            t.amount -= share
          } else {
            const overpay = share - t.amount
            transactions.splice(revIdx, 1)
            if (overpay > 0.5) transactions.push({ from: covered, to: payer, amount: overpay })
          }
        } else {
          transactions.push({ from: covered, to: payer, amount: share })
        }
      }
    })
  })

  return transactions.map(t => ({ ...t, amount: Math.round(t.amount) })).filter(t => t.amount > 0)
}

function Settlement({ members, payments, roundingUnit = 1 }) {
  const [copied, setCopied] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const balances = useMemo(() => calculateBalances(members, payments, roundingUnit), [members, payments, roundingUnit])
  const transactions = useMemo(() => calculateSettlement(members, payments, roundingUnit), [members, payments, roundingUnit])
  const detailBalances = useMemo(() => calculateBalances(members, payments, 1), [members, payments])

  const copyToClipboard = () => {
    const text = transactions
      .map(t => `${t.from} → ${t.to} に ¥${t.amount.toLocaleString()} 支払う`)
      .join('\n')
    navigator.clipboard.writeText(`精算結果\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (transactions.length === 0 && payments.length > 0) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ fontSize: '2rem' }}>🎉</div>
        <p style={{ fontWeight: 'bold', color: '#2c7be5', marginTop: 8 }}>精算完了！全員の残高が 0 円です</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {members.map(m => {
          const bal = Math.round(balances[m])
          return (
            <div key={m} style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.85rem',
              fontWeight: 500,
              background: bal > 0 ? '#fff3e0' : bal < 0 ? '#f0f4ff' : '#f0f0f0',
              color: bal > 0 ? '#c75000' : bal < 0 ? '#2c7be5' : '#888',
              border: `1px solid ${bal > 0 ? '#ffd59e' : bal < 0 ? '#c3d4f8' : '#e0e0e0'}`,
            }}>
              {bal > 0 ? `${m}：立替中 ¥${bal.toLocaleString()}` : bal < 0 ? `${m}：¥${Math.abs(bal).toLocaleString()} 支払う` : `${m}：¥0`}
            </div>
          )
        })}
      </div>

      {transactions.map((t, idx) => (
        <div key={idx} className="settlement-item">
          <span>{t.from}</span>
          <span style={{ color: '#aaa', margin: '0 6px' }}>→</span>
          <span>{t.to}</span>
          <span style={{ color: '#aaa', margin: '0 6px' }}>に</span>
          <span className="amount">¥{t.amount.toLocaleString()}</span>
          <span style={{ color: '#888', marginLeft: 4, fontSize: '0.9rem' }}>支払う</span>
        </div>
      ))}

      <button className="btn-primary" onClick={copyToClipboard} style={{ marginTop: 12, width: '100%' }}>
        {copied ? 'コピーしました！' : '精算結果をコピー'}
      </button>

      <button onClick={() => setShowDetail(s => !s)} className="btn-outline" style={{ marginTop: 8, width: '100%' }}>
        明細
      </button>

      {showDetail && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: 10 }}>個人別 損得（１円単位）</p>
          {members.map(m => {
            const bal = Math.round(detailBalances[m])
            const isCreditor = bal > 0
            return (
              <div key={m} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                marginBottom: 8,
                borderRadius: 10,
                background: isCreditor ? '#fff3e0' : '#f8f8f8',
                border: `1px solid ${isCreditor ? '#ffd59e' : '#ebebeb'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{m}</span>
                  {isCreditor && (
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      background: '#c75000', color: '#fff',
                      borderRadius: 10, padding: '2px 8px',
                    }}>立替中</span>
                  )}
                </div>
                <span style={{ fontWeight: 700, color: isCreditor ? '#c75000' : '#555' }}>
                  {isCreditor ? `−¥${bal.toLocaleString()}` : bal < 0 ? `+¥${Math.abs(bal).toLocaleString()}` : '¥0'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Settlement
