'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RecordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const topicId = searchParams.get('topicId')

  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [timer, setTimer] = useState(null)

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    const recorder = new MediaRecorder(stream)
    let chunks = []

    recorder.ondataavailable = e => {
      chunks.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, {
        type: 'audio/webm'
      })

      const url = URL.createObjectURL(blob)

      setAudioBlob(blob)
      setAudioUrl(url)

      stream.getTracks().forEach(track => track.stop())
    }

    recorder.start()
    setMediaRecorder(recorder)
    setRecording(true)
    setSeconds(0)

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    setTimer(interval)
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop()
    }

    if (timer) {
      clearInterval(timer)
    }

    setRecording(false)
  }

  async function uploadRecording() {
    if (!audioBlob) {
      alert('Please record first.')
      return
    }

    setUploading(true)

    try {
      const fileName = `${topicId}-${Date.now()}.webm`

      const uploadResult = await supabase.storage
        .from('recordings')
        .upload(fileName, audioBlob)

      if (uploadResult.error) {
        throw uploadResult.error
      }

      const publicUrlResult = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName)

      const publicUrl = publicUrlResult.data.publicUrl

      const insertResult = await supabase
        .from('submissions')
        .insert({
          topic_id: topicId,
          audio_url: publicUrl,
          duration_seconds: seconds
        })
        .select()
        .single()

      if (insertResult.error) {
        throw insertResult.error
      }

      const feedbackResult = await supabase
        .from('feedback')
        .insert({
            submission_id: insertResult.data.id,
            fluency: 7,
            clarity: 8,
            structure: 7,
            vocabulary: 7,
            confidence: 6,
            overall_comment:
            'Good job. Your answer is clear and business-focused. The next step is to sound more natural and less translated from Chinese.',
            strengths: [
            'You explained the business topic clearly.',
            'You stayed focused on the main idea.',
            'You used some useful business vocabulary.'
            ],
            improvements: [
            'Use more structure words like first, second, finally.',
            'Reduce repeated phrases such as “I think”.',
            'Add one concrete example from your own work.'
            ],
            better_answer:
            'AI may change middle management by reducing repetitive reporting work and increasing the importance of communication, judgment, and team coaching. In my work, this could help managers make faster decisions, but people still need to check the quality of AI output.',
            next_focus:
            'Next time, focus on giving your answer in a clear three-part structure.'
        })

        if (feedbackResult.error) {
        throw feedbackResult.error
        }

      


      router.push(`/feedback/${insertResult.data.id}`)
    } catch (error) {
      console.error(error)
      alert('Upload failed. Check console for details.')
    } finally {
      setUploading(false)
    }
    
  }

  

  return (
    <main style={{ padding: 30 }}>
      <h1>Record Your Summary</h1>

      <p>Topic ID: {topicId}</p>

      <p>Duration: {seconds} seconds</p>

      {!recording && (
        <button onClick={startRecording}>
          Start Recording
        </button>
      )}

      {recording && (
        <button onClick={stopRecording}>
          Stop Recording
        </button>
      )}

      {audioUrl && (
        <>
          <h3>Preview</h3>

          <audio controls src={audioUrl} />

          <br />
          <br />

          <button
            onClick={uploadRecording}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Recording'}
          </button>
        </>
      )}
    </main>
  )
}