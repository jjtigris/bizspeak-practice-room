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
    <main style={{ padding: 30, maxWidth: 600, margin: '0 auto' }}>
      <h1>BizSpeak Practice Room</h1>

      <h2>{topic.title}</h2>

      <p>{topic.context}</p>

      {topic.video_url && (
        <div style={{ marginTop: 20 }}>
          <iframe
            width="100%"
            height="315"
            src={topic.video_url}
            title="Weekly business video"
            allowFullScreen
            style={{
              border: 'none',
              borderRadius: 12
            }}
          />
        </div>
      )}

      <h3>After watching, speak for 3–5 minutes:</h3>

      <ol>
        {topic.questions?.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ol>

      <Link href={`/record?topicId=${topic.id}`}>
        Start Recording →
      </Link>

      <br />
      <br />

      <Link href="/history">
        View Practice History →
      </Link>
    </main>
  )
}