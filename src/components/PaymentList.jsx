function PaymentList({ payments, onRemove }) {
  return (
    <div>
      {payments.map(p => (
        <div key={p.id} className="payment-item">
          <div>
            <div>{p.description}</div>
            <div className="payment-info">
              {p.payer} が支払い ／ 対象: {p.participants.join('・')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="amount">¥{p.amount.toLocaleString()}</span>
            <button className="btn-danger" onClick={() => onRemove(p.id)}>削除</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PaymentList
