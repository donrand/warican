import { useState } from 'react'

function roundedShare(amount, n, unit) {
  return Math.ceil(amount / n / unit) * unit
}

function calculateBalances(members, payments, roundingUnit = 1) {
  const balance = {}
  members.forEach(m => (balance[m] = 0))
  payments.forEach(({ payer, amount, participants }) => {
    const share = roundedShare(amount, participants.length, roundingUnit)
    const ceilTotal = share * participants.length
    participants.forEach(p => (balance[p] -= share))
    balance[payer] += ceilTotal
  })
  return balance
}

function calculateSettlement(members, payments, roundingUnit = 1) {
  const regularPayments = payments.filter(p => p.participants.includes(p.payer))
  const coveredPayments = payments.filter(p => !p.participants.includes(p.payer))

  const balance = {}
  members.forEach(m => (balance[m] = 0))
  regularPayments.forEach(({ payer, amount, participants }) => {
    const share = roundedShare(amount, participants.length, roundingUnit)
    const ceilTotal = share * participants.length
    participants.forEach(p => (balance[p] -= share))
    balance[payer] += ceilTotal
  })

  const creditors = []
  const debtors = []
  Object.entries(balance).forEach(([name, amt]) => {
    if (amt > 0.5) creditors.push({ name, amount: amt })
    else if (amt < -0.5) debtors.push({ name, amount: -amt })
  })
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transactions = []
  let ci = 0, di = 0
  while (ci < creditors.length && di < debtors.length) {
    const cr = creditors[ci]
    const db = debtors[di]
    const amt = Math.min(cr.amount, db.amount)
    transactions.push({ from: db.name, to: cr.name, amount: amt })
    cr.amount -= amt
    db.amount -= amt
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
            if (overpay > 0.5) {
              transactions.push({ from: covered, to: payer, amount: overpay })
            }
          }
        } else {
          transactions.push({ from: covered, to: payer, amount: share })
        }
      }
    })
  })

  return transactions
    .map(t => ({ ...t, amount: Math.round(t.amount) }))
    .filter(t => t.amount > 0)
}

function Settlement({ members, payments, roundingUnit = 1 }) {
  const [copied, setCopied] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const balances = calculateBalances(members, payments, roundingUnit)
  const transactions = calculateSettlement(members, payments, roundingUnit)
  const detailBalances = calculateBalances(members, payments, 1)
  const detailTransactions = calculateSettlement(members, payments, 1)

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
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 8 }}>残高サマリー</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {members.map(m => {
            const bal = Math.round(balances[m])
            return (
              <div key={m} style={{
                padding: '5px 12px',
                borderRadius: 20,
                background: bal > 0 ? '#fff8e1' : bal < 0 ? '#e8f0fe' : '#e8f5e9',
                color: bal > 0 ? '#e65100' : bal < 0 ? '#2c7be5' : '#2e7d32',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}>
                {bal > 0 ? `${m}：立替中 ¥${bal.toLocaleString()}` : bal < 0 ? `${m}：¥${Math.abs(bal).toLocaleString()} 支払う` : `${m}：精算済み`}
              </div>
            )
          })}
        </div>
      </div>

      {transactions.map((t, idx) => (
        <div key={idx} className="settlement-item">
          <strong>{t.from}</strong> → <strong>{t.to}</strong> に{' '}
          <span className="amount">¥{t.amount.toLocaleString()}</span> 支払う
        </div>
      ))}

      <button
        className="btn-primary"
        onClick={copyToClipboard}
        style={{ marginTop: 12, width: '100%' }}
      >
        {copied ? 'コピーしました！' : '精算結果をコピー'}
      </button>

      <button
        onClick={() => setShowDetail(s => !s)}
        style={{
          marginTop: 8, width: '100%',
          background: showDetail ? '#e8f0fe' : '#f0f0f0',
          color: showDetail ? '#2c7be5' : '#555',
          border: '1px solid ' + (showDetail ? '#2c7be5' : '#ddd'),
          borderRadius: 8, padding: '12px', cursor: 'pointer',
          fontSize: '0.95rem',
          minHeight: 48,
          whiteSpace: 'nowrap',
        }}
      >
        明細
      </button>

      {showDetail && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 10 }}>個人別 損得（１円単位）</p>
          {members.map(m => {
            const bal = Math.round(detailBalances[m])
            const isCreditor = bal > 0
            const isDebtor = bal < 0
            return (
              <div key={m} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                marginBottom: 8,
                borderRadius: 10,
                background: isCreditor ? '#fff8e1' : isDebtor ? '#f5f5f5' : '#e8f5e9',
                border: `1px solid ${isCreditor ? '#ffe082' : isDebtor ? '#e0e0e0' : '#a5d6a7'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{m}</span>
                  {isCreditor && (
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      background: '#ff6f00', color: '#fff',
                      borderRadius: 10, padding: '2px 8px',
                    }}>立替中・損</span>
                  )}
                  {isDebtor && (
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      background: '#90a4ae', color: '#fff',
                      borderRadius: 10, padding: '2px 8px',
                    }}>支払い待ち</span>
                  )}
                  {!isCreditor && !isDebtor && (
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      background: '#43a047', color: '#fff',
                      borderRadius: 10, padding: '2px 8px',
                    }}>精算済み</span>
                  )}
                </div>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: isCreditor ? '#e65100' : isDebtor ? '#555' : '#2e7d32',
                }}>
                  {isCreditor ? `−¥${bal.toLocaleString()}` : isDebtor ? `+¥${Math.abs(bal).toLocaleString()}` : '¥0'}
                </span>
              </div>
            )
          })}
          <p style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 6 }}>
            −：立替中（受け取り待ち）／ +：支払い予定
          </p>
        </div>
      )}
    </div>
  )
}

export default Settlement
