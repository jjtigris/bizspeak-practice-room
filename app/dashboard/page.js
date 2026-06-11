'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPractices: 0,
    totalSeconds: 0,
    streak: 0,
    lastPractice: null
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const userCode =
      localStorage.getItem('bizspeak_user_code')

    if (!userCode) return

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_code', userCode)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    const totalPractices = data.length

    const totalSeconds = data.reduce(
      (sum, item) =>
        sum + (item.duration_seconds || 0),
      0
    )

    const lastPractice =
      data.length > 0
        ? data[0].created_at
        : null

    setStats({
      totalPractices,
      totalSeconds,
      streak: totalPractices,
      lastPractice
    })
  }

  return (
    <main>
      <div className="container">
        <section className="card">

          <p className="label">
            Progress Dashboard
          </p>

          <h1>🔥 {stats.streak} Day Streak</h1>

          <h2>
            Practices Completed
          </h2>

          <p>
            {stats.totalPractices}
          </p>

          <h2>
            Total Speaking Time
          </h2>

          <p>
            {Math.round(
              stats.totalSeconds / 60
            )} minutes
          </p>

          <h2>
            Last Practice
          </h2>

          <p>
            {stats.lastPractice
              ? new Date(
                  stats.lastPractice
                ).toLocaleDateString()
              : 'No practice yet'}
          </p>

          <h2>
            Next Discussion
          </h2>

          <p>
            Saturday 8:00 PM
          </p>

        </section>
      </div>
    </main>
  )
}