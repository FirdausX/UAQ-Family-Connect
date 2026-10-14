// Media storage for Family Connect photos/videos and the dashboard video.
//
// Works like supabase.storage.from(bucket), but family media lives on Cloudflare R2
// (served by the UAQ worker) so Supabase egress stays low. Every call falls back to
// Supabase Storage if the worker cannot be reached or the file is not on R2.
//
//   mediaStorage.from(bucket).upload / createSignedUrl / remove / getPublicUrl / list
//
// Server switch tg_settings.media_r2_mode:
//   off  → uploads go to Supabase (files already on R2 still open)
//   test → only browsers with localStorage.uaq_media_r2 = '1' upload to R2
//   live → everyone uploads to R2; older files move over on first view
import { supabase } from './supabase'

export const MEDIA_WORKER = 'https://uaq-telegram-bot.uaq-ecc.workers.dev'
const R2_BUCKETS = new Set(['family-updates', 'family-announcements', 'emar-media'])
const TIMEOUT_MS = 8000

// Test mode applies automatically on preview links (*.pages.dev) — the live sites are untouched.
function testFlag() {
  try {
    return window.location.hostname.endsWith('.pages.dev')
  } catch {
    return false
  }
}

function withTimeout(promise, ms = TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

let configCache = null
let configAt = 0
async function config() {
  if (configCache && Date.now() - configAt < 5 * 60 * 1000) return configCache
  try {
    const r = await withTimeout(fetch(`${MEDIA_WORKER}/media/config`), 5000)
    configCache = r.ok ? await r.json() : { mode: 'off' }
  } catch {
    configCache = { mode: 'off', unreachable: true }
  }
  configAt = Date.now()
  return configCache
}

// true when this browser should put new files on R2
async function useR2ForNew() {
  const c = await config()
  return c.mode === 'live' || (c.mode === 'test' && testFlag())
}

async function accessToken() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || ''
}

// ---- signed links, batched (many cards ask at once → one request) ----
let queue = new Map()
let timer = null

function signViaWorker(key) {
  return new Promise((resolve) => {
    if (!queue.has(key)) queue.set(key, [])
    queue.get(key).push(resolve)
    if (!timer) timer = setTimeout(flush, 15)
  })
}

async function flush() {
  timer = null
  const batch = queue
  queue = new Map()
  const keys = [...batch.keys()]
  const answer = (key, url) => batch.get(key).forEach((resolve) => resolve(url))
  const token = await accessToken().catch(() => '')
  for (let i = 0; i < keys.length; i += 100) {
    const part = keys.slice(i, i + 100)
    let urls = {}
    if (token) {
      try {
        const r = await withTimeout(
          fetch(`${MEDIA_WORKER}/media/sign`, {
            method: 'POST',
            headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
            body: JSON.stringify({ keys: part, migrate: testFlag() }),
          })
        )
        if (r.ok) urls = (await r.json()).urls || {}
      } catch {
        urls = {}
      }
    }
    part.forEach((key) => answer(key, urls[key] || null))
  }
}

function r2Bucket(bucket) {
  const sb = () => supabase.storage.from(bucket)

  return {
    async upload(path, file, options = {}) {
      if (!(await useR2ForNew())) return sb().upload(path, file, options)
      // test mode: keep a Supabase copy too, so apps not yet switched still show the file
      if (configCache?.mode === 'test') {
        const copy = await sb().upload(path, file, options)
        if (copy.error) return copy
      }
      try {
        const token = await accessToken()
        const key = `${bucket}/${path}`
        const r = await fetch(
          `${MEDIA_WORKER}/media/upload?key=${encodeURIComponent(key)}${options.upsert ? '&upsert=1' : ''}`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
              'content-type': options.contentType || file?.type || 'application/octet-stream',
            },
            body: file,
          }
        )
        const body = await r.json().catch(() => ({}))
        if (!r.ok) return { data: null, error: new Error(body.error || `Upload failed (${r.status})`) }
        return { data: { path, fullPath: key, id: key }, error: null }
      } catch (error) {
        return { data: null, error: new Error(`Upload failed: ${error.message}`) }
      }
    },

    async createSignedUrl(path, expiresIn, options) {
      if (path) {
        const url = await signViaWorker(`${bucket}/${path}`)
        if (url) return { data: { signedUrl: url }, error: null }
      }
      return sb().createSignedUrl(path, expiresIn, options)
    },

    async remove(paths = []) {
      const list = (paths || []).filter(Boolean)
      if (list.length) {
        try {
          const token = await accessToken()
          await withTimeout(
            fetch(`${MEDIA_WORKER}/media/delete`, {
              method: 'POST',
              headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
              body: JSON.stringify({ keys: list.map((p) => `${bucket}/${p}`) }),
            })
          )
        } catch (error) {
          console.warn('R2 delete failed:', error.message)
        }
      }
      return sb().remove(list)
    },

    // async (unlike Supabase): resolves to the worker link when R2 is in use
    async getPublicUrlAsync(path) {
      if (await useR2ForNew()) {
        return { data: { publicUrl: `${MEDIA_WORKER}/media/public/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}` } }
      }
      return sb().getPublicUrl(path)
    },

    getPublicUrl: (path, options) => sb().getPublicUrl(path, options),
    list: (...args) => sb().list(...args),
  }
}

export const mediaStorage = {
  from(bucket) {
    return R2_BUCKETS.has(bucket) ? r2Bucket(bucket) : supabase.storage.from(bucket)
  },
}
