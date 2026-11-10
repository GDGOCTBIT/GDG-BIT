import { useEffect, useState } from 'react'
import { LuArrowUpRight, LuImage, LuPlus, LuTrash2 } from 'react-icons/lu'
import { toast } from 'sonner'
import { api } from '../../utils/api'
import { refreshSettings } from '../../utils/useSettings'

const blankLink = () => ({ title: '', url: '', description: '', image: '' })

export default function AdminLinks () {
  const [links, setLinks] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const response = await api('/admin/settings', { auth: true })
    if (!response.success) return toast.error(response.msg || 'Could not load links')
    setLinks(response.links || [])
  }
  useEffect(() => { load() }, [])

  const update = (index, field, value) => setLinks(links.map((link, current) => current === index ? { ...link, [field]: value } : link))
  const remove = index => setLinks(links.filter((_, current) => current !== index))
  const save = async event => {
    event.preventDefault()
    setSaving(true)
    const response = await api('/admin/settings', { method: 'PUT', auth: true, body: { links } })
    setSaving(false)
    if (!response.success) return toast.error(response.msg || 'Could not save links')
    toast.success(response.msg)
    refreshSettings()
    load()
  }

  if (!links) return <div className='card h-64 skeleton' />

  return (
    <form onSubmit={save} className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='eyebrow mb-2'>Public link page</p>
          <h2 className='title-2 mb-1'>Featured links</h2>
          <p className='text-[var(--muted)] max-w-2xl'>Create cards for registrations, resources, event pages, and posts. Add an image URL to give each card a visual preview.</p>
        </div>
        <a href='/links' target='_blank' rel='noreferrer' className='btn btn-ghost btn-sm'>View link page <LuArrowUpRight size={16} /></a>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        {links.map((link, index) => (
          <article key={link._id || index} className='card overflow-hidden'>
            <div className='h-36 bg-[var(--sunken)] border-b-2 border-[var(--outline)] relative'>
              {link.image ? <img src={link.image} alt='' className='w-full h-full object-cover' /> : <div className='w-full h-full flex items-center justify-center text-[var(--muted)]'><LuImage size={30} aria-hidden='true' /></div>}
              <button type='button' onClick={() => remove(index)} className='btn btn-danger btn-icon btn-sm absolute top-3 right-3 bg-[var(--surface)]' aria-label={`Remove ${link.title || 'link'}`}><LuTrash2 size={17} /></button>
            </div>
            <div className='p-4 flex flex-col gap-3'>
              <input className='field' aria-label={`Link ${index + 1} title`} placeholder='Title, e.g. Event registration' value={link.title || ''} onChange={event => update(index, 'title', event.target.value)} />
              <input className='field' aria-label={`Link ${index + 1} URL`} type='url' placeholder='https://…' value={link.url || ''} onChange={event => update(index, 'url', event.target.value)} />
              <input className='field' aria-label={`Link ${index + 1} preview image URL`} type='url' placeholder='Preview image URL (optional)' value={link.image || ''} onChange={event => update(index, 'image', event.target.value)} />
              <textarea className='field min-h-24' aria-label={`Link ${index + 1} description`} placeholder='What should visitors know before they open this link?' value={link.description || ''} onChange={event => update(index, 'description', event.target.value)} />
            </div>
          </article>
        ))}
      </div>

      <div className='flex flex-wrap gap-3'>
        <button type='button' className='btn btn-ghost' onClick={() => setLinks([...links, blankLink()])}><LuPlus size={18} /> Add featured link</button>
        <button className='btn btn-ink' disabled={saving}>{saving ? 'Saving…' : 'Save links'}</button>
      </div>
    </form>
  )
}
