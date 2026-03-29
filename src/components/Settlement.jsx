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
                background: bal >= 0 ? '#e8f5e9' : '#fdecea',
                color: bal >= 0 ? '#2e7d32' : '#c62828',
                fontSize: '0.85rem',
              }}>
                {m}：{bal >= 0 ? '+' : ''}¥{bal.toLocaleString()}
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
        {showDetail ? '明細を閉じる' : '１円単位の明細を見る'}
      </button>

      {showDetail && (
        <div style={{ marginTop: 12 }}>
          {payments.map((p, idx) => {
            const n = p.participants.length
            const perPerson = Math.ceil(p.amount / n)
            const isCovered = !p.participants.includes(p.payer)
            return (
              <div key={idx} style={{
                background: '#fafafa',
                border: '1px solid #eee',
                borderRadius: 8,
                padding: '12px',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{p.description}</span>
                  <span className="amount">¥{p.amount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: 8 }}>
                  {p.payer} が立替{isCovered ? '（肩代わり）' : ''}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.participants.map(m => (
                    <div key={m} style={{
                      background: '#e8f0fe',
                      borderRadius: 12,
                      padding: '4px 10px',
                      fontSize: '0.85rem',
                    }}>
                      {m}：¥{perPerson.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Settlement
