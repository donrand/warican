import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import ProjectList from './components/ProjectList.jsx'
import MemberForm from './components/MemberForm.jsx'
import PaymentForm from './components/PaymentForm.jsx'
import PaymentList from './components/PaymentList.jsx'
import Settlement from './components/Settlement.jsx'
import './App.css'

function App() {
  const [currentProject, setCurrentProject] = useState(null)
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])

  useEffect(() => {
    if (currentProject) {
      loadMembers()
      loadPayments()
    }
  }, [currentProject])

  const loadMembers = async () => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('project_id', currentProject.id)
    setMembers(data?.map(m => m.name) || [])
  }

  const loadPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('project_id', currentProject.id)
      .order('created_at', { ascending: true })
    setPayments(data || [])
  }

  const addMember = async (name) => {
    if (name && !members.includes(name)) {
      await supabase.from('members').insert({ project_id: currentProject.id, name })
      await loadMembers()
    }
  }

  const removeMember = async (name) => {
    await supabase.from('members').delete()
      .eq('project_id', currentProject.id).eq('name', name)
    await loadMembers()
  }

  const addPayment = async (payment) => {
    await supabase.from('payments').insert({ project_id: currentProject.id, ...payment })
    await loadPayments()
  }

  const removePayment = async (id) => {
    await supabase.from('payments').delete().eq('id', id)
    await loadPayments()
  }

  if (!currentProject) {
    return <ProjectList onSelect={setCurrentProject} />
  }

  return (
    <div className="app">
      <div className="project-header">
        <button className="btn-back" onClick={() => setCurrentProject(null)}>← 一覧に戻る</button>
        <h1>{currentProject.name}</h1>
      </div>

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
