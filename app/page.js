'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopic()
  }, [])

  async function loadTopic() {
    const today = new Date().toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from('weekly_topics')
      .select('*')
      .eq('status', 'active')
      .eq('practice_day', 2)
      .maybeSingle()

    if (error) {
      console.error(error)
    }

    setTopic(data)
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

  if (!topic) {
    return (
      <main>
        <div className="container">
          <section className="card">
            <h1>No Practice Available Today</h1>

            <p>
              There is currently no active video scheduled for today.
            </p>

            <Link className="secondary" href="/history">
              View Practice History
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
          <p className="label">BizSpeak Practice Room</p>

          <h1>{topic.title}</h1>

          <p>{topic.context}</p>

          {topic.video_url && (
            <iframe
              className="video"
              src={topic.video_url}
              title="Daily Practice Video"
              allowFullScreen
            />
          )}

          <h2>After watching, speak for 3–5 minutes:</h2>

          <ol>
            {topic.questions?.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ol>

          <Link
            className="button"
            href={`/record?topicId=${topic.id}`}
          >
            Start Recording
          </Link>

          <Link className="secondary" href="/history">
            View Practice History
          </Link>

        </section>
      </div>
    </main>
  )
}