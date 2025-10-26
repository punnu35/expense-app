import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Expense {
  id: string
  title: string
  description?: string
  vendor?: string
  amount: number
  date?: string
  receipts_url?: string
  status: string
  created_at?: string
  user_email?: string
  user_id: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense; direction: 'asc' | 'desc' } | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editVendor, setEditVendor] = useState('')
  const [editAmount, setEditAmount] = useState<number>(0)
  const [editDate, setEditDate] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) window.location.href = '/login'
      else {
        setUser(userData.user)
        setIsAdmin(userData.user.email === adminEmail)

        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) console.error(error)
        else {
          if (userData.user.email === adminEmail) setExpenses(data || [])
          else setExpenses((data || []).filter(e => e.user_id === userData.user.id))
        }
      }
    }
    fetchExpenses()
  }, [])

  // Sorting logic
  const sortedExpenses = [...expenses]
  if (sortConfig !== null) {
    sortedExpenses.sort((a, b) => {
      let aValue = a[sortConfig.key] ?? ''
      let bValue = b[sortConfig.key] ?? ''

      if (sortConfig.key === 'amount') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const requestSort = (key: keyof Expense) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // --------------------
  // Inline edit
  // --------------------
  const startEdit = (exp: Expense) => {
    setEditingId(exp.id)
    setEditTitle(exp.title)
    setEditDescription(exp.description || '')
    setEditVendor(exp.vendor || '')
    setEditAmount(exp.amount)
    setEditDate(exp.date || '')
    setEditFile(null)
  }

  const saveEdit = async (exp: Expense) => {
    let updatedData: Partial<Expense> = {
      title: editTitle,
      description: editDescription || null,
      vendor: editVendor || null,
      amount: editAmount,
      date: editDate || null
    }

    if (editFile) {
      const fileExt = editFile.name.split('.').pop()
      const fileName = `${exp.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, editFile, { upsert: true })
      if (uploadError) {
        alert(uploadError.message)
        return
      }
      const { data } = supabase.storage.from('receipts').getPublicUrl(fileName)
      updatedData.receipts_url = data.publicUrl
    }

    const { error } = await supabase
      .from('expenses')
      .update(updatedData)
      .eq('id', exp.id)

    if (error) alert(error.message)
    else {
      setExpenses(prev => prev.map(e => (e.id === exp.id ? { ...e, ...updatedData } : e)))
      setEditingId(null)
      setEditFile(null)
    }
  }

  // --------------------
  // Admin Mark as Paid
  // --------------------
  const markAsPaid = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .update({ status: 'paid' })
      .eq('id', id)
    if (error) alert(error.message)
    else setExpenses(prev => prev.map(exp => (exp.id === id ? { ...exp, status: 'paid' } : exp)))
  }

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">{isAdmin ? 'All Expenses' : 'My Expenses'}</h1>

      {expenses.length === 0 ? (
        <p className="text-gray-500">No expenses found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort('title')}>
                Title {sortConfig?.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort('description')}>
                Description {sortConfig?.key === 'description' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort('vendor')}>
                Vendor {sortConfig?.key === 'vendor' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort('date')}>
                Date {sortConfig?.key === 'date' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort('amount')}>
                Amount {sortConfig?.key === 'amount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="border px-4 py-2">Receipt</th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort('status')}>
                Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort('user_email')}>
                User Email {sortConfig?.key === 'user_email' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map(exp => {
              const canEdit = (isAdmin || exp.user_id === user?.id) && exp.status !== 'paid'

              return (
                <tr key={exp.id} className="hover:bg-gray-50 align-top">
                  <td className="border px-4 py-2">{editingId === exp.id && canEdit ? <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="border rounded px-2 py-1 w-full" /> : exp.title}</td>
                  <td className="border px-4 py-2">{editingId === exp.id && canEdit ? <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} className="border rounded px-2 py-1 w-full" /> : exp.description || '-'}</td>
                  <td className="border px-4 py-2">{editingId === exp.id && canEdit ? <input type="text" value={editVendor} onChange={e => setEditVendor(e.target.value)} className="border rounded px-2 py-1 w-full" /> : exp.vendor || '-'}</td>
                  <td className="border px-4 py-2">{editingId === exp.id && canEdit ? <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="border rounded px-2 py-1 w-full" /> : exp.date || '-'}</td>
                  <td className="border px-4 py-2">{editingId === exp.id && canEdit ? <input type="number" value={editAmount} onChange={e => setEditAmount(Number(e.target.value))} className="border rounded px-2 py-1 w-full" /> : exp.amount}</td>
                  <td className="border px-4 py-2">{editingId === exp.id && canEdit ? <input type="file" accept="image/*" onChange={e => setEditFile(e.target.files ? e.target.files[0] : null)} /> : exp.receipts_url ? <a href={exp.receipts_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a> : '-'}</td>
                  <td className="border px-4 py-2">{exp.status}</td>
                  <td className="border px-4 py-2">{exp.user_email || '-'}</td>
                  <td className="border px-4 py-2 flex flex-col gap-2">
                    {exp.status !== 'paid' && isAdmin && (
                      <button onClick={() => markAsPaid(exp.id)} className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Mark as Paid</button>
                    )}
                    {canEdit && (editingId === exp.id ? (
                      <button onClick={() => saveEdit(exp)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Save</button>
                    ) : (
                      <button onClick={() => startEdit(exp)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">Edit</button>
                    ))}
                    <a href={`/expense/${exp.id}`} className="text-blue-600 underline mt-1">View Details</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
