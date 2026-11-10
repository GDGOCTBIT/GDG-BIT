import { useEffect, useState } from 'react'
import { LuArrowUpRight, LuEllipsis, LuExternalLink, LuX } from 'react-icons/lu'
import PageHeader from '../components/PageHeader'
import SocialIcon from '../components/SocialIcon'
import LinkThumb from '../components/LinkThumb'
import { linkHost } from '../utils/links'
import useSettings from '../utils/useSettings'
import useTitle from '../utils/useTitle'

const safeHref = url => /^mailto:/i.test(url) || /^https?:\/\//i.test(url) ? url : `https://${url}`

export default function Links () {
  useTitle('All links')
  const { socials, links } = useSettings()
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const onKey = event => { if (event.key === 'Escape') setSelected(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <PageHeader
        tag='Links'
        title={<>Everything in <b>one place</b></>}
        text='Follow along, join our events, and find every form, resource, and featured post from GDG on Campus BIT.'
        tone='yellow'
        dot='var(--yellow)'
      />
      <section className='wrap pt-10 pb-16'>
        <div className='max-w-6xl mx-auto'>

          {!!links.length && (
            <section aria-labelledby='featured-title' className='mb-12'>
              <div className='flex items-end justify-between gap-4 mb-4'>
                <div><p className='eyebrow mb-1'>Explore more</p><h2 id='featured-title' className='title-2'>Featured links</h2></div>
                <p className='text-sm text-[var(--muted)] hidden sm:block'>Tap a card for details</p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {links.map(link => (
                  <button
                    key={link._id || `${link.title}-${link.url}`}
                    type='button'
                    onClick={() => setSelected(link)}
                    className='card lift text-left group flex flex-col'
                  >
                    <span className='block p-3 pb-0'>
                      <span className='block aspect-[16/9] overflow-hidden rounded-[16px] border-2 border-[var(--outline)] bg-[var(--sunken)]'>
                        <LinkThumb link={link} className='transition-transform duration-300 group-hover:scale-[1.04]' />
                      </span>
                    </span>
                    <span className='flex items-start gap-2 p-4 pt-3 min-w-0'>
                      <span className='min-w-0 flex-1'>
                        <span className='flex items-center gap-1.5 font-medium text-[15px]'>
                          <span className='truncate'>{link.title}</span>
                          <LuExternalLink size={14} className='shrink-0 opacity-60' aria-hidden='true' />
                        </span>
                        <span className='block text-xs text-[var(--muted)] mt-1 truncate'>{link.category || linkHost(link.url)}</span>
                      </span>
                      <span aria-hidden='true' className='w-8 h-8 shrink-0 rounded-[10px] border-2 border-[var(--outline)] flex items-center justify-center'>
                        <LuEllipsis size={16} />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby='social-title'>
            <div className='flex items-end justify-between gap-4 mb-4'>
              <div><p className='eyebrow mb-1'>Keep up</p><h2 id='social-title' className='title-2'>Our socials</h2></div>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
              {socials.map(s => (
                <a key={s.key} href={safeHref(s.url)} target='_blank' rel='noreferrer' className='card lift p-4 flex items-center gap-3'>
                  <span className='w-11 h-11 rounded-full bg-white border-2 border-[var(--outline)] flex items-center justify-center shrink-0'><SocialIcon name={s.key} fallback={s.icon} className='w-5 h-5' /></span>
                  <span className='text-sm font-medium truncate'>{s.label}</span>
                </a>
              ))}
            </div>
          </section>

          <a href='/' className='block text-center text-sm text-[var(--muted)] hover:underline mt-12'>gdgocbit.com</a>
        </div>
      </section>

      {selected && (
        <div role='dialog' aria-modal='true' aria-labelledby='link-title' className='fixed inset-0 z-[60] bg-black/70 p-4 flex items-center justify-center' onClick={() => setSelected(null)}>
          <section className='card relative w-full max-w-4xl shadow-[6px_6px_0_var(--outline)] max-h-[92vh] overflow-y-auto' onClick={event => event.stopPropagation()}>
            <button type='button' onClick={() => setSelected(null)} className='btn btn-ghost btn-icon btn-sm absolute top-4 right-4 z-10 bg-[var(--surface)]' aria-label='Close link details'><LuX size={18} /></button>
            <div className='relative w-full aspect-[16/9] bg-[var(--sunken)]'>
              <LinkThumb link={selected} />
            </div>
            <div className='p-6 sm:p-8'>
              <p className='eyebrow mb-2 truncate'>{selected.category || linkHost(selected.url) || 'Featured link'}</p>
              <h2 id='link-title' className='title-2'>{selected.title}</h2>
              <p className='text-[var(--muted)] mt-3 leading-relaxed'>{selected.description || 'Open this featured GDG on Campus BIT link.'}</p>
              <div className='flex flex-wrap gap-3 mt-6'>
                <a href={safeHref(selected.url)} target='_blank' rel='noreferrer' className='btn btn-ink'>Visit link <LuArrowUpRight size={18} /></a>
                <button type='button' onClick={() => setSelected(null)} className='btn btn-ghost'>Close</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
