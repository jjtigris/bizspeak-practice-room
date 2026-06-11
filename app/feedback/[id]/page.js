'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function FeedbackPage() {
  const params = useParams()
  const id = params.id

  const [submission, setSubmission] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  async function loadData() {
    const submissionResult = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    const feedbackResult = await supabase
      .from('feedback')
      .select('*')
      .eq('submission_id', id)
      .single()

    setSubmission(submissionResult.data)
    setFeedback(feedbackResult.data)
    setLoading(false)
  }

  if (loading) {
    return <main style={{ padding: 30 }}>Loading...</main>
  }

  return (
    <main style={{ padding: 30, maxWidth: 600, margin: '0 auto' }}>
      <h1>AI Feedback</h1>

      <audio controls src={submission.audio_url} style={{ width: '100%' }} />

      <h2>Scores</h2>

      <p>Fluency: {feedback.fluency}/10</p>
      <p>Clarity: {feedback.clarity}/10</p>
      <p>Structure: {feedback.structure}/10</p>
      <p>Vocabulary: {feedback.vocabulary}/10</p>
      <p>Confidence: {feedback.confidence}/10</p>

      <h2>Overall</h2>
      <p>{feedback.overall_comment}</p>

      <h2>Strengths</h2>
      <ul>
        {feedback.strengths?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h2>Improvements</h2>
      <ul>
        {feedback.improvements?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h2>Better Version</h2>
      <p>{feedback.better_answer}</p>

      <h2>Next Focus</h2>
      <p>{feedback.next_focus}</p>
    </main>
  )
}