import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Accessibility,
  Activity as ActivityIcon,
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Heart,
  Home,
  Images,
  Info,
  Layers3,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  Megaphone,
  MonitorSmartphone,
  Moon,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  TriangleAlert,
  Utensils,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'

import { supabase } from './lib/supabase'
import './App.css'
import './uaq-seasonal-theme.css'
import './uaq-seasonal-theme-v2.css'
import { useUaqVisualTheme } from './uaq-seasonal-theme'

const APP_VERSION = '2.7.0'
const APP_BUILD = '2026100802'

const FAMILY_INACTIVITY_LOGOUT_MS =
  10 * 60 * 1000

const FAMILY_LAST_ACTIVITY_KEY =
  'uaq_family_last_activity_at'
const RELEASE_DATE = '8 October 2026'

const BRAND_LOGO = '/images/uaq-family-connect-logo.png'
const SEASON_BRAND_LOGOS = {
  blue_sakura: BRAND_LOGO,
  hari_raya: '/themes/hari-raya/family-logo.png',
  christmas: '/themes/christmas/family-logo.png',
  chinese_new_year: '/themes/chinese-new-year/family-logo.png',
}
function seasonBrandLogo(theme) {
  return SEASON_BRAND_LOGOS[theme] || BRAND_LOGO
}

const navItems = [
  {
    key: 'home',
    label: 'Home',
    icon: Home,
  },
  {
    key: 'activity',
    label: 'Activity',
    desktopLabel: 'Activity Feed',
    icon: Images,
  },
  {
    key: 'appointments',
    label: 'Appointments',
    icon: CalendarDays,
  },
  {
    key: 'announcements',
    label: 'Announcement',
    desktopLabel: 'Announcements',
    icon: Megaphone,
  },
  {
    key: 'about',
    label: 'About',
    icon: Info,
  },
]

const activityFilters = [
  {
    key: 'all',
    label: 'All',
  },
  {
    key: 'photo',
    label: 'Photos',
  },
  {
    key: 'video',
    label: 'Videos',
  },
]

const whatsNew = [
  'Secure family access connected to the live system.',
  'Resident care information loads from the live database.',
  'Care Summary now uses a premium family-friendly ribbon layout.',
  'Home greeting now changes automatically for morning, afternoon and evening.',
  'Home hero now shows gentle rotating messages inspired by nature, weather and calm daily moments, without displaying the resident name.',
  'Announcement photos and videos now display responsively inside the announcement card.',
  'Family Account cards no longer display a person name; the Family ID remains visible.',
  'Family Account status icon now shows live online/offline presence for eMAR monitoring.',
  'Family Connect visual style is now fixed to the approved scenic Fuji design; wallpaper switching has been retired.',
  'Family Connect now signs out automatically after 10 minutes without user activity.',
  'Legacy Family Moments and Activities are loaded again from the original family_updates history, including old media and video thumbnails.',
  'Resident initials now automatically switch to the resident profile photo whenever a photo is available.',
  'Private photo and video viewing inside Family Connect.',
  'Appointments and announcements linked to family records.',
  'Improved mobile and desktop layout.',
]

function familyCodeToEmail(code) {
  const normalized = code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  if (!normalized) return ''

  return `${normalized}@family.uaqelderlycarecentre.com`
}

function formatDateTime(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatFullDate(value) {
  if (!value) return ''

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getDayName(value) {
  if (!value) return ''

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-MY', {
    weekday: 'long',
  }).format(date)
}

function formatTime(value) {
  if (!value) {
    return 'Time not set'
  }

  const [hoursRaw, minutesRaw] = value.split(':')

  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw || 0)

  if (Number.isNaN(hours)) {
    return value
  }

  const suffix = hours >= 12 ? 'PM' : 'AM'

  const displayHours =
    hours % 12 === 0
      ? 12
      : hours % 12

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`
}

function formatPlayerTime(value) {
  if (!Number.isFinite(value) || value < 0) {
    return '0:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function getAppointmentTimestamp(appointment) {
  if (!appointment?.appointment_date) {
    return 0
  }

  const time =
    appointment.appointment_time ||
    '23:59:59'

  return new Date(
    `${appointment.appointment_date}T${time}`
  ).getTime()
}

function getResidentInitials(name) {
  if (!name) {
    return 'FC'
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!words.length) {
    return 'FC'
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return `${words[0][0]}${words[1][0]}`
    .toUpperCase()
}

function getMediaType(update) {
  const mediaType =
    update?.media_type?.toLowerCase() || ''

  const updateType =
    update?.update_type?.toLowerCase() || ''

  if (
    mediaType.includes('video') ||
    updateType.includes('video')
  ) {
    return 'video'
  }

  return 'photo'
}

function resolveMediaPath(path) {
  if (!path) {
    return '/images/family-hero.webp'
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path
  }

  return '/images/family-hero.webp'
}


async function createSignedStorageMediaUrl(
  bucket,
  path
) {
  if (!path) {
    return ''
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from(bucket)
    .createSignedUrl(
      path,
      60 * 60
    )

  if (
    error ||
    !data?.signedUrl
  ) {
    console.warn(
      `Unable to load media from ${bucket}:`,
      error?.message || 'Signed URL unavailable'
    )
    return ''
  }

  return data.signedUrl
}


async function getResidentAvatarUrl(
  patientId,
  fallbackUrl = ''
) {
  if (!patientId) {
    return fallbackUrl || ''
  }

  try {
    const {
      data: files,
      error: listError,
    } = await supabase.storage
      .from('patient-avatars')
      .list(
        patientId,
        {
          limit: 20,
        }
      )

    if (listError) {
      console.warn(
        'Unable to check resident profile photo:',
        listError.message
      )
      return fallbackUrl || ''
    }

    const fileNames =
      new Set(
        (files || [])
          .map(
            (file) =>
              file?.name
          )
          .filter(Boolean)
      )

    const extension =
      fileNames.has(
        'avatar.webp'
      )
        ? 'webp'
        : fileNames.has(
              'avatar.jpg'
            )
          ? 'jpg'
          : ''

    if (!extension) {
      return fallbackUrl || ''
    }

    const {
      data,
      error,
    } = await supabase.storage
      .from('patient-avatars')
      .createSignedUrl(
        `${patientId}/avatar.${extension}`,
        60 * 60 * 24 * 7
      )

    if (
      error ||
      !data?.signedUrl
    ) {
      console.warn(
        'Unable to load resident profile photo:',
        error?.message ||
          'Signed URL unavailable'
      )

      return fallbackUrl || ''
    }

    return (
      `${data.signedUrl}&v=${Date.now()}`
    )
  } catch (avatarError) {
    console.warn(
      'Unable to load resident profile photo:',
      avatarError
    )

    return fallbackUrl || ''
  }
}

function getCareDetails(resident) {
  if (!resident) {
    return []
  }

  return [
    {
      key: 'mobility',
      label: 'Mobility',
      value:
        resident.mobility ||
        'Not set',
      icon: BedDouble,
    },
    {
      key: 'assistance',
      label: 'Assistance',
      value:
        resident.assistance ||
        'Not set',
      icon: Accessibility,
    },
    {
      key: 'allergies',
      label: 'Allergies',
      value:
        resident.allergies ||
        'Not set',
      icon: TriangleAlert,
    },
    {
      key: 'diet',
      label: 'Diet',
      value:
        resident.diet ||
        'Not set',
      icon: Utensils,
    },
    {
      key: 'communication',
      label: 'Communication',
      value:
        resident.communication ||
        'Not set',
      icon: ActivityIcon,
    },
    {
      key: 'fallRisk',
      label: 'Fall Risk',
      value:
        resident.fall_risk ||
        'Not set',
      icon: ShieldCheck,
    },
  ]
}

function PrivateVideoPlayer({ src }) {
  const videoRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  function togglePlay() {
    const video = videoRef.current

    if (!video) return

    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  function toggleMute() {
    const video = videoRef.current

    if (!video) return

    video.muted = !video.muted
    setMuted(video.muted)
  }

  function handleSeek(event) {
    const video = videoRef.current

    if (!video) return

    const nextTime =
      Number(event.target.value)

    video.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  function handleFullscreen() {
    const video = videoRef.current

    if (!video) return

    if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {})
      return
    }

    if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen()
    }
  }

  return (
    <div className="private-video-player">
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        onPlay={() =>
          setPlaying(true)
        }
        onPause={() =>
          setPlaying(false)
        }
        onTimeUpdate={(event) =>
          setCurrentTime(
            event.currentTarget.currentTime
          )
        }
        onLoadedMetadata={(event) =>
          setDuration(
            event.currentTarget.duration || 0
          )
        }
        onEnded={() =>
          setPlaying(false)
        }
        onContextMenu={(event) =>
          event.preventDefault()
        }
      />

      {!playing && (
        <button
          type="button"
          className="private-video-big-play"
          onClick={togglePlay}
        >
          <Play
            size={28}
            fill="currentColor"
          />
        </button>
      )}

      <div className="private-video-controls">
        <button
          type="button"
          onClick={togglePlay}
        >
          {playing ? (
            <Pause
              size={18}
              fill="currentColor"
            />
          ) : (
            <Play
              size={18}
              fill="currentColor"
            />
          )}
        </button>

        <span className="private-video-time">
          {formatPlayerTime(currentTime)}
        </span>

        <input
          className="private-video-seek"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(
            currentTime,
            duration || 0
          )}
          onChange={handleSeek}
        />

        <span className="private-video-time">
          {formatPlayerTime(duration)}
        </span>

        <button
          type="button"
          onClick={toggleMute}
        >
          {muted ? (
            <VolumeX size={18} />
          ) : (
            <Volume2 size={18} />
          )}
        </button>

        <button
          type="button"
          onClick={handleFullscreen}
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </div>
  )
}

function MediaViewer({
  item,
  onClose,
}) {
  useEffect(() => {
    if (!item) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [item, onClose])

  if (!item) {
    return null
  }

  const type =
    getMediaType(item)

  const mediaUrl =
    resolveMediaPath(
      item.media_url ||
      item.thumbnail_url ||
      item.media_path ||
      item.thumbnail_path
    )

  return (
    <div
      className="media-viewer-backdrop"
      onClick={onClose}
    >
      <div
        className="media-viewer"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="media-viewer-header">
          <div>
            <span>
              {type === 'video'
                ? 'Video'
                : 'Photo'}
            </span>

            <strong>
              {item.title ||
                'Family Update'}
            </strong>
          </div>

          <button
            type="button"
            className="media-close-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="media-viewer-stage">
          {type === 'video' ? (
            <PrivateVideoPlayer
              src={mediaUrl}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={
                item.title ||
                'Family activity'
              }
              draggable="false"
              onContextMenu={(event) =>
                event.preventDefault()
              }
            />
          )}
        </div>

        <div className="media-viewer-copy">
          <span>
            {formatDateTime(
              item.created_at
            )}
          </span>

          {item.message && (
            <p>
              {item.message}
            </p>
          )}

          <div className="private-media-note">
            <ShieldCheck size={16} />

            Private family viewing
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityCard({
  item,
  compact = false,
  onOpen,
}) {
  const type =
    getMediaType(item)

  const preview =
    resolveMediaPath(
      item.thumbnail_url ||
      item.media_url ||
      item.thumbnail_path ||
      item.media_path
    )

  return (
    <article
      className={[
        'activity-card',
        compact
          ? 'compact'
          : '',
        type === 'video'
          ? 'video-card'
          : 'photo-card',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="activity-media"
        style={{
          backgroundImage:
            `url("${preview}")`,
        }}
        onClick={() =>
          onOpen(item)
        }
      >
        <div className="activity-media-overlay" />

        <div className="activity-type-badge">
          {type === 'video' ? (
            <>
              <Video size={14} />
              Video
            </>
          ) : (
            <>
              <Images size={14} />
              Photo
            </>
          )}
        </div>

        {type === 'video' && (
          <div className="activity-play-button">
            <Play
              size={22}
              fill="currentColor"
            />
          </div>
        )}
      </button>

      <div className="activity-card-content">
        <div className="activity-date">
          {formatDateTime(
            item.created_at
          )}
        </div>

        <h3>
          {item.title ||
            'Family Update'}
        </h3>

        {!compact &&
          item.message && (
            <p>
              {item.message}
            </p>
          )}
      </div>
    </article>
  )
}

function AppointmentCard({
  appointment,
  featured = false,
}) {
  if (!appointment) {
    return null
  }

  const formattedDate =
    formatFullDate(
      appointment.appointment_date
    )

  const dateParts =
    formattedDate.split(' ')

  return (
    <article
      className={
        featured
          ? 'appointment-card featured'
          : 'appointment-card'
      }
    >
      <div className="appointment-date-box">
        <strong>
          {dateParts[0] || ''}
        </strong>

        <span>
          {dateParts[1] || ''}
        </span>
      </div>

      <div>
        <div className="appointment-status">
          <CalendarDays size={14} />

          {getDayName(
            appointment.appointment_date
          )}
        </div>

        <h3>
          {appointment.purpose ||
            'Appointment'}
        </h3>

        <div className="appointment-meta">
          <span>
            <Clock size={15} />

            {formatTime(
              appointment.appointment_time
            )}
          </span>

          {appointment.place && (
            <span>
              <MapPin size={15} />

              {appointment.place}
            </span>
          )}
        </div>

        {appointment.notes && (
          <p>
            {appointment.notes}
          </p>
        )}
      </div>
    </article>
  )
}

function EmptyAppointment({
  type = 'upcoming',
}) {
  const upcoming =
    type === 'upcoming'

  return (
    <div className="appointment-empty-card">
      <div className="appointment-empty-icon">
        {upcoming ? (
          <CalendarDays size={24} />
        ) : (
          <Clock size={24} />
        )}
      </div>

      <div>
        <strong>
          {upcoming
            ? 'No upcoming appointment'
            : 'No past appointment'}
        </strong>

        <p>
          {upcoming
            ? 'There is no scheduled appointment at the moment. Future clinic or hospital visits will appear here.'
            : 'Previous appointment history will appear here once records are available.'}
        </p>
      </div>
    </div>
  )
}

function AnnouncementCard({
  item,
  featured = false,
}) {
  const announcementMediaType =
    String(
      item?.media_type || ''
    ).toLowerCase()

  const hasMedia =
    Boolean(item?.media_url)

  return (
    <article
      className={
        featured
          ? 'announcement-card featured'
          : 'announcement-card'
      }
    >
      <div className="announcement-icon">
        <Megaphone size={20} />
      </div>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <div className="announcement-meta">
          <span>
            {item.announcement_type ||
              'General'}
          </span>

          <span>
            {formatDateTime(
              item.created_at
            )}
          </span>
        </div>

        <h3>
          {item.title}
        </h3>

        <p>
          {item.message}
        </p>

        {hasMedia && (
          <div
            style={{
              width: '100%',
              marginTop: 14,
              overflow: 'hidden',
              borderRadius: 18,
              background:
                'rgba(236, 231, 221, 0.72)',
              border:
                '1px solid rgba(191, 177, 153, 0.28)',
            }}
          >
            {announcementMediaType ===
            'video' ? (
              <video
                src={item.media_url}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={(event) =>
                  event.preventDefault()
                }
                style={{
                  display: 'block',
                  width: '100%',
                  maxHeight:
                    featured
                      ? 520
                      : 420,
                  objectFit: 'contain',
                  background: '#111',
                }}
              />
            ) : (
              <img
                src={item.media_url}
                alt={
                  item.media_original_name ||
                  item.title ||
                  'Announcement'
                }
                loading="lazy"
                draggable="false"
                onContextMenu={(event) =>
                  event.preventDefault()
                }
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  maxHeight:
                    featured
                      ? 520
                      : 420,
                  objectFit: 'contain',
                  objectPosition: 'center',
                  margin: '0 auto',
                }}
              />
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default function App() {
  const [
    dark,
    setDark,
  ] = useState(false)

  const [
    greetingClock,
    setGreetingClock,
  ] = useState(
    () => new Date()
  )

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    familyCode,
    setFamilyCode,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    loginError,
    setLoginError,
  ] = useState('')

  const [
    authBusy,
    setAuthBusy,
  ] = useState(false)

  const [
    initializing,
    setInitializing,
  ] = useState(true)

  const [
    loggedIn,
    setLoggedIn,
  ] = useState(false)

  // Family Connect reads the Admin-published theme (view only).
  const { theme: publishedFestivalTheme } = useUaqVisualTheme(true)

  const [
    activeNav,
    setActiveNav,
  ] = useState('home')

  const [
    activityFilter,
    setActivityFilter,
  ] = useState('all')

  const [
    familyAccount,
    setFamilyAccount,
  ] = useState(null)

  const [
    resident,
    setResident,
  ] = useState(null)

  const [
    residentAvatarUrl,
    setResidentAvatarUrl,
  ] = useState('')

  const [
    appointments,
    setAppointments,
  ] = useState([])

  const [
    announcements,
    setAnnouncements,
  ] = useState([])

  const [
    activityItems,
    setActivityItems,
  ] = useState([])

  const [
    residentImageError,
    setResidentImageError,
  ] = useState(false)

  const [
    residentPhotoPreviewOpen,
    setResidentPhotoPreviewOpen,
  ] = useState(false)

  useEffect(() => {
    let cancelled = false

    setResidentImageError(false)

    if (!resident?.patient_id) {
      setResidentAvatarUrl('')
      return undefined
    }

    async function loadResidentAvatar() {
      const url =
        await getResidentAvatarUrl(
          resident.patient_id,
          resident.photo_url
        )

      if (!cancelled) {
        setResidentAvatarUrl(url)
      }
    }

    loadResidentAvatar()

    return () => {
      cancelled = true
    }
  }, [
    resident?.patient_id,
    resident?.photo_url,
  ])

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState(null)

  useEffect(() => {
    if (!residentPhotoPreviewOpen) {
      return undefined
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    function handleResidentPreviewKey(
      event
    ) {
      if (event.key === 'Escape') {
        setResidentPhotoPreviewOpen(
          false
        )
      }
    }

    window.addEventListener(
      'keydown',
      handleResidentPreviewKey
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleResidentPreviewKey
      )
    }
  }, [
    residentPhotoPreviewOpen,
  ])

  const [
    familyOnline,
    setFamilyOnline,
  ] = useState(
    () =>
      typeof navigator === 'undefined'
        ? true
        : navigator.onLine
  )

  useEffect(() => {
    const updateGreetingClock = () => {
      setGreetingClock(
        new Date()
      )
    }

    updateGreetingClock()

    const timer =
      window.setInterval(
        updateGreetingClock,
        60 * 1000
      )

    return () => {
      window.clearInterval(
        timer
      )
    }
  }, [])

  function getGreeting() {
    const hour =
      greetingClock.getHours()

    if (hour < 12) {
      return 'Good morning'
    }

    if (hour < 18) {
      return 'Good afternoon'
    }

    return 'Good evening'
  }

  function getMotivationalLine() {
    const lines = [
      'Like a fresh morning breeze, gentle care can brighten the day.',
      'Even on rainy days, warmth and comfort can still feel close.',
      'May today feel calm and steady, like a quiet walk through the forest.',
      'Like soft sunlight in the morning, small moments can bring great comfort.',
      'Even when the day feels hazy, care and connection remain close at heart.',
      'A peaceful day begins with gentle care and thoughtful moments.',
      'Like the calm after rain, quiet moments can bring comfort and ease.',
      'May today feel light, warm and comforting, like the morning sun.',
      'Like fresh air after a long day, care can bring a sense of calm.',
      'On bright sunny days or gentle rainy ones, every caring moment matters.',
      'Like a green and peaceful garden, comfort grows in small daily moments.',
      'May today bring a calm heart, a gentle pace and comforting moments.',
    ]

    const dayNumber =
      Math.floor(
        greetingClock.getTime() /
          (24 * 60 * 60 * 1000)
      )

    const sixHourSlot =
      Math.floor(
        greetingClock.getHours() / 6
      )

    const index =
      (dayNumber * 4 +
        sixHourSlot) %
      lines.length

    return lines[index]
  }

  async function loadFamilyData(user) {
    if (!user) {
      throw new Error(
        'No authenticated family account.'
      )
    }

    const {
      data: account,
      error: accountError,
    } = await supabase
      .from('family_accounts')
      .select(
        'id, full_name, phone, active, family_code, created_at'
      )
      .eq('id', user.id)
      .single()

    if (accountError) {
      throw new Error(
        'This login is not registered as a Family Connect account.'
      )
    }

    if (!account?.active) {
      throw new Error(
        'This Family Connect account is currently inactive.'
      )
    }

    if (
      typeof navigator === 'undefined' ||
      navigator.onLine
    ) {
      const {
        error: initialPresenceError,
      } = await supabase.rpc(
        'touch_family_presence'
      )

      if (initialPresenceError) {
        console.warn(
          'Initial Family presence write failed:',
          initialPresenceError.message
        )
      }
    }

    const {
      data: residentsData,
      error: residentError,
    } = await supabase.rpc(
      'get_my_family_residents'
    )

    if (residentError) {
      throw residentError
    }

    const linkedResident =
      residentsData?.[0] ||
      null

    let appointmentRows = []

    if (
      linkedResident?.patient_id
    ) {
      const {
        data,
        error,
      } = await supabase
        .from(
          'family_appointments'
        )
        .select('*')
        .eq(
          'patient_id',
          linkedResident.patient_id
        )
        .eq(
          'visible_to_family',
          true
        )
        .order(
          'appointment_date',
          {
            ascending: true,
          }
        )
        .order(
          'appointment_time',
          {
            ascending: true,
          }
        )

      if (error) {
        throw error
      }

      appointmentRows =
        data || []
    }

    const [
      announcementResult,
      updateResult,
    ] = await Promise.all([
      supabase
        .from(
          'family_announcements'
        )
        .select('*')
        .eq(
          'visible',
          true
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        ),

      supabase
        .from(
          'family_updates'
        )
        .select('*')
        .or(
          linkedResident?.patient_id
            ? `patient_id.eq.${linkedResident.patient_id},audience_type.eq.all_families`
            : 'audience_type.eq.all_families'
        )
        .eq(
          'visible_to_family',
          true
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        ),
    ])

    if (
      announcementResult.error
    ) {
      throw announcementResult.error
    }

    if (
      updateResult.error
    ) {
      throw updateResult.error
    }

    setFamilyAccount(account)

    setResident(
      linkedResident
        ? {
            ...linkedResident,
            initials:
              getResidentInitials(
                linkedResident.full_name
              ),
          }
        : null
    )

    setAppointments(
      appointmentRows
    )

    const announcementRows =
      await Promise.all(
        (announcementResult.data || []).map(
          async (item) => ({
            ...item,
            media_url:
              item.media_path
                ? await createSignedStorageMediaUrl(
                    'family-announcements',
                    item.media_path
                  )
                : '',
          })
        )
      )

    setAnnouncements(
      announcementRows
    )

    const updateRows =
      await Promise.all(
        (updateResult.data || []).map(
          async (item) => {
            const [
              mediaUrl,
              thumbnailUrl,
            ] = await Promise.all([
              item.media_path
                ? createSignedStorageMediaUrl(
                    'family-updates',
                    item.media_path
                  )
                : Promise.resolve(''),

              item.thumbnail_path
                ? createSignedStorageMediaUrl(
                    'family-updates',
                    item.thumbnail_path
                  )
                : Promise.resolve(''),
            ])

            return {
              ...item,
              media_url:
                mediaUrl || '',
              thumbnail_url:
                thumbnailUrl || '',
            }
          }
        )
      )

    setActivityItems(
      updateRows
    )

    setLoggedIn(true)
    setLoginError('')
  }

  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth
            .getSession()

        if (error) {
          throw error
        }

        if (
          data?.session?.user &&
          mounted
        ) {
          const storedActivity =
            Number(
              window.localStorage.getItem(
                FAMILY_LAST_ACTIVITY_KEY
              )
            )

          const activityExpired =
            Number.isFinite(
              storedActivity
            ) &&
            storedActivity > 0 &&
            (
              Date.now() -
              storedActivity
            ) >=
              FAMILY_INACTIVITY_LOGOUT_MS

          if (activityExpired) {
            await performLogout(true)
            return
          }

          if (
            !Number.isFinite(
              storedActivity
            ) ||
            storedActivity <= 0
          ) {
            window.localStorage.setItem(
              FAMILY_LAST_ACTIVITY_KEY,
              String(Date.now())
            )
          }

          await loadFamilyData(
            data.session.user
          )
        }
      } catch (error) {
        console.error(
          'Session restore error:',
          error
        )

        await supabase.auth
          .signOut()

        if (mounted) {
          setLoggedIn(false)
        }
      } finally {
        if (mounted) {
          setInitializing(false)
        }
      }
    }

    restoreSession()

    const {
      data: authListener,
    } =
      supabase.auth
        .onAuthStateChange(
          (event) => {
            if (
              event ===
                'SIGNED_OUT' &&
              mounted
            ) {
              setLoggedIn(false)
              setFamilyAccount(null)
              setResident(null)
              setResidentAvatarUrl('')
              setAppointments([])
              setAnnouncements([])
              setActivityItems([])
              setSelectedMedia(null)
            }
          }
        )

    return () => {
      mounted = false

      authListener
        ?.subscription
        ?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (
      !loggedIn ||
      !familyAccount?.id
    ) {
      return undefined
    }

    let stopped = false

    async function touchPresence() {
      if (
        typeof navigator !== 'undefined' &&
        !navigator.onLine
      ) {
        if (!stopped) {
          setFamilyOnline(false)
        }
        return
      }

      try {
        const {
          error: presenceError,
        } = await supabase.rpc(
          'touch_family_presence'
        )

        if (presenceError) {
          throw presenceError
        }

        if (!stopped) {
          setFamilyOnline(true)
        }
      } catch (presenceError) {
        console.warn(
          'Family presence heartbeat failed:',
          presenceError?.message ||
            presenceError
        )

        if (!stopped) {
          setFamilyOnline(false)
        }
      }
    }

    function handleOnline() {
      touchPresence()
    }

    function handleOffline() {
      setFamilyOnline(false)
    }

    function handleVisibility() {
      if (
        document.visibilityState ===
        'visible'
      ) {
        touchPresence()
      }
    }

    touchPresence()

    const heartbeatTimer =
      window.setInterval(
        touchPresence,
        30 * 1000
      )

    window.addEventListener(
      'online',
      handleOnline
    )

    window.addEventListener(
      'offline',
      handleOffline
    )

    document.addEventListener(
      'visibilitychange',
      handleVisibility
    )

    return () => {
      stopped = true

      window.clearInterval(
        heartbeatTimer
      )

      window.removeEventListener(
        'online',
        handleOnline
      )

      window.removeEventListener(
        'offline',
        handleOffline
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      )
    }
  }, [
    loggedIn,
    familyAccount?.id,
  ])

  useEffect(() => {
    if (!loggedIn) {
      return undefined
    }

    let timeoutId = null
    let logoutRunning = false

    const storedActivity =
      Number(
        window.localStorage.getItem(
          FAMILY_LAST_ACTIVITY_KEY
        )
      )

    let lastActivity =
      Number.isFinite(
        storedActivity
      ) &&
      storedActivity > 0
        ? storedActivity
        : Date.now()

    if (
      !Number.isFinite(
        storedActivity
      ) ||
      storedActivity <= 0
    ) {
      window.localStorage.setItem(
        FAMILY_LAST_ACTIVITY_KEY,
        String(lastActivity)
      )
    }

    function clearTimer() {
      if (timeoutId) {
        window.clearTimeout(
          timeoutId
        )
        timeoutId = null
      }
    }

    async function logoutIfInactive() {
      if (logoutRunning) {
        return
      }

      const elapsed =
        Date.now() -
        lastActivity

      if (
        elapsed <
        FAMILY_INACTIVITY_LOGOUT_MS
      ) {
        scheduleLogout()
        return
      }

      logoutRunning = true

      await performLogout(true)
    }

    function scheduleLogout() {
      clearTimer()

      const elapsed =
        Date.now() -
        lastActivity

      const remaining =
        Math.max(
          0,
          FAMILY_INACTIVITY_LOGOUT_MS -
            elapsed
        )

      if (remaining <= 0) {
        logoutIfInactive()
        return
      }

      timeoutId =
        window.setTimeout(
          logoutIfInactive,
          remaining
        )
    }

    function recordActivity() {
      if (logoutRunning) {
        return
      }

      lastActivity =
        Date.now()

      window.localStorage.setItem(
        FAMILY_LAST_ACTIVITY_KEY,
        String(lastActivity)
      )

      scheduleLogout()
    }

    function checkStoredActivity() {
      if (logoutRunning) {
        return
      }

      const stored =
        Number(
          window.localStorage.getItem(
            FAMILY_LAST_ACTIVITY_KEY
          )
        )

      if (
        Number.isFinite(stored) &&
        stored > lastActivity
      ) {
        lastActivity = stored
      }

      scheduleLogout()
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        'visible'
      ) {
        checkStoredActivity()
      }
    }

    const activityEvents = [
      'pointerdown',
      'keydown',
      'touchstart',
      'scroll',
    ]

    for (
      const eventName
      of activityEvents
    ) {
      window.addEventListener(
        eventName,
        recordActivity,
        {
          passive: true,
        }
      )
    }

    window.addEventListener(
      'focus',
      checkStoredActivity
    )

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )

    scheduleLogout()

    return () => {
      clearTimer()

      for (
        const eventName
        of activityEvents
      ) {
        window.removeEventListener(
          eventName,
          recordActivity
        )
      }

      window.removeEventListener(
        'focus',
        checkStoredActivity
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )
    }
  }, [loggedIn])

  async function handleLogin(event) {
    event.preventDefault()

    setLoginError('')

    const cleanCode =
      familyCode.trim()

    if (!cleanCode) {
      setLoginError(
        'Please enter your Family Code.'
      )

      return
    }

    if (!password) {
      setLoginError(
        'Please enter your PIN.'
      )

      return
    }

    const email =
      familyCodeToEmail(
        cleanCode
      )

    setAuthBusy(true)

    try {
      const {
        data,
        error,
      } =
        await supabase.auth
          .signInWithPassword({
            email,
            password,
          })

      if (error) {
        throw new Error(
          'Family Code or PIN is incorrect.'
        )
      }

      window.localStorage.setItem(
        FAMILY_LAST_ACTIVITY_KEY,
        String(Date.now())
      )

      await loadFamilyData(
        data.user
      )

      setActiveNav('home')
      setPassword('')
    } catch (error) {
      console.error(
        'Family login error:',
        error
      )

      await supabase.auth
        .signOut()

      setLoginError(
        error?.message ||
        'Unable to sign in.'
      )
    } finally {
      setAuthBusy(false)
    }
  }

  async function performLogout(
    inactivityTimeout = false
  ) {
    try {
      await supabase.rpc(
        'leave_family_presence'
      )
    } catch (presenceError) {
      console.warn(
        'Unable to mark family offline:',
        presenceError
      )
    }

    await supabase.auth
      .signOut()

    window.localStorage.removeItem(
      FAMILY_LAST_ACTIVITY_KEY
    )

    setLoggedIn(false)
    setFamilyAccount(null)
    setResident(null)
    setResidentAvatarUrl('')

    setAppointments([])
    setAnnouncements([])
    setActivityItems([])

    setSelectedMedia(null)

    setFamilyCode('')
    setPassword('')

    setActiveNav('home')
    setActivityFilter('all')

    if (inactivityTimeout) {
      setLoginError(
        'For your security, you were signed out after 10 minutes of inactivity.'
      )
    } else {
      setLoginError('')
    }
  }

  async function handleLogout() {
    await performLogout(false)
  }


  const now =
    Date.now()

  const upcomingAppointments =
    useMemo(
      () =>
        appointments
          .filter(
            (item) =>
              getAppointmentTimestamp(
                item
              ) >= now
          )
          .sort(
            (a, b) =>
              getAppointmentTimestamp(
                a
              ) -
              getAppointmentTimestamp(
                b
              )
          ),
      [appointments]
    )

  const pastAppointments =
    useMemo(
      () =>
        appointments
          .filter(
            (item) =>
              getAppointmentTimestamp(
                item
              ) < now
          )
          .sort(
            (a, b) =>
              getAppointmentTimestamp(
                b
              ) -
              getAppointmentTimestamp(
                a
              )
          ),
      [appointments]
    )

  const nextAppointment =
    upcomingAppointments[0] ||
    null

  const latestAnnouncement =
    announcements[0] ||
    null

  const previousAnnouncements =
    announcements.slice(1)

  const residentActivities =
    useMemo(() => {
      if (!resident) {
        return activityItems.filter(
          (item) =>
            item.audience_type ===
            'all_families'
        )
      }

      return activityItems.filter(
        (item) =>
          item.audience_type ===
            'all_families' ||
          item.patient_id ===
            resident.patient_id
      )
    }, [
      activityItems,
      resident,
    ])

  const filteredActivities =
    useMemo(() => {
      if (
        activityFilter ===
        'all'
      ) {
        return residentActivities
      }

      return residentActivities.filter(
        (item) =>
          getMediaType(item) ===
          activityFilter
      )
    }, [
      residentActivities,
      activityFilter,
    ])

  const careDetails =
    getCareDetails(resident)

  const activeBottomNav =
    activeNav === 'resident'
      ? 'home'
      : activeNav

  if (initializing) {
    return (
      <main
        className={
          dark
            ? 'app-shell dark'
            : 'app-shell'
        }
        data-uaq-season={publishedFestivalTheme}
      >
        <section className="startup-screen">
          <img
            src={seasonBrandLogo(publishedFestivalTheme)}
            alt="Family Connect"
          />

          <p>
            Securely connecting...
          </p>
        </section>
      </main>
    )
  }


if (!loggedIn) {
  return (
    <main className={dark ? 'app-shell dark' : 'app-shell'} data-uaq-season={publishedFestivalTheme}>
      <section className="uaq-nature-login uaq-nature-login--family">
        <div className="uaq-nature-login__stage">
          <div className="uaq-nature-login__botanical" aria-hidden="true" />
          <div className="uaq-nature-login__paper" aria-hidden="true" />
          <div className="uaq-nature-login__paper-edge" aria-hidden="true" />

          <button
            type="button"
            className="uaq-nature-login__theme"
            onClick={() => setDark((value) => !value)}
            aria-label={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={dark ? 'Light Mode' : 'Dark Mode'}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="uaq-nature-login__panel">
            <div className="uaq-nature-login__inner">
              <img
                className="uaq-nature-login__family-brand"
                src={seasonBrandLogo(publishedFestivalTheme)}
                alt="UAQ Family Connect"
              />

              <div className="uaq-nature-login__heading">
                <h1>Welcome Back</h1>
                <p>Sign in to your Family Connect account</p>
              </div>

              <form className="uaq-nature-login__form" onSubmit={handleLogin}>
                <label htmlFor="uaq-nature-family-code">Family Code</label>
                <div className="uaq-nature-login__input-row">
                  <Mail size={19} aria-hidden="true" />
                  <input
                    id="uaq-nature-family-code"
                    type="text"
                    name="family-code"
                    placeholder="Enter Family Code"
                    autoComplete="username"
                    value={familyCode}
                    onChange={(event) => setFamilyCode(event.target.value)}
                    disabled={authBusy}
                    required
                  />
                </div>

                <label htmlFor="uaq-nature-family-pin">PIN</label>
                <div className="uaq-nature-login__input-row">
                  <LockKeyhole size={19} aria-hidden="true" />
                  <input
                    id="uaq-nature-family-pin"
                    type={showPassword ? 'text' : 'password'}
                    name="pin"
                    placeholder="Enter your PIN"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={authBusy}
                    required
                  />
                  <button
                    type="button"
                    className="uaq-nature-login__eye"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {loginError && <div className="uaq-nature-login__error" role="alert">{loginError}</div>}

                <button type="submit" className="uaq-nature-login__submit" disabled={authBusy}>
                  {authBusy ? 'Signing in...' : 'Log in'}
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <div className="uaq-nature-login__rule"><span>Private family access</span></div>
              <p className="uaq-nature-login__help">Your family account is protected by UAQ Elderly Care Centre</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


  function renderPageTopbar(
    title,
    subtitle
  ) {
    return (
      <header className="page-topbar">
        <div>
          <span>
            Family Connect
          </span>

          <h1>
            {title}
          </h1>

          {subtitle && (
            <p>
              {subtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          className="home-icon-button"
          onClick={() =>
            setDark(
              (value) =>
                !value
            )
          }
        >
          {dark ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>
      </header>
    )
  }

  function renderHome() {
    return (
      <div className="home-app">
        <div className="uaq-blue-family-intro">
          <span>{getGreeting()},</span>
          <h1>Welcome to Family Connect</h1>
          <p>Stay close, no matter the distance.</p>
        </div>
        <section className="home-hero">
          <div className="home-hero-overlay" />

          <div className="home-hero-top">
            <div>
              <span>
                {getGreeting()},
              </span>

              <h1 className="hero-motivation">
                {getMotivationalLine()}
              </h1>
            </div>

            <button
              type="button"
              className="home-icon-button"
              onClick={() =>
                setDark(
                  (value) =>
                    !value
                )
              }
            >
              {dark ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>
          </div>

          <div className="home-hero-message">
            <Heart
              size={17}
              fill="currentColor"
            />

            A little closer,
            every day.
          </div>
        </section>

        {/* Quick links display only real account data; existing lists and permissions remain. */}
        <div className="uaq-blue-family-stats" aria-label="Family overview">
          <button type="button" onClick={() => setActiveNav('activity')}>
            <Images size={23} aria-hidden="true" />
            <strong>{residentActivities.length}</strong>
            <span>Activity Updates</span>
            <small>Available to your family</small>
          </button>
          <button type="button" onClick={() => setActiveNav('appointments')}>
            <CalendarDays size={23} aria-hidden="true" />
            <strong>{upcomingAppointments.length}</strong>
            <span>Appointments</span>
            <small>Upcoming</small>
          </button>
          <button type="button" onClick={() => setActiveNav('announcements')}>
            <Megaphone size={23} aria-hidden="true" />
            <strong>{announcements.length}</strong>
            <span>Announcements</span>
            <small>Visible to this account</small>
          </button>
          <button type="button" onClick={() => {
            setActivityFilter('photo')
            setActiveNav('activity')
          }}>
            <Images size={23} aria-hidden="true" />
            <strong>{residentActivities.filter((item) => getMediaType(item) === 'photo').length}</strong>
            <span>Shared Photos</span>
            <small>In your activity feed</small>
          </button>
        </div>

        <div className="home-scroll">
          <section>
            <div className="section-heading">
              <div>
                <span>
                  Resident
                </span>

                <h2>
                  Your loved one
                </h2>
              </div>
            </div>

            {resident ? (
              <button
                type="button"
                className="resident-card"
                onClick={() =>
                  setActiveNav(
                    'resident'
                  )
                }
              >
                <div
                  className="resident-avatar"
                  role="button"
                  tabIndex={0}
                  title="View resident photo"
                  onClick={(event) => {
                    event.stopPropagation()
                    setResidentPhotoPreviewOpen(
                      true
                    )
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault()
                      event.stopPropagation()
                      setResidentPhotoPreviewOpen(
                        true
                      )
                    }
                  }}
                  style={{
                    cursor: 'zoom-in',
                  }}
                >
                  {residentAvatarUrl &&
                  !residentImageError ? (
                    <img
                      key={
                        residentAvatarUrl
                      }
                      src={
                        residentAvatarUrl
                      }
                      alt={
                        resident.full_name
                      }
                      onError={() =>
                        setResidentImageError(
                          true
                        )
                      }
                    />
                  ) : (
                    <span>
                      {resident.initials}
                    </span>
                  )}
                </div>

                <div className="resident-card-copy">
                  <span>
                    Resident
                  </span>

                  <h3>
                    {resident.full_name}
                  </h3>

                  <p>
                    {resident.room_no ||
                      'Room not set'}
                  </p>
                </div>

                <div className="resident-status">
                  <span>
                    <CheckCircle2
                      size={14}
                    />

                    {resident
                      .care_status ||
                      'Not set'}
                  </span>

                  <ChevronRight
                    size={20}
                  />
                </div>
              </button>
            ) : (
              <div className="empty-card">
                No resident linked.
              </div>
            )}
          </section>

          <section>
            <div className="section-heading">
              <div>
                <span>
                  Today
                </span>

                <h2>
                  At a glance
                </h2>
              </div>
            </div>

            <div className="home-summary-grid">
              <button
                type="button"
                className="home-summary-card"
                onClick={() =>
                  setActiveNav(
                    'appointments'
                  )
                }
              >
                <div className="summary-icon">
                  <CalendarDays
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Next Appointment
                  </span>

                  <strong>
                    {nextAppointment
                      ? formatFullDate(
                          nextAppointment
                            .appointment_date
                        )
                      : 'No upcoming appointment'}
                  </strong>

                  <p>
                    {nextAppointment
                      ? formatTime(
                          nextAppointment
                            .appointment_time
                        )
                      : 'Nothing scheduled'}
                  </p>
                </div>

                <ChevronRight
                  size={18}
                />
              </button>

              <button
                type="button"
                className="home-summary-card"
                onClick={() =>
                  setActiveNav(
                    'announcements'
                  )
                }
              >
                <div className="summary-icon">
                  <Bell size={20} />
                </div>

                <div>
                  <span>
                    Latest Announcement
                  </span>

                  <strong>
                    {latestAnnouncement
                      ? latestAnnouncement
                          .title
                      : 'No announcement'}
                  </strong>

                  <p>
                    {latestAnnouncement
                      ? formatDateTime(
                          latestAnnouncement
                            .created_at
                        )
                      : 'You are all caught up'}
                  </p>
                </div>

                <ChevronRight
                  size={18}
                />
              </button>
            </div>
          </section>

          <section>
            <div className="section-heading">
              <div>
                <span>
                  Moments
                </span>

                <h2>
                  Latest Activity
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveNav(
                    'activity'
                  )
                }
              >
                See all

                <ChevronRight
                  size={16}
                />
              </button>
            </div>

            {residentActivities.length ? (
              <div className="home-activity-grid">
                {residentActivities
                  .slice(0, 2)
                  .map((item) => (
                    <ActivityCard
                      key={item.id}
                      item={item}
                      compact
                      onOpen={
                        setSelectedMedia
                      }
                    />
                  ))}
              </div>
            ) : (
              <div className="empty-card">
                No activity updates yet.
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }

  function renderActivity() {
    return (
      <div className="app-page standard-page">
        {renderPageTopbar(
          'Activity',
          'Photos, videos and moments shared privately for your family.'
        )}

        <div className="page-scroll">
          {resident && (
            <div className="linked-resident-strip">
              <div
                className="resident-mini-avatar"
                role="button"
                tabIndex={0}
                title="View resident photo"
                onClick={() =>
                  setResidentPhotoPreviewOpen(
                    true
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault()
                    setResidentPhotoPreviewOpen(
                      true
                    )
                  }
                }}
                style={{
                  cursor: 'zoom-in',
                }}
              >
                {residentAvatarUrl &&
                !residentImageError ? (
                  <img
                    key={
                      residentAvatarUrl
                    }
                    src={
                      residentAvatarUrl
                    }
                    alt={
                      resident.full_name
                    }
                    onError={() =>
                      setResidentImageError(
                        true
                      )
                    }
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span>
                    {resident.initials}
                  </span>
                )}
              </div>

              <div>
                <span>
                  Showing updates for
                </span>

                <strong>
                  {resident.full_name}
                </strong>
              </div>

              <BadgeCheck
                size={19}
              />
            </div>
          )}

          <div className="activity-filter-row">
            {activityFilters.map(
              (filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={
                    activityFilter ===
                    filter.key
                      ? 'activity-filter active'
                      : 'activity-filter'
                  }
                  onClick={() =>
                    setActivityFilter(
                      filter.key
                    )
                  }
                >
                  {filter.label}
                </button>
              )
            )}
          </div>

          {filteredActivities.length ? (
            <div className="activity-feed">
              {filteredActivities.map(
                (item) => (
                  <ActivityCard
                    key={item.id}
                    item={item}
                    compact
                    onOpen={
                      setSelectedMedia
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="empty-card">
              No activity updates available.
            </div>
          )}

          <div className="privacy-footer">
            <ShieldCheck
              size={18}
            />

            Photos and videos are
            shown privately inside
            Family Connect.
          </div>
        </div>
      </div>
    )
  }

  function renderAppointments() {
    return (
      <div className="app-page standard-page">
        {renderPageTopbar(
          'Appointments',
          'Upcoming and previous appointments for your linked resident.'
        )}

        <div className="page-scroll appointments-page-scroll">
          <section>
            <div className="section-heading">
              <div>
                <span>
                  Next
                </span>

                <h2>
                  Next Appointment
                </h2>
              </div>
            </div>

            {nextAppointment ? (
              <AppointmentCard
                appointment={
                  nextAppointment
                }
                featured
              />
            ) : (
              <EmptyAppointment
                type="upcoming"
              />
            )}
          </section>

          {upcomingAppointments
            .length > 1 && (
            <section>
              <div className="section-heading">
                <div>
                  <span>
                    Schedule
                  </span>

                  <h2>
                    Upcoming
                  </h2>
                </div>
              </div>

              <div className="appointment-list">
                {upcomingAppointments
                  .slice(1)
                  .map(
                    (appointment) => (
                      <AppointmentCard
                        key={
                          appointment.id
                        }
                        appointment={
                          appointment
                        }
                      />
                    )
                  )}
              </div>
            </section>
          )}

          <section>
            <div className="section-heading">
              <div>
                <span>
                  History
                </span>

                <h2>
                  Past Appointments
                </h2>
              </div>
            </div>

            {pastAppointments.length ? (
              <div className="appointment-list">
                {pastAppointments.map(
                  (appointment) => (
                    <AppointmentCard
                      key={
                        appointment.id
                      }
                      appointment={
                        appointment
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyAppointment
                type="past"
              />
            )}
          </section>
        </div>
      </div>
    )
  }

  function renderAnnouncements() {
    return (
      <div className="app-page standard-page">
        {renderPageTopbar(
          'Announcements',
          'Official announcements and family information from the care centre.'
        )}

        <div className="page-scroll">
          {latestAnnouncement ? (
            <>
              <section>
                <div className="section-heading">
                  <div>
                    <span>
                      Latest
                    </span>

                    <h2>
                      Latest Announcement
                    </h2>
                  </div>
                </div>

                <AnnouncementCard
                  item={
                    latestAnnouncement
                  }
                  featured
                />
              </section>

              {previousAnnouncements
                .length > 0 && (
                <section>
                  <div className="section-heading">
                    <div>
                      <span>
                        Earlier
                      </span>

                      <h2>
                        Previous Announcements
                      </h2>
                    </div>
                  </div>

                  <div className="announcement-list">
                    {previousAnnouncements.map(
                      (item) => (
                        <AnnouncementCard
                          key={item.id}
                          item={item}
                        />
                      )
                    )}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="announcement-empty-card">
              <div className="appointment-empty-icon">
                <Megaphone
                  size={24}
                />
              </div>

              <div>
                <strong>
                  No announcements
                </strong>

                <p>
                  New family notices
                  will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderResident() {
    if (!resident) {
      return null
    }

    return (
      <div className="app-page standard-page resident-page">
        <header className="page-topbar resident-topbar">
          <button
            type="button"
            className="home-icon-button"
            onClick={() =>
              setActiveNav('home')
            }
          >
            <ArrowLeft
              size={20}
            />
          </button>

          <div>
            <span>
              Resident
            </span>

            <h1>
              Care Summary
            </h1>

            <p>
              A simple family-friendly
              overview of daily care.
            </p>
          </div>
        </header>

        <div className="page-scroll resident-page-scroll">
          <section className="resident-profile-card">
            <div
              className="resident-profile-avatar"
              role="button"
              tabIndex={0}
              title="View resident photo"
              onClick={() =>
                setResidentPhotoPreviewOpen(
                  true
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' ||
                  event.key === ' '
                ) {
                  event.preventDefault()
                  setResidentPhotoPreviewOpen(
                    true
                  )
                }
              }}
              style={{
                cursor: 'zoom-in',
              }}
            >
              {residentAvatarUrl &&
              !residentImageError ? (
                <img
                  key={
                    residentAvatarUrl
                  }
                  src={
                    residentAvatarUrl
                  }
                  alt={
                    resident.full_name
                  }
                  onError={() =>
                    setResidentImageError(
                      true
                    )
                  }
                />
              ) : (
                <span>
                  {resident.initials}
                </span>
              )}
            </div>

            <div className="resident-profile-copy">
              <span>
                Resident
              </span>

              <h2>
                {resident.full_name}
              </h2>

              <p>
                <MapPin
                  size={15}
                />

                {resident.room_no ||
                  'Room not set'}
              </p>
            </div>

            <div className="resident-profile-status">
              <CheckCircle2
                size={16}
              />

              {resident
                .care_status ||
                'Not set'}
            </div>
          </section>

          <section>
            <div className="section-heading">
              <div>
                <span>
                  Overview
                </span>

                <h2>
                  Care Summary
                </h2>
              </div>
            </div>

            <p className="care-summary-intro">
              General care information
              for family reference.
            </p>

            <div className="family-care-ribbon-list">
              <article className="family-care-ribbon family-care-ribbon-sage">
                <div className="family-care-ribbon-tab">
                  <Heart
                    size={24}
                    fill="currentColor"
                  />

                  <strong>
                    Care Status
                    <span>|</span>
                    Mobility
                  </strong>
                </div>

                <div className="family-care-ribbon-body">
                  <div className="family-care-ribbon-value">
                    <span>
                      Care Status
                    </span>

                    <strong>
                      {resident.care_status ||
                        'Not set'}
                    </strong>
                  </div>

                  <div className="family-care-ribbon-divider" />

                  <div className="family-care-ribbon-value">
                    <span>
                      Mobility
                    </span>

                    <strong>
                      {resident.mobility ||
                        'Not set'}
                    </strong>
                  </div>
                </div>
              </article>

              <article className="family-care-ribbon family-care-ribbon-gold">
                <div className="family-care-ribbon-tab">
                  <Accessibility
                    size={24}
                  />

                  <strong>
                    Assistance
                    <span>|</span>
                    Allergies
                  </strong>
                </div>

                <div className="family-care-ribbon-body">
                  <div className="family-care-ribbon-value">
                    <span>
                      Assistance
                    </span>

                    <strong>
                      {resident.assistance ||
                        'Not set'}
                    </strong>
                  </div>

                  <div className="family-care-ribbon-divider" />

                  <div className="family-care-ribbon-value">
                    <span>
                      Allergies
                    </span>

                    <strong>
                      {resident.allergies ||
                        'Not set'}
                    </strong>
                  </div>
                </div>
              </article>

              <article className="family-care-ribbon family-care-ribbon-teal">
                <div className="family-care-ribbon-tab">
                  <Utensils
                    size={24}
                  />

                  <strong>
                    Diet
                    <span>|</span>
                    Communication
                  </strong>
                </div>

                <div className="family-care-ribbon-body">
                  <div className="family-care-ribbon-value">
                    <span>
                      Diet
                    </span>

                    <strong>
                      {resident.diet ||
                        'Not set'}
                    </strong>
                  </div>

                  <div className="family-care-ribbon-divider" />

                  <div className="family-care-ribbon-value">
                    <span>
                      Communication
                    </span>

                    <strong>
                      {resident.communication ||
                        'Not set'}
                    </strong>
                  </div>
                </div>
              </article>

              <article className="family-care-ribbon family-care-ribbon-olive">
                <div className="family-care-ribbon-tab">
                  <ShieldCheck
                    size={24}
                  />

                  <strong>
                    Fall Risk
                  </strong>
                </div>

                <div className="family-care-ribbon-body single">
                  <div className="family-care-ribbon-value">
                    <span>
                      Fall Risk
                    </span>

                    <strong>
                      {resident.fall_risk ||
                        'Not set'}
                    </strong>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <div className="family-care-note">
            <Heart
              size={19}
              fill="currentColor"
            />

            <div>
              <strong>
                Family Care Note
              </strong>

              <p>
                Care needs can change
                over time. Please contact
                the care team if you need
                more information.
              </p>
            </div>
          </div>

          <div className="privacy-footer">
            <Clock
              size={17}
            />

            Last updated:{' '}

            {resident.last_updated
              ? formatDateTime(
                  resident.last_updated
                )
              : 'Not yet updated'}
          </div>
        </div>
      </div>
    )
  }

  function renderAbout() {
    return (
      <div className="app-page standard-page about-page">
        {renderPageTopbar(
          'About',
          'Your Family Connect account and application information.'
        )}

        <div className="page-scroll about-scroll">

          <section className="about-section-card">
            <div className="about-section-heading">
              <div className="about-section-icon">
                <Heart size={21} />
              </div>

              <div>
                <span>
                  Family Connection
                </span>

                <h2>
                  Stay connected with care
                </h2>

                <p>
                  Family Connect gives authorised
                  family members one private place
                  to view resident updates,
                  appointments, announcements,
                  photos and videos.
                </p>
              </div>
            </div>

            <div className="app-info-grid">
              <article>
                <ShieldCheck
                  size={21}
                />

                <div>
                  <strong>
                    Private Access
                  </strong>

                  <p>
                    Access is limited to
                    authorised family accounts.
                  </p>
                </div>
              </article>

              <article>
                <Images
                  size={21}
                />

                <div>
                  <strong>
                    Family Updates
                  </strong>

                  <p>
                    View activity photos,
                    videos and centre updates.
                  </p>
                </div>
              </article>

              <article>
                <CalendarDays
                  size={21}
                />

                <div>
                  <strong>
                    Care Information
                  </strong>

                  <p>
                    Keep track of appointments
                    and general care information.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <div className="about-top-grid">
            <section className="about-account-card">
              <div className="about-account-icon">
                <ShieldCheck
                  size={25}
                />
              </div>

              <div>
                <span>
                  Family Account
                </span>

                <p>
                  {familyAccount
                    ?.family_code ||
                    'Family Connect'}
                </p>
              </div>

              <BadgeCheck
                size={22}
                aria-label={
                  familyOnline
                    ? 'Online'
                    : 'Offline'
                }
                title={
                  familyOnline
                    ? 'Online'
                    : 'Offline'
                }
                style={{
                  color:
                    familyOnline
                      ? '#0f8f86'
                      : '#a8afad',
                  filter:
                    familyOnline
                      ? 'drop-shadow(0 0 8px rgba(15, 143, 134, 0.18))'
                      : 'none',
                  transition:
                    'color 160ms ease, filter 160ms ease',
                }}
              />
            </section>

          </div>

          <section className="about-section-card">
            <div className="about-section-heading">
              <div className="about-section-icon">
                <Sparkles
                  size={21}
                />
              </div>

              <div>
                <span>
                  Software Update
                </span>

                <h2>
                  Family Connect
                </h2>

                <p>
                  Current application version
                  and release information.
                </p>
              </div>
            </div>

            <div className="about-version-grid">
              <div className="version-card">
                <Layers3
                  size={20}
                />

                <div>
                  <span>
                    Version
                  </span>

                  <strong>
                    {APP_VERSION}
                  </strong>
                </div>
              </div>

              <div className="version-card">
                <ActivityIcon
                  size={20}
                />

                <div>
                  <span>
                    Build
                  </span>

                  <strong>
                    {APP_BUILD}
                  </strong>
                </div>
              </div>

              <div className="version-card">
                <CalendarDays
                  size={20}
                />

                <div>
                  <span>
                    Released
                  </span>

                  <strong>
                    {RELEASE_DATE}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <div className="about-details-grid">
            <section className="about-section-card">
              <div className="about-section-heading">
                <div className="about-section-icon">
                  <Info size={21} />
                </div>

                <div>
                  <span>
                    Privacy
                  </span>

                  <h2>
                    Family privacy
                  </h2>

                  <p>
                    Designed for secure
                    family viewing.
                  </p>
                </div>
              </div>

              <div className="app-info-grid">
                <article>
                  <ShieldCheck
                    size={21}
                  />

                  <div>
                    <strong>
                      Secure Access
                    </strong>

                    <p>
                      Only authorised
                      family accounts
                      can sign in.
                    </p>
                  </div>
                </article>

                <article>
                  <Images
                    size={21}
                  />

                  <div>
                    <strong>
                      Private Viewing
                    </strong>

                    <p>
                      Family media is
                      viewed inside
                      Family Connect.
                    </p>
                  </div>
                </article>

                <article>
                  <MonitorSmartphone
                    size={21}
                  />

                  <div>
                    <strong>
                      Any Device
                    </strong>

                    <p>
                      Optimised for phone,
                      tablet and desktop.
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <button
            type="button"
            className="sign-out-button"
            onClick={
              handleLogout
            }
          >
            <LogOut
              size={18}
            />

            Sign Out
          </button>
        </div>
      </div>
    )
  }

  function renderActivePage() {
    switch (activeNav) {
      case 'activity':
        return renderActivity()

      case 'appointments':
        return renderAppointments()

      case 'announcements':
        return renderAnnouncements()

      case 'resident':
        return renderResident()

      case 'about':
        return renderAbout()

      case 'home':
      default:
        return renderHome()
    }
  }

  return (
    <main
      className={
        dark
          ? 'app-shell dark'
          : 'app-shell'
      }
      data-uaq-season={publishedFestivalTheme}
    >
      <div className="family-app-shell">
        <aside className="desktop-sidebar">

          <div className="sidebar-brand-art">
            <img
              src={seasonBrandLogo(publishedFestivalTheme)}
              alt="Family Connect"
            />
          </div>

          <nav className="desktop-nav">
            {navItems.map(
              (item) => {
                const Icon =
                  item.icon

                const selected =
                  activeBottomNav ===
                  item.key

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={
                      selected
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setActiveNav(
                        item.key
                      )
                    }
                  >
                    <Icon
                      size={20}
                    />

                    <span>
                      {item
                        .desktopLabel ||
                        item.label}
                    </span>
                  </button>
                )
              }
            )}
          </nav>

          <div className="sidebar-footer">
            <strong>
              Stay close,
              no matter the distance.
            </strong>

            <span>
              Private access for
              authorised family members.
            </span>

            <small>
              {familyAccount
                ?.family_code ||
                'Family Connect'}
            </small>
          </div>
        </aside>

        <section className="app-content">
          {renderActivePage()}
        </section>

        <nav className="mobile-bottom-nav">
          {navItems.map(
            (item) => {
              const Icon =
                item.icon

              const selected =
                activeBottomNav ===
                item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  className={
                    selected
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setActiveNav(
                      item.key
                    )
                  }
                >
                  <Icon
                    size={20}
                  />

                  <span>
                    {item.label}
                  </span>
                </button>
              )
            }
          )}
        </nav>

        {residentPhotoPreviewOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Resident photo preview"
            onClick={() =>
              setResidentPhotoPreviewOpen(
                false
              )
            }
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'grid',
              placeItems: 'center',
              padding: '22px',
              background:
                'rgba(12, 29, 25, .76)',
              backdropFilter:
                'blur(10px)',
              WebkitBackdropFilter:
                'blur(10px)',
              cursor: 'zoom-out',
            }}
          >
            <div
              style={{
                width:
                  'min(92vw, 430px)',
                padding:
                  '28px 24px 22px',
                display: 'flex',
                flexDirection:
                  'column',
                alignItems: 'center',
                border:
                  '1px solid rgba(255,255,255,.68)',
                borderRadius:
                  '32px',
                background:
                  dark
                    ? 'rgba(26,47,41,.98)'
                    : 'rgba(255,253,249,.98)',
                boxShadow:
                  '0 30px 90px rgba(0,0,0,.30)',
                textAlign: 'center',
                pointerEvents:
                  'none',
              }}
            >
              <div
                style={{
                  width:
                    'min(76vw, 320px)',
                  aspectRatio:
                    '1 / 1',
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                  border:
                    '5px solid rgba(255,255,255,.94)',
                  borderRadius: '50%',
                  background:
                    dark
                      ? '#29453c'
                      : '#f3eee7',
                  boxShadow:
                    '0 0 0 2px rgba(60,154,139,.58), 0 16px 42px rgba(0,0,0,.18)',
                  color:
                    dark
                      ? '#e8f2ee'
                      : '#315f55',
                  fontSize: '72px',
                  fontWeight: 850,
                }}
              >
                {residentAvatarUrl &&
                !residentImageError ? (
                  <img
                    src={
                      residentAvatarUrl
                    }
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit:
                        'contain',
                      objectPosition:
                        'center',
                    }}
                  />
                ) : (
                  <span>
                    {resident?.initials ||
                      'R'}
                  </span>
                )}
              </div>

              <strong
                style={{
                  marginTop:
                    '20px',
                  color: dark
                    ? '#f1f6f4'
                    : '#203631',
                  fontSize: '21px',
                  lineHeight: 1.2,
                }}
              >
                {resident?.full_name ||
                  'Resident'}
              </strong>

              <small
                style={{
                  marginTop:
                    '12px',
                  color: dark
                    ? '#aebeb8'
                    : '#87948f',
                  fontSize: '11px',
                  fontWeight: 650,
                }}
              >
                Tap anywhere to close
              </small>
            </div>
          </div>
        )}

        <MediaViewer
          item={selectedMedia}
          onClose={() =>
            setSelectedMedia(null)
          }
        />
      </div>
    </main>
  )
}