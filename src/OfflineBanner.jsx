import { useEffect, useState } from 'react'

// Small, calm notice when the phone loses signal. The app shell itself keeps
// working thanks to the service worker; live data returns when back online.
export default function OfflineBanner() {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' && navigator.onLine === false
  )

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fc-offline" role="status">
      Tiada sambungan internet — paparan mungkin tidak terkini
    </div>
  )
}
