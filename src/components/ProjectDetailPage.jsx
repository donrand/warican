import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import MemberForm from './MemberForm.jsx'
import PaymentForm from './PaymentForm.jsx'
import PaymentList from './PaymentList.jsx'
import Settlement from './Settlement.jsx'

function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [payments, setPayments] = useState([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadProject()
  }, [id])

  const loadProject = async () => {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single()
    if (!data) { setNotFound(true); return }
    setProject(data)
    loadMembers(data.id)
    loadPayments(data.id)
  }

  const loadMembers = async (projectId) => {
    const { data } = await supabase.from('members').select('*').eq('project_id', projectId)
    setMembers(data?.map(m => m.name) || [])
  }

  const loadPayments = async (projectId) => {
    const { data } = await supabase
      .from('payments').select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    setPayments(data || [])
  }

  const addMember = async (name) => {
    if (name && !members.includes(name)) {
      await supabase.from('members').insert({ project_id: id, name })
      await loadMembers(id)
    }
  }

  const removeMember = async (name) => {
    await supabase.from('members').delete().eq('project_id', id).eq('name', name)
    await loadMembers(id)
  }

  const addPayment = async (payment) => {
    await supabase.from('payments').insert({ project_id: id, ...payment })
    await loadPayments(id)
  }

  const removePayment = async (paymentId) => {
    await supabase.from('payments').delete().eq('id', paymentId)
    await loadPayments(id)
  }

  const updatePayment = async (paymentId, updates) => {
    await supabase.from('payments').update(updates).eq('id', paymentId)
    await loadPayments(id)
  }

  const completeProject = async () => {
    if (!window.confirm('このプロジェクトを完了にしますか？')) return
    await supabase.from('projects').update({ completed: true }).eq('id', id)
    setProject({ ...project, completed: true })
  }

  if (notFound) {
    return (
      <div className="app">
        <p style={{ color: '#e74c3c' }}>プロジェクトが見つかりません。</p>
        <button className="btn-back" onClick={() => navigate('/')}>← 一覧に戻る</button>
      </div>
    )
  }

  if (!project) return <div className="app">読み込み中...</div>

  const roundingUnit = project.rounding_unit || 1

  return (
    <div className="app">
      <div className="project-header">
        <button className="btn-back" onClick={() => navigate('/')}>← 一覧に戻る</button>
        <h1>{project.name}</h1>
        {roundingUnit > 1 && (
          <span style={{ fontSize: '0.8rem', color: '#888', background: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>
            {roundingUnit}円単位
          </span>
        )}
        {!project.completed ? (
          <button onClick={completeProject} style={{
            marginLeft: 'auto', background: '#e8f5e9', color: '#2e7d32',
            border: '1px solid #a5d6a7', borderRadius: 4, padding: '6px 12px',
            fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>完了にする</button>
        ) : (
          <span style={{
            marginLeft: 'auto', background: '#e8f5e9', color: '#2e7d32',
            border: '1px solid #a5d6a7', borderRadius: 4, padding: '6px 12px',
            fontSize: '0.85rem', whiteSpace: 'nowrap',
          }}>完了済み</span>
        )}
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
            <PaymentList payments={payments} members={members} onRemove={removePayment} onUpdate={updatePayment} />
          </div>
          <div className="section">
            <h2>精算結果</h2>
            <Settlement members={members} payments={payments} roundingUnit={roundingUnit} />
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectDetailPage
