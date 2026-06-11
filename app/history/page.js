'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function HistoryPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setItems(data)
  }

  return (
    <main style={{ padding: 30, maxWidth: 600, margin: '0 auto' }}>
      <h1>Practice History</h1>

      {items.length === 0 && <p>No recordings yet.</p>}

      {items.map(item => (
        <Link
          key={item.id}
          href={`/feedback/${item.id}`}
          style={{
            display: 'block',
            padding: 16,
            marginBottom: 12,
            border: '1px solid #ddd',
            borderRadius: 12,
            textDecoration: 'none',
            color: '#111'
          }}
        >
          <strong>Recording</strong>
          <p>Duration: {item.duration_seconds} seconds</p>
          <p>{new Date(item.created_at).toLocaleString()}</p>
        </Link>
      ))}
    </main>
  )
}