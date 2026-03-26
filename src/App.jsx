import { useState } from 'react'
import MemberForm from './components/MemberForm.jsx'
import PaymentForm from './components/PaymentForm.jsx'
import PaymentList from './components/PaymentList.jsx'
import Settlement from './components/Settlement.jsx'
import './App.css'

function App() {
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])

  const addMember = (name) => {
    if (name && !members.includes(name)) {
      setMembers([...members, name])
    }
  }

  const removeMember = (name) => {
    setMembers(members.filter(m => m !== name))
    setPayments(payments.filter(p => p.payer !== name))
  }

  const addPayment = (payment) => {
    setPayments([...payments, { ...payment, id: Date.now() }])
  }

  const removePayment = (id) => {
    setPayments(payments.filter(p => p.id !== id))
  }

  return (
    <div className="app">
      <h1>WARICAN 割り勘</h1>

      <div className="section">
        <h2>メンバー登録</h2>
        <MemberForm members={members} onAdd={addMember} onRemove={removeMember} />
      </div>

      {members.length >= 2 && (
        <div className="section">
          <h2>支払い入力</h2>
          <PaymentForm members={members} onAdd={addPayment} />
        </div>
      )}

      {payments.length > 0 && (
        <>
          <div className="section">
            <h2>支払い一覧</h2>
            <PaymentList payments={payments} onRemove={removePayment} />
          </div>
          <div className="section">
            <h2>精算結果</h2>
            <Settlement members={members} payments={payments} />
          </div>
        </>
      )}
    </div>
  )
}

export default App
