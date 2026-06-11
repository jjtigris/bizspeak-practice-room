'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function FeedbackPage() {
  const params = useParams()
  const id = params.id

  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadSubmission()
    }
  }, [id])

  async function loadSubmission() {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setSubmission(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <main>
        <div className="container">
          <section className="card">
            <h1>Loading...</h1>
          </section>
        </div>
      </main>
    )
  }

  if (!submission) {
    return (
      <main>
        <div className="container">
          <section className="card">
            <h1>Recording Not Found</h1>

            <Link className="button" href="/history">
              Back to History
            </Link>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="container">
        <section className="card">
          <p className="label">Practice Submitted</p>

          <h1>Recording Saved ✅</h1>

          <p>
            Name: <strong>{submission.user_name || 'Anonymous'}</strong>
          </p>

          <p>
            Duration: {submission.duration_seconds} seconds
          </p>

          <p>
            Submitted:{' '}
            {new Date(submission.created_at).toLocaleString()}
          </p>

          <audio
            className="audio"
            controls
            src={submission.audio_url}
          />

          <p>
            Your recording has been saved. Feedback will be discussed during the weekly session.
          </p>

          <Link className="button" href="/">
            Back to Today’s Practice
          </Link>

          <Link className="secondary" href="/history">
            View History
          </Link>
        </section>
      </div>
    </main>
  )
}