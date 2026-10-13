import { useEffect, useState } from 'react'
import { BellOff, BellRing } from 'lucide-react'
import { supabase } from './lib/supabase'

/* =====================================================================
   📲 Phone notifications for families (Web Push).
   - The public key comes from the UAQ bot (it signs and sends the pushes).
   - Subscriptions are saved to family_push_subscriptions (RLS: own rows only).
   - useAutoResubscribe(): if this phone already allowed notifications,
     quietly renews the subscription when the key changed (no taps needed).
   ===================================================================== */

const KEY_URL = 'https://uaq-telegram-bot.uaq-ecc.workers.dev/push/public-key'

function supported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}
function isIosBrowserTab() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true
  return ios && !standalone
}
function toBytes(b64u) {
  const s = b64u.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}
function sameKey(a, b) {
  if (!a || !b) return false
  const x = new Uint8Array(a)
  return x.length === b.length && x.every((v, i) => v === b[i])
}
let keyPromise = null
function publicKey() {
  keyPromise = keyPromise || fetch(KEY_URL).then((r) => r.json()).then((j) => toBytes(j.publicKey))
  return keyPromise
}

async function subscribe(userId) {
  const key = await publicKey()
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (sub && !sameKey(sub.options?.applicationServerKey, key)) {
    await sub.unsubscribe().catch(() => {})
    sub = null
  }
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
  const j = sub.toJSON()
  const now = new Date().toISOString()
  const { error } = await supabase.from('family_push_subscriptions').upsert(
    {
      family_user_id: userId,
      endpoint: j.endpoint,
      p256dh: j.keys.p256dh,
      auth_key: j.keys.auth,
      user_agent: navigator.userAgent.slice(0, 250),
      enabled: true,
      updated_at: now,
      last_seen_at: now,
    },
    { onConflict: 'endpoint' }
  )
  if (error) throw new Error(error.message)
  return sub
}

export function useAutoResubscribe(familyAccount) {
  useEffect(() => {
    if (!familyAccount?.id || !supported() || Notification.permission !== 'granted') return
    subscribe(familyAccount.id).catch(() => {})
  }, [familyAccount?.id])
}

export default function PushOptIn({ familyAccount }) {
  const [state, setState] = useState('checking') // checking | on | off | blocked | unsupported | ios
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    let cancelled = false
    async function check() {
      if (!supported()) return setState(isIosBrowserTab() ? 'ios' : 'unsupported')
      if (Notification.permission === 'denied') return setState('blocked')
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = reg ? await reg.pushManager.getSubscription() : null
      if (!cancelled) setState(Notification.permission === 'granted' && sub ? 'on' : 'off')
    }
    check().catch(() => setState('off'))
    return () => {
      cancelled = true
    }
  }, [])

  async function turnOn() {
    setBusy(true)
    setNote('')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setState(perm === 'denied' ? 'blocked' : 'off')
        return
      }
      await subscribe(familyAccount.id)
      setState('on')
      setNote('Done. You will get a notification when the care team needs something.')
    } catch {
      setNote('Could not turn on notifications. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function turnOff() {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = reg ? await reg.pushManager.getSubscription() : null
      if (sub) {
        await supabase.from('family_push_subscriptions').update({ enabled: false, updated_at: new Date().toISOString() }).eq('endpoint', sub.endpoint)
        await sub.unsubscribe().catch(() => {})
      }
      setState('off')
      setNote('')
    } finally {
      setBusy(false)
    }
  }

  const text = {
    checking: 'Checking…',
    on: 'Notifications are on for this phone.',
    off: 'Get a notification when the care team needs items for your loved one.',
    blocked: 'Notifications are blocked. Allow them for this site in your phone settings, then come back.',
    unsupported: 'This browser cannot show notifications.',
    ios: 'On iPhone: tap Share → Add to Home Screen, then open Family Connect from the home screen to turn on notifications.',
  }[state]

  return (
    <section className="about-section-card fc-push">
      <div className="about-section-heading">
        <div className="about-section-icon">{state === 'on' ? <BellRing size={21} /> : <BellOff size={21} />}</div>
        <div>
          <span>Phone</span>
          <h2>Notifications</h2>
        </div>
      </div>
      <p className="fc-push__text">{text}</p>
      {state === 'off' && (
        <button type="button" className="fc-supplies__primary fc-supplies__wide" disabled={busy} onClick={turnOn}>
          {busy ? 'Turning on…' : 'Turn on notifications'}
        </button>
      )}
      {state === 'on' && (
        <button type="button" className="fc-supplies__ghost fc-supplies__wide" disabled={busy} onClick={turnOff}>
          Turn off
        </button>
      )}
      {note && <p className="fc-supplies__note">{note}</p>}
    </section>
  )
}
