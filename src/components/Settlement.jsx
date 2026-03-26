function calculateSettlement(members, payments) {
  const balance = {}
  members.forEach(m => (balance[m] = 0))

  payments.forEach(({ payer, amount, participants }) => {
    const share = amount / participants.length
    participants.forEach(p => (balance[p] -= share))
    balance[payer] += amount
  })

  const creditors = []
  const debtors = []
  Object.entries(balance).forEach(([name, amt]) => {
    if (amt > 0.5) creditors.push({ name, amount: amt })
    else if (amt < -0.5) debtors.push({ name, amount: -amt })
  })

  const transactions = []
  let i = 0, j = 0
  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i]
    const debt = debtors[j]
    const amt = Math.min(credit.amount, debt.amount)
    transactions.push({
      from: debt.name,
      to: credit.name,
      amount: Math.round(amt),
    })
    credit.amount -= amt
    debt.amount -= amt
    if (credit.amount < 0.5) i++
    if (debt.amount < 0.5) j++
  }

  return transactions
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
