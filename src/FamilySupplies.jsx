import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Check, ShoppingBag } from 'lucide-react'
import { supabase } from './lib/supabase'
import './family-supplies.css'

/* =====================================================================
   🛒 Items to bring — supplies the care team asked the FAMILY to buy.
   Data: rpc family_supply_list() (only my linked residents, family-bought
   items only). "I'll bring these" → rpc family_supply_pledge(ids, date).
   Renders nothing when there is nothing to bring.
   ===================================================================== */

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

export default function FamilySupplies({ focus = false }) {
  const [rows, setRows] = useState([])
  const [picking, setPicking] = useState(null) // patient_id being pledged
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const ref = useRef(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('family_supply_list')
    if (!error) setRows(data || [])
  }, [])

  useEffect(() => {
    load()
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  // Opened from a notification (?supplies=1): bring the card into view.
  useEffect(() => {
    if (focus && rows.length && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focus, rows.length])

  const groups = useMemo(() => {
    const map = new Map()
    for (const r of rows) {
      if (!map.has(r.patient_id)) map.set(r.patient_id, { id: r.patient_id, name: r.patient_name, items: [] })
      map.get(r.patient_id).items.push(r)
    }
    return [...map.values()]
  }, [rows])

  if (!groups.length) return null

  const today = malaysiaToday()
  const quick = [
    ['Today', today],
    ['Tomorrow', addDays(today, 1)],
    [niceDate(addDays(today, 2)).split(',')[0], addDays(today, 2)],
  ]

  async function pledge(group) {
    if (!date) return
    setBusy(true)
    setMessage('')
    const ids = group.items.map((r) => r.id)
    const { error } = await supabase.rpc('family_supply_pledge', { p_ids: ids, p_date: date })
    setBusy(false)
    if (error) {
      setMessage('Sorry, that did not go through. Please try again.')
      return
    }
    setPicking(null)
    setDate('')
    setMessage(`Thank you! The care team has been told you will bring these on ${niceDate(date)}.`)
    load()
  }

  return (
    <section className="fc-supplies" ref={ref} id="supplies">
      <div className="section-heading">
        <div>
          <span>Supplies</span>
          <h2>Items to bring</h2>
        </div>
      </div>

      {groups.map((g) => {
        const pledged = g.items.filter((r) => r.pledge_date)
        const allPledged = pledged.length === g.items.length
        return (
          <div className="fc-supplies__card" key={g.id}>
            <div className="fc-supplies__head">
              <div className="fc-supplies__icon">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span className="fc-supplies__eyebrow">Requested by the care team</span>
                <h3>For {g.name}</h3>
              </div>
            </div>

            <ul className="fc-supplies__list">
              {g.items.map((r) => (
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
              <button type="button" className="fc-supplies__primary fc-supplies__wide" onClick={() => { setPicking(g.id); setMessage('') }}>
                {allPledged ? 'Change delivery date' : "I'll bring these"}
              </button>
            )}
          </div>
        )
      })}

      {message && <p className="fc-supplies__note">{message}</p>}
    </section>
  )
}
