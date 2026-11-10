import { LuArrowUpRight, LuLink } from 'react-icons/lu'
import SocialIcon from '../components/SocialIcon'
import useSettings from '../utils/useSettings'
import useTitle from '../utils/useTitle'

const safeHref = url => /^mailto:/i.test(url) || /^https?:\/\//i.test(url) ? url : `https://${url}`

export default function Links () {
  useTitle('All links')
  const { socials, links } = useSettings()

  return (
    <section className='wrap page-top pb-16'>
      <div className='max-w-2xl mx-auto flex flex-col items-center'>
        <div className='w-20 h-20 rounded-[28px] bg-white border-2 border-[var(--outline)] shadow-[5px_5px_0_var(--outline)] flex items-center justify-center mb-6'>
          <img src='/brand/gdg-mark.png' alt='GDG on Campus BIT' className='w-14 h-14 object-contain' />
        </div>
        <p className='eyebrow mb-2'>GDG on Campus</p>
        <h1 className='title-1 text-center'>Everything in <b>one place</b></h1>
        <p className='text-[var(--muted)] text-center max-w-md mt-3 mb-8'>Follow along, join our events, and find the forms and resources from GDG on Campus BIT.</p>

        {!!links.length && (
          <div className='w-full flex flex-col gap-3 mb-8'>
            {links.map(link => (
              <a key={link._id || `${link.title}-${link.url}`} href={safeHref(link.url)} target='_blank' rel='noreferrer' className='card lift p-4 sm:p-5 flex items-center gap-4 group'>
                <span className='w-11 h-11 rounded-2xl bg-[var(--yellow-pa)] border-2 border-[var(--outline)] flex items-center justify-center shrink-0'><LuLink size={21} aria-hidden='true' /></span>
                <span className='min-w-0 flex-1'>
                  <span className='font-medium block truncate'>{link.title}</span>
                  {link.description && <span className='text-sm text-[var(--muted)] block truncate mt-0.5'>{link.description}</span>}
                </span>
                <LuArrowUpRight size={20} className='shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' aria-hidden='true' />
              </a>
            ))}
          </div>
        )}

        <div className='w-full'>
          <p className='mono text-xs text-[var(--muted)] text-center mb-3'>Find us online</p>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {socials.map(s => (
              <a key={s.key} href={safeHref(s.url)} target='_blank' rel='noreferrer' className='card lift p-4 flex flex-col items-center gap-2 text-center'>
                <span className='w-11 h-11 rounded-full bg-white border-2 border-[var(--outline)] flex items-center justify-center'><SocialIcon name={s.key} fallback={s.icon} className='w-5 h-5' /></span>
                <span className='text-sm font-medium truncate max-w-full'>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
        <a href='/' className='text-sm text-[var(--muted)] hover:underline mt-10'>gdgocbit.com</a>
      </div>
    </section>
  )
}
