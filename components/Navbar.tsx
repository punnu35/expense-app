import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isApprover, setIsApprover] = useState(false)

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const approverEmail = process.env.NEXT_PUBLIC_APPROVER_EMAIL

  // Fetch session on load
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
        setIsAdmin(data.user.email === adminEmail)
        setIsApprover(data.user.email === approverEmail)
      } else {
        setUser(null)
        setIsAdmin(false)
        setIsApprover(false)
      }
    }
    fetchUser()

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setIsAdmin(session.user.email === adminEmail)
        setIsApprover(session.user.email === approverEmail)
      } else {
        setUser(null)
        setIsAdmin(false)
        setIsApprover(false)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error.message)
    } else {
      setUser(null)
      setIsAdmin(false)
      setIsApprover(false)
      window.location.href = '/login'
    }
  }

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex items-center gap-4">
        <Link href="/">Home</Link>
        {user && <Link href="/expenses">{isAdmin ? 'All Expenses' : 'My Expenses'}</Link>}
        {(isAdmin || isApprover) && <Link href="/approvals">Approvals</Link>}
        {user && <Link href="/reports">Reports</Link>}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span>{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  )
}
