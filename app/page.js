'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [topic, setTopic] = useState(null)

  useEffect(() => {
    loadTopic()
  }, [])

  async function loadTopic() {
    const { data, error } = await supabase
      .from('weekly_topics')
      .select('*')
      .eq('status', 'active')
      .single()

    if (error) {
      console.error(error)
      return
    }

    setTopic(data)
  }

  if (!topic) {
    return <main style={{ padding: 30 }}>Loading...</main>
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
              title="Weekly business video"
              allowFullScreen
            />
          )}

          <h2>After watching, speak for 3–5 minutes:</h2>

          <ol>
            {topic.questions?.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ol>

          <Link className="button" href={`/record?topicId=${topic.id}`}>
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