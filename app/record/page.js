'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RecordPage() {
  const router = useRouter()

  const [topicId, setTopicId] = useState('')
  const [userName, setUserName] = useState('')
  const [userCode, setUserCode] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [timer, setTimer] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setTopicId(params.get('topicId') || '')

    const savedCode = localStorage.getItem('bizspeak_user_code')
    if (savedCode) {
      setUserCode(savedCode)
    }

    const savedName = localStorage.getItem('bizspeak_user_name')
    if (savedName) {
      setUserName(savedName)
    }
  }, [])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })

      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
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
    } catch (error) {
      console.error(error)
      alert('Microphone access failed. Please allow microphone permission.')
    }
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

  function resetRecording() {
    setAudioBlob(null)
    setAudioUrl(null)
    setSeconds(0)
  }

  async function uploadRecording() {
    if (!topicId) {
      alert('Missing topic ID. Please go back to the home page and try again.')
      return
    }

    if (!userCode.trim()) {
      alert('Please enter your access code.')
      return
    }

    if (!audioBlob) {
      alert('Please record first.')
      return
    }

    localStorage.setItem('bizspeak_user_code', userCode.trim())
    localStorage.setItem('bizspeak_user_name', userName.trim())

    setUploading(true)

    try {
      const fileName = `${userCode.trim()}-${topicId}-${Date.now()}.webm`

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
          duration_seconds: seconds,
          user_name: userName.trim() || 'Anonymous',
          user_code: userCode.trim()
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
    <main>
      <div className="container">
        <section className="card">
          <p className="label">Speaking Practice</p>

          <h1>Record Your Summary</h1>

          <input
            className="input"
            placeholder="Your name"
            value={userName}
            onChange={event => {
              setUserName(event.target.value)
              localStorage.setItem('bizspeak_user_name', event.target.value)
            }}
          />

          <input
            className="input"
            placeholder="Your access code"
            value={userCode}
            onChange={event => {
              setUserCode(event.target.value)
              localStorage.setItem('bizspeak_user_code', event.target.value)
            }}
          />

          <p>Duration: {seconds} seconds</p>

          {!recording && (
            <button className="button" onClick={startRecording}>
              Start Speaking
            </button>
          )}

          {recording && (
            <button className="danger" onClick={stopRecording}>
              Stop Recording
            </button>
          )}

          {audioUrl && (
            <>
              <h2>Preview</h2>

              <audio className="audio" controls src={audioUrl} />

              <button className="secondary" onClick={resetRecording}>
                Re-record
              </button>

              <button
                className="button"
                onClick={uploadRecording}
                disabled={uploading}
              >
                {uploading
                  ? 'Uploading and generating feedback...'
                  : 'Get Coaching'}
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  )
}