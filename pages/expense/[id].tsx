import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

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

export default function ExpenseDetail() {
  const router = useRouter()
  const { id } = router.query
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchExpense = async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single()
      if (error) console.error(error)
      else setExpense(data)
      setLoading(false)
    }
    fetchExpense()
  }, [id])

  if (loading) return <p className="text-center mt-6">Loading...</p>
  if (!expense) return <p className="text-center mt-6 text-red-500">Expense not found.</p>

  return (
    <div className="max-w-3xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Expense Details</h1>
      <div className="space-y-2">
        <p><span className="font-semibold">Title:</span> {expense.title}</p>
        <p><span className="font-semibold">Description:</span> {expense.description || '-'}</p>
        <p><span className="font-semibold">Vendor:</span> {expense.vendor || '-'}</p>
        <p><span className="font-semibold">Date:</span> {expense.date || '-'}</p>
        <p><span className="font-semibold">Amount:</span> {expense.amount}</p>
        <p><span className="font-semibold">Status:</span> {expense.status}</p>
        <p><span className="font-semibold">User Email:</span> {expense.user_email || '-'}</p>
        <p><span className="font-semibold">Created At:</span> {expense.created_at || '-'}</p>
        <div>
          <span className="font-semibold">Receipt:</span>
          {expense.receipts_url ? (
            <img
              src={expense.receipts_url}
              alt="Receipt"
              className="mt-2 border rounded max-w-full"
            />
          ) : (
            <span> - </span>
          )}
        </div>
      </div>
      <button
        onClick={() => router.back()}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Back
      </button>
    </div>
  )
}
