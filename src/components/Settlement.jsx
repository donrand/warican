function calculateSettlement(members, payments) {
  // 通常支払い（支払者が参加者に含まれる）と肩代わり支払いに分離
  const regularPayments = payments.filter(p => p.participants.includes(p.payer))
  const coveredPayments = payments.filter(p => !p.participants.includes(p.payer))

  // 通常支払いのみで残高を計算
  const balance = {}
  members.forEach(m => (balance[m] = 0))
  regularPayments.forEach(({ payer, amount, participants }) => {
    const share = amount / participants.length
    participants.forEach(p => (balance[p] -= share))
    balance[payer] += amount
  })

  // 残高の多い順に並べて精算リストを作成
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

  // 肩代わり支払いを精算リストに反映
  coveredPayments.forEach(({ payer, amount, participants }) => {
    const share = amount / participants.length
    participants.forEach(covered => {
      // covered が payer に返す必要がある（share 分）
      // 通常精算で covered→payer の取引があれば増額
      const fwdIdx = transactions.findIndex(t => t.from === covered && t.to === payer)
      if (fwdIdx >= 0) {
        transactions[fwdIdx].amount += share
      } else {
        // payer→covered の取引があれば相殺・反転
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
          // 取引がない場合は直接追加
          transactions.push({ from: covered, to: payer, amount: share })
        }
      }
    })
  })

  return transactions
    .map(t => ({ ...t, amount: Math.round(t.amount) }))
    .filter(t => t.amount > 0)
}

function Settlement({ members, payments }) {
  const transactions = calculateSettlement(members, payments)

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ fontSize: '2rem' }}>🎉</div>
        <p style={{ fontWeight: 'bold', color: '#2c7be5', marginTop: 8 }}>精算完了！全員の残高が 0 円です</p>
      </div>
    )
  }

  return (
    <div>
      {transactions.map((t, idx) => (
        <div key={idx} className="settlement-item">
          <strong>{t.from}</strong> → <strong>{t.to}</strong> に{' '}
          <span className="amount">¥{t.amount.toLocaleString()}</span> 支払う
        </div>
      ))}
    </div>
  )
}

export default Settlement
