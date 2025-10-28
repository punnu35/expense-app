import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Expense {
  id: string
  title: string
  description?: string
  vendor?: string
  amount: number
  date?: string
  receipts_url?: string[]
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'closed'
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
  const [editFiles, setEditFiles] = useState<FileList | null>(null)

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
        console.log(data)
          if (error) console.error(error)
        
        else {
          if (userData.user.email === adminEmail) setExpenses(data || [])
          else setExpenses((data || []).filter(e => e.user_id === userData.user.id))
        }
      }
    }
    fetchExpenses()
  }, [])

  // --------------------
  // Sorting
  // --------------------
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
  // Inline edit logic
  // --------------------
  const startEdit = (exp: Expense) => {
    if (exp.user_id !== user?.id && !isAdmin) return
    if (exp.status !== 'pending' && exp.status !== 'rejected' && !isAdmin) {
      alert('You can only edit pending or rejected expenses.')
      return
    }

    setEditingId(exp.id)
    setEditTitle(exp.title)
    setEditDescription(exp.description || '')
    setEditVendor(exp.vendor || '')
    setEditAmount(exp.amount)
    setEditDate(exp.date || '')
    setEditFiles(null)
  }

  const saveEdit = async (exp: Expense) => {
    let newStatus = exp.status
    // If a rejected expense is edited, mark it as pending again
    if (exp.status === 'rejected') newStatus = 'pending'
    let updatedUrls = exp.receipts_url || []
    if (editFiles && editFiles.length > 0) {
      const uploadedUrls: string[] = []
      for (let i = 0; i < editFiles.length; i++) {
        const file = editFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${exp.id}_${Date.now()}_${i}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file, { upsert: true })
        if (uploadError) {
          alert(uploadError.message)
          return
        }
        const { data } = supabase.storage.from('receipts').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }
      updatedUrls = [...updatedUrls, ...uploadedUrls]
    }
    let updatedData: Partial<Expense> = {
      title: editTitle,
      description: editDescription || undefined,
      vendor: editVendor || undefined,
      amount: editAmount,
      date: editDate || undefined,
      status: newStatus,
      receipts_url: updatedUrls
    }
    const { error } = await supabase
      .from('expenses')
      .update(updatedData)
      .eq('id', exp.id)

    if (error) alert(error.message)
    else {
      setExpenses(prev =>
        prev.map(e => (e.id === exp.id ? { ...e, ...updatedData } : e))
      )
      setEditingId(null)
      setEditFiles(null)
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
        <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort('title')}>Title {sortConfig?.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Vendor</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Receipts</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">User Email</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map(exp => {
              const canEdit =
                (exp.user_id === user?.id && (exp.status === 'pending' || exp.status === 'rejected')) ||
                isAdmin

              return (
                <tr key={exp.id} className="hover:bg-gray-50 align-top">
                  <td className="border px-4 py-2">
                    {editingId === exp.id && canEdit ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      exp.title
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingId === exp.id && canEdit ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      exp.description || '-'
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingId === exp.id && canEdit ? (
                      <input
                        type="text"
                        value={editVendor}
                        onChange={e => setEditVendor(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      exp.vendor || '-'
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingId === exp.id && canEdit ? (
                      <input
                        type="date"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      exp.date || '-'
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingId === exp.id && canEdit ? (
                      <input
                        type="number"
                        value={editAmount}
                        onChange={e => setEditAmount(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      exp.amount
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingId === exp.id && canEdit ? (
                      <input type="file" multiple accept="image/*" onChange={e => setEditFiles(e.target.files)} />
                    ) : exp.receipts_url && exp.receipts_url.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {exp.receipts_url.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View {i + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border px-4 py-2">{exp.status}</td>
                  <td className="border px-4 py-2">{exp.user_email || '-'}</td>
                  <td className="border px-4 py-2 flex flex-col gap-2">
                      {isAdmin ? (
                        exp.status === 'approved' ? (
                          <button
                          onClick={() => markAsPaid(exp.id)}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                          Mark as Paid
                          </button>
                        ) : (
                          <span className={`font-bold ${exp.status === 'pending' ? 'text-yellow-600' : exp.status === 'rejected' ? 'text-red-600' : 'text-green-600'}`}>
  {exp.status}
</span>
                        )
                    ) : null}


                    {canEdit && (
                      editingId === exp.id ? (
                        <button
                          onClick={() => saveEdit(exp)}
                          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(exp)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      )
                    )}

                    <a href={`/expense/${exp.id}`} className="text-blue-600 underline mt-1">
                      View Details
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
  