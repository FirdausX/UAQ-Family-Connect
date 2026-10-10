import { useCallback, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

/**
 * A single published festival theme for UAQ eMAR and Family Connect.
 * The RLS-protected Supabase table is read by signed-in users.
 * Only an admin can publish a change through the checked RPC.
 * If the SQL is not installed yet, the existing Blue Sakura look remains.
 */
const VALID = new Set(['blue_sakura', 'hari_raya', 'christmas', 'chinese_new_year'])
const FALLBACK = 'blue_sakura'

export function useUaqVisualTheme(enabled = true) {
  const [theme, setTheme] = useState(FALLBACK)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    const { data, error: readError } = await supabase
      .from('uaq_visual_theme')
      .select('theme')
      .eq('id', 1)
      .maybeSingle()

    if (readError) {
      setError('Tema global belum tersedia. Jalankan fail SQL Theme Manager sekali di Supabase.')
    } else {
      setTheme(VALID.has(data?.theme) ? data.theme : FALLBACK)
      setError('')
    }
    setReady(true)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return undefined
    refresh()
    // Polling keeps other devices in sync without Realtime publication setup.
    const timer = window.setInterval(refresh, 300000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [enabled, refresh])

  const publish = useCallback(async (nextTheme) => {
    if (!VALID.has(nextTheme)) {
      setError('Pilihan tema tidak sah.')
      return false
    }
    setSaving(true)
    setError('')
    try {
      const { error: writeError } = await supabase.rpc(
        'publish_uaq_visual_theme', { p_theme: nextTheme }
      )
      if (writeError) throw writeError
      setTheme(nextTheme)
      return true
    } catch (issue) {
      setError(issue?.message || 'Tidak berjaya simpan tema. Sila cuba lagi.')
      return false
    } finally {
      setSaving(false)
    }
  }, [])

  return { theme, ready, error, saving, refresh, publish }
}
