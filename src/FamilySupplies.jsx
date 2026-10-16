import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Check, MessageCircle, ShoppingBag } from 'lucide-react'
import { supabase } from './lib/supabase'
import { MEDIA_WORKER } from './lib/media'
import './family-supplies.css'

/* =====================================================================
   🛒 Supplies — one card per linked resident:
   • Items to bring: what the care team asked the FAMILY to buy
     (rpc family_supply_list) → "I'll bring these" (rpc family_supply_pledge)
   • Supply status: Enough / Running low / Needed — no numbers
     (rpc family_supply_status)
   • "Ask the care team": tells the store team on Telegram + the eMAR bell
     (worker /family/ask; once every 6 hours per resident)
   ===================================================================== */

const STATUS = {
  need: { label: 'Needed', className: 'is-need' },
  low: { label: 'Running low', className: 'is-low' },
  ok: { label: 'Enough', className: 'is-ok' },
}
const SHOW_FIRST = 6
// quantity kept in the store for this resident (lent items still count as theirs)
function qtyLabel(q) {
  const n = Math.max(0, Number(q) || 0)
  return n === 0 ? 'None left' : `${Number.isInteger(n) ? n : n.toFixed(1)} left`
}

function malaysiaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date())
}
function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
function niceDate(iso) {
  if (!iso) return ''
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}
function niceTime(iso) {
  return new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}

export default function FamilySupplies({ focus = false }) {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState([])
  const [picking, setPicking] = useState(null) // patient_id being pledged
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [asking, setAsking] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [message, setMessage] = useState({})
  const [askedIds, setAskedIds] = useState({})
  const ref = useRef(null)

  const load = useCallback(async () => {
    const [list, st] = await Promise.all([supabase.rpc('family_supply_list'), supabase.rpc('family_supply_status')])
    if (!list.error) setRows(list.data || [])
    if (!st.error) setStatus(Array.isArray(st.data) ? st.data : [])
  }, [])

  useEffect(() => {
    load()
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  // Opened from a notification (?supplies=1): bring the card into view.
  useEffect(() => {
    if (focus && (rows.length || status.length) && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focus, rows.length, status.length])

  const residents = useMemo(() => {
    const map = new Map()
    for (const s of status) map.set(s.patient_id, { id: s.patient_id, name: String(s.patient_name || '').trim(), askedAt: s.asked_at, asked: Boolean(askedIds[s.patient_id]), stock: s.items || [], bring: [] })
    for (const r of rows) {
      if (!map.has(r.patient_id)) map.set(r.patient_id, { id: r.patient_id, name: String(r.patient_name || '').trim(), askedAt: null, stock: [], bring: [] })
      map.get(r.patient_id).bring.push(r)
    }
    return [...map.values()]
  }, [rows, status, askedIds])

  if (!residents.length) return null

  const today = malaysiaToday()
  const quick = [
    ['Today', today],
    ['Tomorrow', addDays(today, 1)],
    [niceDate(addDays(today, 2)).split(',')[0], addDays(today, 2)],
  ]

  async function pledge(g) {
    if (!date) return
    setBusy(true)
    const ids = g.bring.map((r) => r.id)
    const { error } = await supabase.rpc('family_supply_pledge', { p_ids: ids, p_date: date })
    setBusy(false)
    if (error) {
      setMessage((m) => ({ ...m, [g.id]: 'Sorry, that did not go through. Please try again.' }))
      return
    }
    setPicking(null)
    setDate('')
    setMessage((m) => ({ ...m, [g.id]: `Thank you! The care team has been told you will bring these on ${niceDate(date)}.` }))
    load()
  }

  async function ask(g) {
    setAsking(g.id)
    setMessage((m) => ({ ...m, [g.id]: '' }))
    try {
      const { data } = await supabase.auth.getSession()
      const r = await fetch(`${MEDIA_WORKER}/family/ask`, {
        method: 'POST',
        headers: { authorization: `Bearer ${data?.session?.access_token || ''}`, 'content-type': 'application/json' },
        body: JSON.stringify({ patient_id: g.id }),
      })
      const res = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(res.error || 'failed')
      if (res.ok) setAskedIds((a) => ({ ...a, [g.id]: true }))
      setMessage((m) => ({
        ...m,
        [g.id]: res.ok
          ? 'Thank you — the care team has been asked. If anything is needed, the list will appear here and you will get a notification.'
          : `The care team was asked at ${niceTime(res.asked_at)}. You can ask again after ${niceTime(res.next_at || new Date(Date.parse(res.asked_at) + 30 * 60e3).toISOString())}.`,
      }))
      load()
    } catch {
      setMessage((m) => ({ ...m, [g.id]: 'Sorry, that did not go through. Please try again.' }))
    } finally {
      setAsking(null)
    }
  }

  return (
    <section className="fc-supplies" ref={ref} id="supplies">
      <div className="section-heading">
        <div>
          <span>Supplies</span>
          <h2>Supplies &amp; items to bring</h2>
        </div>
      </div>

      {residents.map((g) => {
        const pledged = g.bring.filter((r) => r.pledge_date)
        const allPledged = g.bring.length > 0 && pledged.length === g.bring.length
        const attention = g.stock.filter((i) => i.status !== 'ok').length
        const open = expanded[g.id]
        const shown = open ? g.stock : g.stock.slice(0, SHOW_FIRST)
        const askedRecently = g.askedAt && Date.now() - Date.parse(g.askedAt) < 30 * 60e3
        const askedBefore = Boolean(g.asked)
        return (
          <div className="fc-supplies__card" key={g.id}>
            <div className="fc-supplies__head">
              <div className="fc-supplies__icon">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span className="fc-supplies__eyebrow">
                  {g.bring.length ? 'Requested by the care team' : attention ? `${attention} item${attention > 1 ? 's' : ''} to check` : 'All looks good'}
                </span>
                <h3>For {g.name}</h3>
              </div>
            </div>

            {g.bring.length > 0 && (
              <>
                <p className="fc-supplies__sub">Items to bring</p>
                <ul className="fc-supplies__list">
                  {g.bring.map((r) => (
                    <li key={r.id}>
                      <span className="fc-supplies__dot" />
                      <span className="fc-supplies__item">{r.item_name}</span>
                      {r.pledge_date && (
                        <span className="fc-supplies__badge">
                          <Check size={12} /> {niceDate(r.pledge_date)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {picking === g.id ? (
                  <div className="fc-supplies__picker">
                    <span className="fc-supplies__ask">
                      <CalendarDays size={16} /> When can you bring them?
                    </span>
                    <div className="fc-supplies__dates">
                      {quick.map(([label, iso]) => (
                        <button type="button" key={iso} className={date === iso ? 'is-on' : ''} onClick={() => setDate(iso)}>
                          {label}
                        </button>
                      ))}
                      <input
                        type="date"
                        aria-label="Choose another date"
                        min={today}
                        max={addDays(today, 30)}
                        value={quick.some(([, iso]) => iso === date) ? '' : date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className="fc-supplies__actions">
                      <button type="button" className="fc-supplies__ghost" onClick={() => { setPicking(null); setDate('') }}>
                        Cancel
                      </button>
                      <button type="button" className="fc-supplies__primary" disabled={!date || busy} onClick={() => pledge(g)}>
                        {busy ? 'Sending…' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="fc-supplies__primary fc-supplies__wide" onClick={() => { setPicking(g.id); setMessage((m) => ({ ...m, [g.id]: '' })) }}>
                    {allPledged ? 'Change delivery date' : "I'll bring these"}
                  </button>
                )}
              </>
            )}

            <p className="fc-supplies__sub">Supply status</p>
            {g.stock.length ? (
              <ul className="fc-supplies__status">
                {shown.map((i) => (
                  <li key={i.name}>
                    <span className="fc-supplies__item">
                      {i.name}
                      {i.qty != null && <small className="fc-supplies__qty">{qtyLabel(i.qty)}</small>}
                    </span>
                    <span className={`fc-supplies__pill ${STATUS[i.status]?.className || ''}`}>{STATUS[i.status]?.label || ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="fc-supplies__empty">No supply records yet.</p>
            )}
            {g.stock.length > SHOW_FIRST && (
              <button type="button" className="fc-supplies__more" onClick={() => setExpanded((e) => ({ ...e, [g.id]: !open }))}>
                {open ? 'Show less' : `Show all (${g.stock.length})`}
              </button>
            )}

            <button type="button" className="fc-supplies__ghost fc-supplies__wide fc-supplies__askbtn" disabled={asking === g.id || askedRecently} onClick={() => ask(g)}>
              <MessageCircle size={16} />
              {askedRecently
                ? `Asked at ${niceTime(g.askedAt)} · ask again after ${niceTime(new Date(Date.parse(g.askedAt) + 30 * 60e3).toISOString())}`
                : asking === g.id ? 'Sending…' : askedBefore ? 'Ask the care team again' : 'Ask the care team'}
            </button>

            {message[g.id] && <p className="fc-supplies__note">{message[g.id]}</p>}
          </div>
        )
      })}
    </section>
  )
}
