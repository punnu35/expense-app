import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

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

interface User {
  id: string
  email: string
}

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  const [filters, setFilters] = useState({
    status: '',
    vendor: '',
    user_email: '',
    startDate: '',
    endDate: ''
  })

  // Fetch user, expenses, and all users if admin
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return window.location.href = '/login'
      setUser(userData.user)
      setIsAdmin(userData.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL)

      // Fetch expenses
      const { data: expenseData, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: true })
      if (!error) setExpenses(expenseData || [])

      // Fetch all users for admin dropdown
      if (userData.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        const { data: expenseUsers, error: usersError } = await supabase
         .from('expenses')
        .select('user_email')
      if (!usersError && expenseUsers) {
        const uniqueUsers = Array.from(new Set(expenseUsers.map(e => e.user_email))).filter(Boolean)
        setUsers(uniqueUsers.map((email, idx) => ({ id: String(idx), email })))
      }
}

    }

    fetchData()
  }, [])

  // Filter expenses based on selected filters
  useEffect(() => {
    let filtered = [...expenses]

    if (filters.status) filtered = filtered.filter(e => e.status === filters.status)
    if (filters.vendor) filtered = filtered.filter(e => e.vendor?.toLowerCase().includes(filters.vendor.toLowerCase()))
    if (filters.user_email) filtered = filtered.filter(e => e.user_email === filters.user_email)
    if (filters.startDate) filtered = filtered.filter(e => e.date && e.date >= filters.startDate)
    if (filters.endDate) filtered = filtered.filter(e => e.date && e.date <= filters.endDate)

    setFilteredExpenses(filtered)
  }, [filters, expenses])

  // Prepare chart data
  const chartData = filteredExpenses
    .filter(e => e.date)
    .map(e => ({ date: e.date!, amount: e.amount }))

  return (
    <div className="max-w-5xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Expense Reports</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>

        <input
          type="text"
          placeholder="Vendor"
          value={filters.vendor}
          onChange={e => setFilters(f => ({ ...f, vendor: e.target.value }))}
          className="border rounded px-3 py-2 w-full"
        />

        {/* User filter: dropdown for admin, text input for normal user */}
        {isAdmin ? (
          <select
            value={filters.user_email}
            onChange={e => setFilters(f => ({ ...f, user_email: e.target.value }))}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">All Users</option>
            {users.map(u => (
              <option key={u.id} value={u.email}>{u.email}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="User Email"
            value={filters.user_email}
            onChange={e => setFilters(f => ({ ...f, user_email: e.target.value }))}
            className="border rounded px-3 py-2 w-full"
          />
        )}

        <input
          type="date"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
          className="border rounded px-3 py-2 w-full"
        />

        <input
          type="date"
          placeholder="End Date"
          value={filters.endDate}
          onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <p className="text-gray-500">No data to display.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
