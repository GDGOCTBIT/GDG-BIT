import { useEffect, useState } from 'react'
import { LuArrowUpRight, LuLink, LuX } from 'react-icons/lu'
import SocialIcon from '../components/SocialIcon'
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
    <section className='wrap page-top pb-16'>
      <div className='max-w-5xl mx-auto'>
        <header className='flex flex-col items-center text-center mb-10'>
          <div className='w-20 h-20 rounded-[28px] bg-white border-2 border-[var(--outline)] shadow-[5px_5px_0_var(--outline)] flex items-center justify-center mb-6'>
            <img src='/brand/gdg-mark.png' alt='GDG on Campus BIT' className='w-14 h-14 object-contain' />
          </div>
          <p className='eyebrow mb-2'>GDG on Campus</p>
          <h1 className='title-1'>Everything in <b>one place</b></h1>
          <p className='text-[var(--muted)] max-w-xl mt-3'>Follow along, join our events, and find every form, resource, and featured post from GDG on Campus BIT.</p>
        </header>

        <section aria-labelledby='social-title' className='mb-12'>
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

        {!!links.length && (
          <section aria-labelledby='featured-title'>
            <div className='flex items-end justify-between gap-4 mb-4'>
              <div><p className='eyebrow mb-1'>Explore more</p><h2 id='featured-title' className='title-2'>Featured links</h2></div>
              <p className='text-sm text-[var(--muted)] hidden sm:block'>Tap a card to learn more</p>
            </div>
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {links.map(link => (
                <button key={link._id || `${link.title}-${link.url}`} type='button' onClick={() => setSelected(link)} className='card lift text-left overflow-hidden group'>
                  <div className='aspect-[16/9] bg-[var(--sunken)] border-b-2 border-[var(--outline)]'>
                    {link.image ? <img src={link.image} alt='' className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]' /> : <div className='w-full h-full flex items-center justify-center bg-[var(--yellow-pa)]'><LuLink size={32} aria-hidden='true' /></div>}
                  </div>
                  <div className='p-4 flex gap-3 items-start'>
                    <span className='min-w-0 flex-1'>
                      <span className='font-medium block truncate'>{link.title}</span>
                      <span className='text-sm text-[var(--muted)] line-clamp-2 mt-1 min-h-10'>{link.description || 'Open this featured GDG on Campus BIT link.'}</span>
                    </span>
                    <LuArrowUpRight size={19} className='shrink-0 mt-0.5' aria-hidden='true' />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
        <a href='/' className='block text-center text-sm text-[var(--muted)] hover:underline mt-12'>gdgocbit.com</a>
      </div>

      {selected && (
        <div role='dialog' aria-modal='true' aria-labelledby='link-title' className='fixed inset-0 z-[60] bg-black/70 p-4 flex items-center justify-center' onClick={() => setSelected(null)}>
          <section className='card w-full max-w-lg overflow-hidden shadow-[6px_6px_0_var(--outline)]' onClick={event => event.stopPropagation()}>
            <div className='aspect-[16/9] bg-[var(--sunken)] relative'>
              {selected.image ? <img src={selected.image} alt='' className='w-full h-full object-cover' /> : <div className='w-full h-full flex items-center justify-center bg-[var(--yellow-pa)]'><LuLink size={42} aria-hidden='true' /></div>}
              <button type='button' onClick={() => setSelected(null)} className='btn btn-ghost btn-icon btn-sm absolute top-3 right-3' aria-label='Close link details'><LuX size={18} /></button>
            </div>
            <div className='p-5 sm:p-6'>
              <p className='eyebrow mb-2'>Featured link</p>
              <h2 id='link-title' className='title-2'>{selected.title}</h2>
              <p className='text-[var(--muted)] mt-3 leading-relaxed'>{selected.description || 'Open this featured GDG on Campus BIT link.'}</p>
              <div className='flex gap-3 mt-6'>
                <a href={safeHref(selected.url)} target='_blank' rel='noreferrer' className='btn btn-ink'>Visit link <LuArrowUpRight size={18} /></a>
                <button type='button' onClick={() => setSelected(null)} className='btn btn-ghost'>Close</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
