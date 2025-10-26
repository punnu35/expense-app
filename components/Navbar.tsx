import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  // Fetch session on load
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
        setIsAdmin(data.user.email === adminEmail)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    }
    fetchUser()

    // Listen to auth state changes
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setIsAdmin(session.user.email === adminEmail)
      } else {
        setUser(null)
        setIsAdmin(false)
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
      setUser(null)          // update state immediately
      setIsAdmin(false)
      window.location.href = '/login' // redirect to login
    }
  }

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex items-center gap-4">
        <Link href="/">Home</Link>
        {user && <Link href="/expenses">{isAdmin ? 'All Expenses' : 'My Expenses'}</Link>}
        {user && <Link href="/reports">Reports</Link>} {/* <-- Added Reports link */}
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
