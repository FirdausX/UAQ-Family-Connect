import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'moments', label: 'Moments', icon: 'image' },
  { id: 'appointments', label: 'Appointments', icon: 'calendar' },
  { id: 'announcements', label: 'Announcements', icon: 'megaphone' },
  { id: 'more', label: 'More', icon: 'menu' },
]

function Icon({ name, size = 21, strokeWidth = 1.9 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'home') {
    return <svg {...common}><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.8V21h13V9.8"/><path d="M9.5 21v-6h5v6"/></svg>
  }

  if (name === 'image') {
    return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9" r="1.5"/><path d="m5 17 4.2-4 3.1 3 2.3-2.2L19 18"/></svg>
  }

  if (name === 'calendar') {
    return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
  }

  if (name === 'megaphone') {
    return <svg {...common}><path d="m3 11 14-5v12L3 13z"/><path d="M17 9.2c2.6.5 4 1.4 4 2.8s-1.4 2.3-4 2.8"/><path d="m6 14 1.2 5h3.5l-1.5-6"/></svg>
  }

  if (name === 'menu') {
    return <svg {...common}><path d="M5 7h14M5 12h14M5 17h14"/></svg>
  }

  if (name === 'bell') {
    return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
  }

  if (name === 'arrow') {
    return <svg {...common}><path d="m9 18 6-6-6-6"/></svg>
  }

  if (name === 'clock') {
    return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  }

  if (name === 'pin') {
    return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
  }

  if (name === 'play') {
    return <svg {...common} fill="currentColor" stroke="none"><path d="m9 7 8 5-8 5z"/></svg>
  }

  if (name === 'phone') {
    return <svg {...common}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c1 .3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/></svg>
  }

  if (name === 'whatsapp') {
    return <svg {...common}><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M8.4 7.7c.2-.4.4-.4.7-.4h.5l.7 1.8c.1.2 0 .4-.1.6l-.6.8c-.1.2-.1.3 0 .5.6 1.1 1.5 2 2.6 2.6.2.1.4.1.5 0l.9-1c.2-.2.4-.2.6-.1l1.8.9c.2.1.3.3.3.5 0 .8-.4 1.5-1 2-.5.4-1.2.7-2.1.5-1.1-.2-2.5-.8-4-2-1.7-1.4-2.8-3.1-3.2-4.4-.3-.9-.1-1.7.4-2.3Z"/></svg>
  }

  if (name === 'logout') {
    return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3"/><path d="M13 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/></svg>
  }

  if (name === 'users') {
    return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  }

  if (name === 'shield') {
    return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
  }

  if (name === 'help') {
    return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.5 1.1-1.5 2.2M12 17h.01"/></svg>
  }

  return null
}

function getVideoPreviewUrl(url) {
  if (!url) return ''
  return url.includes('#') ? url : `${url}#t=2`
}

export default function App() {
  const [session, setSession] = useState(null)
  const [familyId, setFamilyId] = useState('')
  const [pin, setPin] = useState('')
  const [resident, setResident] = useState(null)
  const [updates, setUpdates] = useState([])
  const [appointments, setAppointments] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [updatesLoading, setUpdatesLoading] = useState(false)
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activePage, setActivePage] = useState('home')
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [momentFilter, setMomentFilter] = useState('all')

  const uaqPhone = '+601112707492'
  const whatsappMessage = 'Hi UAQ, I’m contacting you through Family Connect.'
  const whatsappUrl = `https://wa.me/601112707492?text=${encodeURIComponent(whatsappMessage)}`

  useEffect(() => {
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      window.setTimeout(async () => {
        if (!newSession) {
          setSession(null)
          clearFamilyData()
          return
        }

        const valid = await validateFamilySession(newSession)

        if (!valid) return

        setSession(newSession)
        await loadFamilyData()
      }, 0)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return undefined

    let stopped = false

    const checkNow = async () => {
      if (stopped) return
      await validateFamilySession(session)
    }

    const intervalId = window.setInterval(checkNow, 30000)
    const handleFocus = () => checkNow()
    const handleVisibility = () =>
      document.visibilityState === 'visible' && checkNow()

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stopped = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [session?.access_token])

  function clearFamilyData() {
    setResident(null)
    setUpdates([])
    setAppointments([])
    setAnnouncements([])
    setMomentFilter('all')
  }

  function getTokenIssuedAt(accessToken) {
    try {
      const payloadPart = accessToken.split('.')[1]

      if (!payloadPart) return null

      const normalized = payloadPart
        .replace(/-/g, '+')
        .replace(/_/g, '/')

      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '='
      )

      const payload = JSON.parse(window.atob(padded))

      return typeof payload.iat === 'number'
        ? payload.iat
        : null
    } catch (tokenError) {
      console.error(
        'Unable to read session issue time.',
        tokenError
      )

      return null
    }
  }

  async function forceLocalLogout(reason) {
    clearFamilyData()
    setSession(null)
    setMessage(reason)

    const { error } = await supabase.auth.signOut({
      scope: 'local',
    })

    if (error) {
      console.error('Local sign out failed.', error)
    }
  }

  async function validateFamilySession(currentSession) {
    if (!currentSession?.access_token) return false

    const { data, error } = await supabase.rpc(
      'get_family_session_status'
    )

    if (error) {
      console.error('Family session check failed.', error)
      return true
    }

    const status = Array.isArray(data)
      ? data[0]
      : data

    if (!status) {
      await forceLocalLogout(
        'This Family Connect login is no longer available. Please contact UAQ.'
      )

      return false
    }

    if (status.active !== true) {
      await forceLocalLogout(
        'This Family Connect account is inactive. Please contact UAQ.'
      )

      return false
    }

    const issuedAtSeconds = getTokenIssuedAt(
      currentSession.access_token
    )

    const invalidatedAtMs = status.invalidated_at
      ? new Date(status.invalidated_at).getTime()
      : 0

    const invalidatedAtSeconds = Number.isFinite(
      invalidatedAtMs
    )
      ? Math.floor(invalidatedAtMs / 1000)
      : 0

    if (
      issuedAtSeconds !== null &&
      invalidatedAtSeconds > 0 &&
      issuedAtSeconds < invalidatedAtSeconds
    ) {
      await forceLocalLogout(
        'Your login session has expired because the PIN or account access was updated. Please sign in again with the latest PIN.'
      )

      return false
    }

    return true
  }

  async function checkSession() {
    setLoading(true)

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    if (!currentSession) {
      setSession(null)
      clearFamilyData()
      setLoading(false)
      return
    }

    const valid =
      await validateFamilySession(currentSession)

    if (valid) {
      setSession(currentSession)
      await loadFamilyData()
    }

    setLoading(false)
  }

  async function loadFamilyData() {
    setMessage('')

    const { data, error } = await supabase.rpc(
      'get_family_resident_profile'
    )

    if (error) {
      console.error(error)
      clearFamilyData()
      setMessage(
        'Unable to load resident information.'
      )
      return
    }

    if (!data || data.length === 0) {
      clearFamilyData()
      setMessage(
        'No resident is linked to this family account.'
      )
      return
    }

    const residentData = data[0]

    setResident(residentData)

    await Promise.all([
      loadUpdates(residentData.patient_id),
      loadAppointments(residentData.patient_id),
      loadAnnouncements(),
    ])
  }

  async function loadUpdates(patientId) {
    setUpdatesLoading(true)

    const { data, error } = await supabase
      .from('family_updates')
      .select(
        'id,patient_id,audience_type,title,message,update_type,media_path,media_type,media_original_name,thumbnail_path,created_at'
      )
      .or(
        `patient_id.eq.${patientId},audience_type.eq.all_families`
      )
      .eq('visible_to_family', true)
      .order('created_at', {
        ascending: false,
      })
      .limit(20)

    if (error) {
      console.error(error)
      setUpdates([])
      setUpdatesLoading(false)
      return
    }

    const rows = await Promise.all(
      (data || []).map(async (update) => {
        let mediaUrl = ''
        let thumbnailUrl = ''

        if (update.media_path) {
          const {
            data: signedData,
            error: signedError,
          } = await supabase.storage
            .from('family-updates')
            .createSignedUrl(
              update.media_path,
              60 * 60
            )

          if (signedError) {
            console.error(signedError)
          } else {
            mediaUrl =
              signedData?.signedUrl || ''
          }
        }

        if (update.thumbnail_path) {
          const {
            data: thumbnailData,
            error: thumbnailError,
          } = await supabase.storage
            .from('family-updates')
            .createSignedUrl(
              update.thumbnail_path,
              60 * 60
            )

          if (thumbnailError) {
            console.error(thumbnailError)
          } else {
            thumbnailUrl =
              thumbnailData?.signedUrl || ''
          }
        }

        return {
          ...update,
          media_url: mediaUrl,
          thumbnail_url: thumbnailUrl,
        }
      })
    )

    setUpdates(rows)
    setUpdatesLoading(false)
  }

  async function loadAppointments(patientId) {
    setAppointmentsLoading(true)

    const now = new Date()

    const localToday = new Date(
      now.getTime() -
        now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10)

    const { data, error } = await supabase
      .from('family_appointments')
      .select(
        'id,appointment_date,appointment_time,place,purpose,notes'
      )
      .eq('patient_id', patientId)
      .eq('visible_to_family', true)
      .gte('appointment_date', localToday)
      .order('appointment_date', {
        ascending: true,
      })
      .order('appointment_time', {
        ascending: true,
      })

    if (error) {
      console.error(error)
      setAppointments([])
      setAppointmentsLoading(false)
      return
    }

    setAppointments(data || [])
    setAppointmentsLoading(false)
  }

  async function loadAnnouncements() {
    setAnnouncementsLoading(true)

    const { data, error } = await supabase
      .from('family_announcements')
      .select(
        'id,title,message,announcement_type,media_path,media_type,media_original_name,created_at'
      )
      .eq('visible', true)
      .order('created_at', {
        ascending: false,
      })
      .limit(10)

    if (error) {
      console.error(error)
      setAnnouncements([])
      setAnnouncementsLoading(false)
      return
    }

    const rows = await Promise.all(
      (data || []).map(async (announcement) => {
        if (!announcement.media_path) {
          return {
            ...announcement,
            media_url: '',
          }
        }

        const {
          data: signedData,
          error: signedError,
        } = await supabase.storage
          .from('family-announcements')
          .createSignedUrl(
            announcement.media_path,
            60 * 60
          )

        if (signedError) {
          console.error(signedError)
        }

        return {
          ...announcement,
          media_url:
            signedData?.signedUrl || '',
        }
      })
    )

    setAnnouncements(rows)
    setAnnouncementsLoading(false)
  }

  async function handleLogin(event) {
    event.preventDefault()

    setLoginLoading(true)
    setMessage('')

    const cleanFamilyId =
      familyId.trim().toUpperCase()

    const cleanPin = pin.trim()

    if (!/^UAQ-\d{4}$/.test(cleanFamilyId)) {
      setMessage(
        'Enter a valid Family ID, for example UAQ-6355.'
      )

      setLoginLoading(false)
      return
    }

    if (!/^\d{6}$/.test(cleanPin)) {
      setMessage(
        'PIN must contain exactly 6 digits.'
      )

      setLoginLoading(false)
      return
    }

    const internalEmail =
      `${cleanFamilyId
        .toLowerCase()
        .replace('-', '')}@family.uaqelderlycarecentre.com`

    const { error } =
      await supabase.auth.signInWithPassword({
        email: internalEmail,
        password: cleanPin,
      })

    if (error) {
      setMessage(
        'Family ID or PIN is incorrect, or this account is inactive.'
      )

      setLoginLoading(false)
      return
    }

    setFamilyId('')
    setPin('')
    setLoginLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    clearFamilyData()
  }

  function navigate(page) {
    setActivePage(page)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function getGreeting() {
    const hour = new Date().getHours()

    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'

    return 'Good evening'
  }

  function formatUpdateDate(dateValue) {
    if (!dateValue) return ''

    return new Intl.DateTimeFormat(
      'en-MY',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }
    ).format(new Date(dateValue))
  }

  function formatShortDate(dateValue) {
    if (!dateValue) {
      return {
        day: '--',
        month: '---',
      }
    }

    const date =
      new Date(`${dateValue}T00:00:00`)

    return {
      day: new Intl.DateTimeFormat(
        'en-MY',
        {
          day: '2-digit',
        }
      ).format(date),

      month: new Intl.DateTimeFormat(
        'en-MY',
        {
          month: 'short',
        }
      )
        .format(date)
        .toUpperCase(),
    }
  }

  function formatAppointmentDate(dateValue) {
    if (!dateValue) return ''

    const date =
      new Date(`${dateValue}T00:00:00`)

    return new Intl.DateTimeFormat(
      'en-MY',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    ).format(date)
  }

  function formatAppointmentTime(timeValue) {
    if (!timeValue) return ''

    const [hour, minute] =
      timeValue.split(':')

    const date = new Date()

    date.setHours(
      Number(hour),
      Number(minute),
      0,
      0
    )

    return new Intl.DateTimeFormat(
      'en-MY',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    ).format(date)
  }

  function getUpdateTypeLabel(type) {
    if (type === 'activity') {
      return 'Activity'
    }

    if (type === 'moment') {
      return 'Moment'
    }

    if (type === 'important') {
      return 'Important'
    }

    return 'Moment'
  }

  function getAnnouncementTypeLabel(type) {
    if (type === 'event') {
      return 'Event'
    }

    if (type === 'important') {
      return 'Important'
    }

    return 'Announcement'
  }

  const latestUpdate =
    updates[0] || null

  const nextAppointment =
    appointments[0] || null

  const latestAnnouncement =
    announcements[0] || null

  const residentName =
    resident?.full_name ||
    'Your Loved One'

  if (loading) {
    return (
      <div className="app-loading">
        <img
          src="/uaq-logo.png"
          alt="UAQ"
          className="loading-logo"
        />

        <p>
          Loading Family Connect...
        </p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-brand-lockup">
            <img
              src="/uaq-logo.png"
              alt="UAQ Elderly Care Centre"
              className="login-logo"
            />

            <div>
              <span>UAQ</span>
              <strong>
                Family Connect
              </strong>
            </div>
          </div>

          <p className="login-kicker">
            PRIVATE FAMILY PORTAL
          </p>

          <h1>
            Stay close, wherever you are.
          </h1>

          <p className="login-subtitle">
            Appointments, announcements and
            meaningful moments from UAQ Elderly
            Care Centre.
          </p>

          <form
            onSubmit={handleLogin}
            className="login-form"
          >
            <label>
              Family ID
            </label>

            <input
              type="text"
              value={familyId}
              onChange={(event) =>
                setFamilyId(
                  event.target.value
                    .toUpperCase()
                    .replace(
                      /[^A-Z0-9-]/g,
                      ''
                    )
                    .slice(0, 8)
                )
              }
              placeholder="UAQ-6355"
              autoComplete="username"
              maxLength={8}
              required
            />

            <label>
              6-digit PIN
            </label>

            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(event) =>
                setPin(
                  event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6)
                )
              }
              placeholder="Enter 6-digit PIN"
              autoComplete="current-password"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />

            {message && (
              <div className="message error">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading
                ? 'Signing in...'
                : 'Sign In'}
            </button>
          </form>

          <p className="login-footer">
            Care • Comfort • Compassion
            <br />
            Pasir Gudang · Johor
          </p>
        </div>
      </div>
    )
  }

  const HomePage = () => (
    <>
      <section className="welcome-panel">
        <div className="welcome-brand-row">
          <div className="mobile-lockup">
            <img
              src="/uaq-logo.png"
              alt="UAQ"
            />

            <span></span>

            <div>
              <small>UAQ</small>

              <strong>
                Family Connect
              </strong>
            </div>
          </div>

          <button
            className="round-icon-btn"
            aria-label="Notifications"
          >
            <Icon name="bell" />
          </button>
        </div>

        <div className="welcome-copy">
          <p>
            {getGreeting()},
          </p>

          <h1>
            Family of
            <br />
            {residentName}
          </h1>
        </div>

        <div
          className="leaf-art"
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </div>
      </section>

      <section className="resident-card premium-card">
        <div className="resident-avatar">
          {residentName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="resident-info">
          <strong>
            {residentName}
          </strong>

          <span>
            Resident at UAQ Elderly Care Centre
          </span>

          <small className="status-badge">
            <i /> Connected
          </small>
        </div>
      </section>

      <section className="home-section">
        <div className="section-title-row">
          <span>
            ANNOUNCEMENT
          </span>

          <button
            onClick={() =>
              navigate(
                'announcements'
              )
            }
          >
            View all
            <Icon
              name="arrow"
              size={15}
            />
          </button>
        </div>

        {announcementsLoading ? (
          <SkeletonCard />
        ) : latestAnnouncement ? (
          <AnnouncementFeature
            announcement={
              latestAnnouncement
            }
          />
        ) : (
          <EmptyCard
            text="No announcements at the moment."
          />
        )}
      </section>

      <section className="home-section">
        <div className="section-title-row">
          <span>
            COMING UP
          </span>

          <button
            onClick={() =>
              navigate(
                'appointments'
              )
            }
          >
            View all
            <Icon
              name="arrow"
              size={15}
            />
          </button>
        </div>

        {appointmentsLoading ? (
          <SkeletonCard />
        ) : nextAppointment ? (
          <AppointmentCard
            appointment={
              nextAppointment
            }
          />
        ) : (
          <EmptyCard
            text="No upcoming appointments."
          />
        )}
      </section>

      <section className="home-section home-moments-section">
        <div className="section-title-row">
          <span>
            LATEST MOMENTS
          </span>

          <button
            onClick={() =>
              navigate('moments')
            }
          >
            View all
            <Icon
              name="arrow"
              size={15}
            />
          </button>
        </div>

        {updatesLoading ? (
          <SkeletonCard />
        ) : latestUpdate ? (
          <MomentFeature
            update={latestUpdate}
          />
        ) : (
          <EmptyCard
            text="New photos and videos will appear here."
          />
        )}
      </section>
    </>
  )

  function SkeletonCard() {
    return (
      <div className="skeleton-card premium-card">
        <span />
        <span />
        <span />
      </div>
    )
  }

  function EmptyCard({ text }) {
    return (
      <div className="empty-card premium-card">
        <div className="empty-icon">
          <Icon name="image" />
        </div>

        <p>
          {text}
        </p>
      </div>
    )
  }

  function AnnouncementFeature({
    announcement,
  }) {
    return (
      <article className="announcement-feature premium-card">

        {announcement.media_url ? (
          announcement.media_type ===
          'video' ? (
            <video
              src={getVideoPreviewUrl(announcement.media_url)}
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={
                announcement.media_url
              }
              alt={
                announcement.title ||
                'Announcement'
              }
            />
          )
        ) : (
          <div className="announcement-art">
            <div className="moon">
              ◔
            </div>

            <div className="diamond">
              ◇
            </div>
          </div>
        )}

        <div className="announcement-feature-copy">
          <small>
            UAQ FAMILY CONNECT ·{' '}
            {getAnnouncementTypeLabel(
              announcement.announcement_type
            )}
          </small>

          <h2>
            {announcement.title}
          </h2>

          <p>
            {announcement.message}
          </p>
        </div>
      </article>
    )
  }

  function AppointmentCard({
    appointment,
  }) {
    const d = formatShortDate(
      appointment.appointment_date
    )

    return (
      <article className="appointment-feature premium-card">

        <div className="date-tile">
          <strong>
            {d.day}
          </strong>

          <span>
            {d.month}
          </span>
        </div>

        <div className="appointment-main">
          <h3>
            {appointment.place ||
              'Appointment'}
          </h3>

          <p>
            {appointment.purpose ||
              'Scheduled appointment'}
          </p>

          <div className="appointment-meta">

            <span>
              <Icon
                name="calendar"
                size={16}
              />

              {formatAppointmentDate(
                appointment.appointment_date
              )}
            </span>

            {appointment.appointment_time && (
              <span>
                <Icon
                  name="clock"
                  size={16}
                />

                {formatAppointmentTime(
                  appointment.appointment_time
                )}
              </span>
            )}
          </div>
        </div>

        <Icon
          name="arrow"
          size={22}
        />
      </article>
    )
  }

  function MomentFeature({
    update,
  }) {
    return (
      <article className="moment-feature premium-card">

        <div className="moment-media">

          {update.media_url ? (
            update.media_type ===
            'video' ? (
              <>
                <video
                  src={
                    update.thumbnail_url
                      ? update.media_url
                      : getVideoPreviewUrl(update.media_url)
                  }
                  poster={update.thumbnail_url || undefined}
                  controls
                  playsInline
                  preload="metadata"
                />

                <div className="video-badge">
                  <Icon
                    name="play"
                    size={18}
                  />
                </div>
              </>
            ) : (
              <img
                src={
                  update.media_url
                }
                alt={
                  update.title ||
                  'UAQ moment'
                }
              />
            )
          ) : (
            <div className="moment-placeholder">
              <Icon
                name="image"
                size={34}
              />
            </div>
          )}
        </div>

        <div className="moment-copy">
          <div>
            <span className="soft-pill">
              {getUpdateTypeLabel(
                update.update_type
              )}
            </span>

            <h3>
              {update.title ||
                'A moment from UAQ'}
            </h3>

            <p>
              {update.message}
            </p>
          </div>

          <small>
            {formatUpdateDate(
              update.created_at
            )}
          </small>
        </div>
      </article>
    )
  }

  const MomentsPage = () => (
    <PageHeader
      eyebrow="PRIVATE FAMILY GALLERY"
      title="Moments"
      subtitle={`Special moments from ${residentName}'s journey at UAQ.`}
    >
      <div className="filter-pills">
        <button
          type="button"
          className={
            momentFilter === 'all'
              ? 'active'
              : ''
          }
          onClick={() =>
            setMomentFilter('all')
          }
        >
          All
        </button>

        <button
          type="button"
          className={
            momentFilter === 'photos'
              ? 'active'
              : ''
          }
          onClick={() =>
            setMomentFilter('photos')
          }
        >
          Photos
        </button>

        <button
          type="button"
          className={
            momentFilter === 'videos'
              ? 'active'
              : ''
          }
          onClick={() =>
            setMomentFilter('videos')
          }
        >
          Videos
        </button>
      </div>
    </PageHeader>
  )

  const MomentsContent = () => {
    const filteredUpdates =
      updates.filter((update) => {
        if (
          momentFilter === 'photos'
        ) {
          return (
            update.media_type ===
            'image'
          )
        }

        if (
          momentFilter === 'videos'
        ) {
          return (
            update.media_type ===
            'video'
          )
        }

        return true
      })

    if (updatesLoading) {
      return <SkeletonCard />
    }

    if (
      updates.length === 0
    ) {
      return (
        <EmptyCard
          text="No moments have been shared yet."
        />
      )
    }

    if (
      filteredUpdates.length ===
      0
    ) {
      return (
        <EmptyCard
          text={
            momentFilter === 'photos'
              ? 'No photos have been shared yet.'
              : 'No videos have been shared yet.'
          }
        />
      )
    }

    return (
      <div className="moments-grid">
        {filteredUpdates.map(
          (update) => (
            <MomentFeature
              key={update.id}
              update={update}
            />
          )
        )}
      </div>
    )
  }

  const AppointmentsPage = () => (
    <>
      <PageHeader
        eyebrow="YOUR SCHEDULE"
        title="Appointments"
        subtitle={`Upcoming appointments for ${residentName}.`}
      />

      {appointmentsLoading ? (
        <SkeletonCard />
      ) : appointments.length === 0 ? (
        <EmptyCard
          text="No upcoming appointments."
        />
      ) : (
        <div className="appointment-stack">
          {appointments.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
            />
          ))}
        </div>
      )}
    </>
  )

  const AnnouncementsPage = () => (
    <>
      <PageHeader
        eyebrow="CENTRE NEWS"
        title="Announcements"
        subtitle="Important notices, festive messages and UAQ updates."
      />

      {announcementsLoading ? (
        <SkeletonCard />
      ) : announcements.length ===
        0 ? (
        <EmptyCard
          text="No announcements at the moment."
        />
      ) : (
        <div className="announcement-grid">
          {announcements.map((a) => (
            <AnnouncementFeature
              key={a.id}
              announcement={a}
            />
          ))}
        </div>
      )}
    </>
  )

  const MorePage = () => (
    <>
      <PageHeader
        eyebrow="ACCOUNT & SUPPORT"
        title="More"
        subtitle="Family access, support and centre information."
      />

      <section className="profile-summary premium-card">
        <div className="resident-avatar large">
          {residentName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div>
          <strong>
            {residentName}
          </strong>

          <span>
            Resident at UAQ Elderly Care Centre
          </span>

          <small className="status-badge">
            <i /> Connected
          </small>
        </div>
      </section>

      <div className="more-grid">
        <section className="settings-card premium-card">

          <SettingRow
            icon="users"
            title="Family Access"
            subtitle="Up to 2 devices can use this family account."
          />

          <SettingRow
            icon="shield"
            title="Private & Secure"
            subtitle="Family-only access protected by your UAQ ID and PIN."
          />

          <SettingRow
            icon="help"
            title="Help & Support"
            subtitle="Contact UAQ if you need help with your account."
            onClick={() =>
              setShowSupportModal(true)
            }
          />
        </section>

        <section className="support-card premium-card">
          <span>
            NEED ASSISTANCE?
          </span>

          <h3>
            Contact UAQ
          </h3>

          <p>
            Our team is here when you need us.
          </p>

          <div className="support-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="whatsapp" />
              WhatsApp
            </a>

            <a
              href={`tel:${uaqPhone}`}
            >
              <Icon name="phone" />
              Call
            </a>
          </div>
        </section>
      </div>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        <Icon name="logout" />
        {' '}
        Log Out
      </button>

      {showSupportModal && (
        <div
          className="support-modal-backdrop"
          role="presentation"
          onMouseDown={() =>
            setShowSupportModal(false)
          }
        >
          <section
            className="support-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="support-modal-head">
              <div>
                <span>
                  UAQ FAMILY CONNECT
                </span>

                <h3 id="support-modal-title">
                  Help & Support
                </h3>
              </div>

              <button
                type="button"
                className="support-modal-close"
                aria-label="Close support"
                onClick={() =>
                  setShowSupportModal(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            <p>
              If you need help with your Family Connect account, contact UAQ directly.
            </p>

            <div className="support-modal-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="whatsapp" />

                <div>
                  <strong>
                    WhatsApp UAQ
                  </strong>

                  <span>
                    Open a chat with our team
                  </span>
                </div>
              </a>

              <a
                href={`tel:${uaqPhone}`}
              >
                <Icon name="phone" />

                <div>
                  <strong>
                    Call UAQ
                  </strong>

                  <span>
                    Open your phone dialer
                  </span>
                </div>
              </a>
            </div>

            <div className="support-modal-note">
              <strong>
                Visiting Hours
              </strong>

              <span>
                10:00 AM – 5:00 PM · Every Day
              </span>
            </div>
          </section>
        </div>
      )}
    </>
  )

  function SettingRow({
    icon,
    title,
    subtitle,
    onClick,
  }) {
    const content = (
      <>
        <div className="setting-icon">
          <Icon name={icon} />
        </div>

        <div>
          <strong>
            {title}
          </strong>

          <span>
            {subtitle}
          </span>
        </div>

        {onClick ? (
          <Icon
            name="arrow"
            size={18}
          />
        ) : (
          <span
            className="setting-row-spacer"
            aria-hidden="true"
          />
        )}
      </>
    )

    if (onClick) {
      return (
        <button
          type="button"
          className="setting-row setting-row-button"
          onClick={onClick}
        >
          {content}
        </button>
      )
    }

    return (
      <div className="setting-row setting-row-static">
        {content}
      </div>
    )
  }

  function PageHeader({
    eyebrow,
    title,
    subtitle,
    children,
  }) {
    return (
      <header className="page-header">
        <span>
          {eyebrow}
        </span>

        <h1>
          {title}
        </h1>

        <p>
          {subtitle}
        </p>

        {children}
      </header>
    )
  }

  const renderPage = () => {
    if (activePage === 'moments') {
      return (
        <>
          <MomentsPage />
          <MomentsContent />
        </>
      )
    }

    if (
      activePage ===
      'appointments'
    ) {
      return <AppointmentsPage />
    }

    if (
      activePage ===
      'announcements'
    ) {
      return <AnnouncementsPage />
    }

    if (
      activePage ===
      'more'
    ) {
      return <MorePage />
    }

    return <HomePage />
  }

  return (
    <div className="family-app">

      <aside className="desktop-sidebar">
        <div className="desktop-brand">
          <img
            src="/uaq-logo.png"
            alt="UAQ"
          />

          <div>
            <small>
              UAQ
            </small>

            <strong>
              Family Connect
            </strong>
          </div>
        </div>

        <nav>
          {NAV_ITEMS.map(
            (item) => (
              <button
                key={item.id}
                className={
                  activePage ===
                  item.id
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  navigate(item.id)
                }
              >
                <Icon
                  name={item.icon}
                />

                <span>
                  {item.label}
                </span>
              </button>
            )
          )}
        </nav>

        <div className="sidebar-family">
          <span>
            FAMILY OF
          </span>

          <strong>
            {residentName}
          </strong>

          <small>
            <i /> Connected
          </small>
        </div>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <Icon name="logout" />
          {' '}
          Log Out
        </button>
      </aside>

      <div className="app-stage">

        <header className="desktop-topbar">
          <div>
            <span>
              {getGreeting()},
            </span>

            <strong>
              Family of {residentName}
            </strong>
          </div>

          <button className="round-icon-btn">
            <Icon name="bell" />
          </button>
        </header>

        <main
          className={`content-shell page-${activePage}`}
        >
          {message && (
            <div className="message error app-message">
              {message}
            </div>
          )}

          {renderPage()}
        </main>
      </div>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(
          (item) => (
            <button
              key={item.id}
              className={
                activePage ===
                item.id
                  ? 'active'
                  : ''
              }
              onClick={() =>
                navigate(item.id)
              }
            >
              <Icon
                name={item.icon}
              />

              <span>
                {item.label}
              </span>
            </button>
          )
        )}
      </nav>
    </div>
  )
}
