'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function HistoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [userCode, setUserCode] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const savedCode = localStorage.getItem('bizspeak_user_code')

    if (!savedCode) {
      setLoading(false)
      return
    }

    setUserCode(savedCode)

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_code', savedCode)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setItems(data || [])
    setLoading(false)
  }

  return (
    <main>
      <div className="container">
        <section className="card">
          <p className="label">Your Practice History</p>

          <h1>Practice History</h1>

          {loading && <p>Loading...</p>}

          {!loading && !userCode && (
            <p>
              No access code found.
              Please complete a practice session first.
            </p>
          )}

          {!loading && userCode && (
            <>
              <p>
                Access Code: <strong>{userCode}</strong>
              </p>

              {items.length === 0 && (
                <p>No recordings found yet.</p>
              )}

              {items.map(item => (
                <Link
                  key={item.id}
                  href={`/feedback/${item.id}`}
                  className="history-item"
                >
                  <strong>
                    {item.user_name || 'Anonymous'}
                  </strong>

                  <p>
                    Duration: {item.duration_seconds} seconds
                  </p>

                  <p>
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </p>
                </Link>
              ))}
            </>
          )}

          <Link className="button" href="/">
            Back to Practice
          </Link>
        </section>
      </div>
    </main>
  )
}