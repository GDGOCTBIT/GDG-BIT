import { useState } from 'react'
import { linkHost } from '../utils/links'

const TINTS = ['var(--blue-pa)', 'var(--green-pa)', 'var(--yellow-pa)', 'var(--red-pa)']

const tintOf = key => TINTS[[...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TINTS.length]

/**
 * Card image with a branded fallback: when a link has no picture (or it fails to load)
 * it still gets a pastel halftone preview with the site name, never an empty box.
 */
export default function LinkThumb ({ link, className = '' }) {
  const [broken, setBroken] = useState(false)
  const host = linkHost(link?.url)

  if (link?.image && !broken) {
    return <img src={link.image} alt='' loading='lazy' onError={() => setBroken(true)} className={`w-full h-full object-cover ${className}`} />
  }

  const tint = tintOf(host || link?.title || 'gdg')
  const initial = (link?.title || host || 'G').trim().charAt(0).toUpperCase()

  return (
    <span
      className={`w-full h-full flex flex-col items-center justify-center gap-1.5 px-3 text-center ${className}`}
      style={{
        backgroundColor: tint,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(30,30,30,0.18) 1px, transparent 0)',
        backgroundSize: '12px 12px',
        color: 'var(--black)'
      }}
    >
      <span className='w-9 h-9 rounded-full bg-white border-2 border-[var(--black)] flex items-center justify-center font-bold text-lg'>{initial}</span>
      <span className='mono text-[11px] truncate max-w-full'>{host || 'gdgocbit.com'}</span>
    </span>
  )
}
