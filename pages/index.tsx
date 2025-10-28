import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function IndexPage() {
  const [user, setUser] = useState<any>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newVendor, setNewVendor] = useState('')
  const [newAmount, setNewAmount] = useState<number>(0)
  const [newDate, setNewDate] = useState('')
  const [newFiles, setNewFiles] = useState<FileList | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) window.location.href = '/login'
      else setUser(userData.user)
    }
    fetchUser()
  }, [])

  const addExpense = async () => {
    if (!newTitle || !newAmount || !newFiles || newFiles.length === 0)   {
      alert('Title, amount and receipt are required.')
      return
    }

    let publicUrl = null
    const uploadedUrls: string[] = []
    for (const file of Array.from(newFiles)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (uploadError) {
        alert(`Error uploading ${file.name}: ${uploadError.message}`)
        return
      }
      const { data } = supabase.storage.from('receipts').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }

    const { error, data } = await supabase
      .from('expenses')
      .insert([
        {
          title: newTitle,
          description: newDescription || null,
          vendor: newVendor || null,
          amount: newAmount,
          date: newDate || null,
          receipts_url: uploadedUrls,
          status: 'pending',
          user_id: user.id,
          user_email: user.email
        }
      ])
      .select()

    if (error) alert(error.message)
    else {
      setNewTitle('')
      setNewDescription('')
      setNewVendor('')
      setNewAmount(0)
      setNewDate('')
      setNewFiles(null)
      alert('Expense added!')
      window.location.href = '/expenses'
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Add New Expense</h1>
     <div className="flex flex-col gap-2">
  <div className="flex items-center gap-2">
    <label className="w-32 font-medium">Title:</label>
    <input
      type="text"
      value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}
      className="border rounded px-2 py-1 flex-1"
    />
  </div>

  <div className="flex items-center gap-2">
    <label className="w-32 font-medium">Description:</label>
    <input
      type="text"
      value={newDescription}
      onChange={(e) => setNewDescription(e.target.value)}
      className="border rounded px-2 py-1 flex-1"
    />
  </div>

  <div className="flex items-center gap-2">
    <label className="w-32 font-medium">Vendor:</label>
    <input
      type="text"
      value={newVendor}
      onChange={(e) => setNewVendor(e.target.value)}
      className="border rounded px-2 py-1 flex-1"
    />
  </div>

  <div className="flex items-center gap-2">
    <label className="w-32 font-medium">Date:</label>
    <input
      type="date"
      value={newDate}
      onChange={(e) => setNewDate(e.target.value)}
      className="border rounded px-2 py-1 flex-1"
    />
  </div>

  <div className="flex items-center gap-2">
    <label className="w-32 font-medium">Amount:</label>
    <input
      type="number"
      placeholder="Amount (required)"
      value={newAmount || ''}
      onChange={(e) => setNewAmount(Number(e.target.value))}
      className="border rounded px-2 py-1 flex-1"
    />
  </div>

  <div className="flex items-center gap-2">
    <label className="w-32 font-medium">Receipt:</label>
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={(e) => setNewFiles(e.target.files)}
      className="border rounded px-2 py-1 flex-1"
    />
  </div>
</div>

      <button
        onClick={addExpense}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Expense
      </button>
    </div>
  )
}
