import SocialIcon from '../../components/SocialIcon'
import { LuArrowUpRight } from 'react-icons/lu'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../utils/api'
import { refreshSettings } from '../../utils/useSettings'
import { LuGripVertical, LuPlus, LuTrash2 } from 'react-icons/lu'

const HINTS = {
  email: 'name@example.com or mailto: link',
  discord: 'https://discord.gg/…',
  x: 'https://x.com/yourhandle'
}

export default function AdminSettings () {
  const [socials, setSocials] = useState(null)
  const [urls, setUrls] = useState({})
  const [live, setLive] = useState(0)
  const [override, setOverride] = useState('')
  const [links, setLinks] = useState([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const r = await api('/admin/settings', { auth: true })
    if (!r.success) return toast.error(r.msg || 'Could not load settings')
    setSocials(r.socials)
    setUrls(Object.fromEntries(r.socials.map(s => [s.key, s.url])))
    setLive(r.members.live)
    setOverride(r.members.override ?? '')
    setLinks(r.links || [])
  }
  useEffect(() => { load() }, [])

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    const res = await api('/admin/settings', { method: 'PUT', auth: true, body: { socials: urls, links, membersOverride: override } })
    setSaving(false)
    if (res.success) { toast.success(res.msg); refreshSettings(); load() } else toast.error(res.msg)
  }

  if (!socials) return <div className='card h-64 skeleton' />

  return (
    <form onSubmit={save} className='flex flex-col gap-8'>
      <div>
        <h2 className='title-2 mb-1'>Social links</h2>
        <p className='text-[var(--muted)]'>These appear in the home page “Find us online” section and the footer. Leave a field empty to hide that link.</p>
      </div>

      <div>
        <div className='flex flex-wrap items-end justify-between gap-3 mb-3'>
          <div>
            <h2 className='title-2 mb-1'>Important links</h2>
            <p className='text-[var(--muted)]'>Add forms, resources, newsletters, event pages, or anything else people should find quickly.</p>
          </div>
          <a href='/links' target='_blank' rel='noreferrer' className='btn btn-ghost btn-sm'>Open public page</a>
        </div>
        <div className='flex flex-col gap-3'>
          {links.map((link, index) => (
            <div key={link._id || index} className='card p-4 grid gap-3 md:grid-cols-[auto_1fr_1fr_auto] items-start'>
              <LuGripVertical className='text-[var(--muted)] mt-3 hidden md:block' aria-hidden='true' />
              <input className='field' aria-label={`Link ${index + 1} title`} placeholder='Title, e.g. Join our WhatsApp' value={link.title || ''}
                onChange={e => setLinks(links.map((x, i) => i === index ? { ...x, title: e.target.value } : x))} />
              <div className='flex flex-col gap-2'>
                <input className='field' aria-label={`Link ${index + 1} URL`} placeholder='https://…' value={link.url || ''}
                  onChange={e => setLinks(links.map((x, i) => i === index ? { ...x, url: e.target.value } : x))} />
                <input className='field' aria-label={`Link ${index + 1} description`} placeholder='Short description (optional)' value={link.description || ''}
                  onChange={e => setLinks(links.map((x, i) => i === index ? { ...x, description: e.target.value } : x))} />
              </div>
              <button type='button' className='btn btn-danger btn-icon btn-sm' aria-label={`Remove ${link.title || 'link'}`} onClick={() => setLinks(links.filter((_, i) => i !== index))}><LuTrash2 size={17} /></button>
            </div>
          ))}
        </div>
        <button type='button' className='btn btn-ghost btn-sm mt-3' onClick={() => setLinks([...links, { title: '', url: '', description: '' }])}><LuPlus size={17} /> Add link</button>
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        {socials.map(s => (
          <div key={s.key} className='card p-4 flex flex-col gap-2'>
            <label htmlFor={`s-${s.key}`} className='flex items-center gap-3'>
              <span className='w-10 h-10 rounded-full bg-white border-2 border-[var(--outline)] flex items-center justify-center shrink-0'>
                <SocialIcon name={s.key} fallback={s.icon} className='w-5 h-5' />
              </span>
              <span className='font-medium'>{s.label}</span>
              {!urls[s.key] && <span className='pill !py-0 ml-auto'>hidden</span>}
            </label>
            <div className='flex gap-2'>
              <input id={`s-${s.key}`} className='field' placeholder={HINTS[s.key] || `https://…`} value={urls[s.key] || ''}
                onChange={e => setUrls({ ...urls, [s.key]: e.target.value })} inputMode={s.key === 'email' ? 'email' : 'url'} />
              {s.default && urls[s.key] !== s.default && (
                <button type='button' className='btn btn-ghost btn-sm shrink-0' title='Restore the original link' onClick={() => setUrls({ ...urls, [s.key]: s.default })}>Reset</button>
              )}
            </div>
            {urls[s.key] && (
              <a href={/^mailto:/.test(urls[s.key]) || !/\./.test(urls[s.key]) ? undefined : (/^https?:/.test(urls[s.key]) ? urls[s.key] : `https://${urls[s.key]}`)} target='_blank' rel='noreferrer'
                className='text-xs text-[var(--muted)] hover:underline truncate'>Test link <LuArrowUpRight aria-hidden='true' size={13} className='inline -mt-0.5' /></a>
            )}
          </div>
        ))}
      </div>

      <div>
        <h2 className='title-2 mb-1'>Chapter members</h2>
        <p className='text-[var(--muted)] mb-3'>Shown on the home page. By default this is the live count from your GDG community page (<b>{live.toLocaleString('en-IN')}</b> right now).</p>
        <div className='flex flex-wrap items-end gap-3'>
          <div>
            <label className='label' htmlFor='mo'>Override (optional)</label>
            <input id='mo' type='number' min='0' className='field !w-48' placeholder={String(live)} value={override} onChange={e => setOverride(e.target.value)} />
          </div>
          {override !== '' && <button type='button' className='btn btn-ghost btn-sm' onClick={() => setOverride('')}>Use the live count</button>}
        </div>
      </div>

      <div><button className='btn btn-ink' disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
    </form>
  )
}
