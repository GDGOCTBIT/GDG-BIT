import { useEffect, useState } from 'react'
import { LuArrowUpRight, LuImagePlus, LuPlus, LuRefreshCw, LuTrash2, LuUpload } from 'react-icons/lu'
import { toast } from 'sonner'
import { api } from '../../utils/api'
import LinkThumb from '../../components/LinkThumb'
import { linkHost } from '../../utils/links'
import { compressPhoto } from '../../utils/imageCompress'
import { refreshSettings } from '../../utils/useSettings'

const blankLink = () => ({ title: '', url: '', category: '', description: '', image: '' })

const trimmed = (value, max) => String(value || '').trim().slice(0, max)

export default function AdminLinks () {
  const [links, setLinks] = useState(null)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState({})

  const load = async () => {
    const response = await api('/admin/settings', { auth: true })
    if (!response.success) return toast.error(response.msg || 'Could not load links')
    setLinks(response.links || [])
  }
  useEffect(() => { load() }, [])

  const setBusyAt = (index, value) => setBusy(current => {
    const next = { ...current }
    if (value) next[index] = value
    else delete next[index]
    return next
  })

  const update = (index, field, value) => setLinks(current => current.map((link, i) => i === index ? { ...link, [field]: value } : link))
  const remove = index => setLinks(current => current.filter((_, i) => i !== index))

  const applyPreview = (index, preview, replaceImage = false) => setLinks(current => current.map((link, i) => {
    if (i !== index) return link
    return {
      ...link,
      image: preview.image && (replaceImage || !link.image) ? preview.image : link.image,
      title: link.title || trimmed(preview.title, 80),
      category: link.category || trimmed(preview.site, 40),
      description: link.description || trimmed(preview.description, 160)
    }
  }))

  const fetchPreview = async (index, { silent = false } = {}) => {
    const link = links?.[index]
    if (!link?.url) {
      if (!silent) toast.error('Add the destination URL first')
      return
    }
    setBusyAt(index, 'preview')
    const response = await api('/admin/links/preview', { method: 'POST', auth: true, body: { url: link.url } })
    setBusyAt(index, null)
    if (!response.success) {
      if (!silent) toast.error(response.msg || 'Could not fetch a preview — upload an image instead')
      return
    }
    const preview = response.preview || {}
    if (!preview.image) {
      if (!silent) toast.error('That page has no preview image — upload one instead')
      applyPreview(index, { ...preview, image: '' })
      return
    }
    applyPreview(index, preview, !silent)
    if (!silent) toast.success('Preview image added — remember to save links')
  }

  const upload = async (index, file) => {
    if (!file) return
    if (!/^image\//.test(file.type)) return toast.error('Choose an image file')
    setBusyAt(index, 'upload')
    try {
      // Shrink big photos in the browser so a phone screenshot uploads in a second.
      const { full } = await compressPhoto(file)
      const form = new FormData()
      form.append('file', full, 'link-preview.jpg')
      const response = await api('/admin/links/image', { method: 'POST', auth: true, body: form })
      if (!response.success) throw new Error(response.msg || 'Upload failed')
      update(index, 'image', response.url)
      toast.success('Preview image added — remember to save links')
    } catch (error) {
      toast.error(error.message || 'Could not upload that image')
    } finally {
      setBusyAt(index, null)
    }
  }

  const save = async event => {
    event.preventDefault()
    setSaving(true)
    const payload = links.map(link => ({
      title: link.title, url: link.url, category: link.category,
      description: link.description, image: link.image
    }))
    const response = await api('/admin/settings', { method: 'PUT', auth: true, body: { links: payload } })
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
          <p className='text-[var(--muted)] max-w-2xl'>Cards for registrations, resources, event pages, and posts. Paste a URL and a preview image is fetched automatically — or upload your own if the page has none.</p>
        </div>
        <a href='/links' target='_blank' rel='noreferrer' className='btn btn-ghost btn-sm'>View link page <LuArrowUpRight size={16} /></a>
      </div>

      {!links.length && (
        <div className='card p-8 text-center'>
          <LuImagePlus size={28} className='mx-auto mb-3' aria-hidden='true' />
          <p className='font-medium'>No featured links yet</p>
          <p className='text-sm text-[var(--muted)] mt-1'>Add your first card below — it shows up on the public links page instantly after saving.</p>
        </div>
      )}

      <div className='grid gap-4 lg:grid-cols-2'>
        {links.map((link, index) => (
          <article key={link._id || index} className='card overflow-hidden flex flex-col'>
            <div className='relative aspect-[16/9] bg-[var(--sunken)] border-b-2 border-[var(--outline)]'>
              <LinkThumb link={link} />
              <button type='button' onClick={() => remove(index)} className='absolute top-3 right-3 h-9 w-9 rounded-full border-2 border-[var(--outline)] bg-[var(--surface)] flex items-center justify-center' aria-label={`Remove ${link.title || 'link'}`}><LuTrash2 size={16} /></button>
            </div>

            <div className='flex flex-wrap gap-2 px-4 pt-3'>
              <label className='inline-flex h-8 items-center gap-1.5 rounded-full border-2 border-[var(--outline)] bg-[var(--surface)] px-3 text-xs font-medium cursor-pointer'>
                <LuUpload size={14} aria-hidden='true' />{busy[index] === 'upload' ? 'Uploading…' : link.image ? 'Replace image' : 'Upload image'}
                <input type='file' accept='image/*' hidden onChange={event => { upload(index, event.target.files?.[0]); event.target.value = '' }} />
              </label>
              <button type='button' onClick={() => fetchPreview(index)} disabled={!!busy[index]}
                className='inline-flex h-8 items-center gap-1.5 rounded-full border-2 border-[var(--outline)] bg-[var(--surface)] px-3 text-xs font-medium disabled:opacity-60'>
                <LuRefreshCw size={14} aria-hidden='true' className={busy[index] === 'preview' ? 'animate-spin' : ''} />
                {busy[index] === 'preview' ? 'Fetching…' : 'Fetch preview'}
              </button>
              {link.image && (
                <button type='button' onClick={() => update(index, 'image', '')} className='inline-flex h-8 items-center rounded-full px-2 text-xs text-[var(--muted)] hover:underline'>Remove image</button>
              )}
            </div>

            <div className='p-4 flex flex-col gap-3'>
              <input className='field' aria-label={`Link ${index + 1} title`} placeholder='Title, e.g. Event registration' value={link.title || ''} onChange={event => update(index, 'title', event.target.value)} />
              <input className='field' aria-label={`Link ${index + 1} URL`} type='text' inputMode='url' placeholder='https://…' value={link.url || ''}
                onChange={event => update(index, 'url', event.target.value)}
                onBlur={() => { if (!link.image && !busy[index]) fetchPreview(index, { silent: true }) }} />
              <input className='field' aria-label={`Link ${index + 1} category`} placeholder='Category under the title, e.g. Event' value={link.category || ''} onChange={event => update(index, 'category', event.target.value)} />
              <textarea className='field min-h-24' aria-label={`Link ${index + 1} description`} placeholder='What should visitors know before they open this link?' value={link.description || ''} onChange={event => update(index, 'description', event.target.value)} />
              <details>
                <summary className='text-xs text-[var(--muted)] cursor-pointer'>Advanced: image URL</summary>
                <input className='field mt-2' aria-label={`Link ${index + 1} preview image URL`} type='text' inputMode='url' placeholder='https://…/preview.jpg' value={link.image || ''} onChange={event => update(index, 'image', event.target.value)} />
                {link.url && <p className='text-xs text-[var(--muted)] mt-1 truncate'>Card links to {linkHost(link.url)}</p>}
              </details>
            </div>
          </article>
        ))}
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <button type='button' className='btn btn-ghost' onClick={() => setLinks([...links, blankLink()])}><LuPlus size={18} /> Add featured link</button>
        <button className='btn btn-ink' disabled={saving}>{saving ? 'Saving…' : 'Save links'}</button>
        <p className='text-xs text-[var(--muted)]'>Links saved without an image get one fetched automatically.</p>
      </div>
    </form>
  )
}
