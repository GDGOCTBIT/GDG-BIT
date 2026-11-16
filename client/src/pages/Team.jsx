import TeamLanyardRail from '@/components/ui/team-lanyard-rail'
import useApi from '../utils/useApi'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { sized } from '../utils/images'

const ORDER = ['Organizers', 'Leads', 'Core']
const MEMBERS_PER_RAIL = 4

export default function Team () {
  const { items, loading, error } = useApi('/team')
  const groups = items.reduce((acc, m) => {
    const g = m.team || 'Core'
    ;(acc[g] = acc[g] || []).push(m)
    return acc
  }, {})
  const names = Object.keys(groups).sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
  })

  return (
    <>
      <PageHeader tag='Team' title={<>The people behind <b>GDG on Campus BIT</b></>}
        text='Organizers and leads who plan the sessions, design the posters and keep the community running.' tone='yellow' dot='var(--yellow)' />
      <section className='wrap pt-10 flex flex-col gap-14'>
        {loading && (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
            {[0, 1, 2, 3].map(i => <div key={i} className='card h-72 skeleton' />)}
          </div>
        )}
        {error && <EmptyState title='Could not load the team' text={error} tone='red' />}
        {!loading && !error && !items.length && <EmptyState title='Team coming soon' />}
        {names.map((g) => (
          <div key={g}>
            <div className='flex items-center gap-3 mb-6'>
              <h2 className='title-2'>{g}</h2>
              <span className='pill'>{groups[g].length}</span>
            </div>
            <div className='flex flex-col gap-6'>
            {Array.from({ length: Math.ceil(groups[g].length / MEMBERS_PER_RAIL) }, (_, row) => (
            <TeamLanyardRail
              key={row}
              aria-label={`${g} team badges, row ${row + 1}`}
              className='rounded-3xl border border-[var(--hairline)]'
              items={groups[g].slice(row * MEMBERS_PER_RAIL, (row + 1) * MEMBERS_PER_RAIL).map((m, index) => {
                const i = row * MEMBERS_PER_RAIL + index
                return ({
                id: String(m._id || m.key || m.name),
                name: m.name,
                role: m.role,
                team: 'GDG on Campus BIT',
                image: sized(m.image?.url, 480) || '/user.svg',
                bio: m.bio,
                tags: [g],
                tone: (i % 4) + 1,
                links: [
                  { label: 'Community', href: m.profile },
                  { label: 'Website', href: m.website },
                  { label: 'LinkedIn', href: m.linkedin },
                  { label: 'GitHub', href: m.github },
                  { label: 'X', href: m.twitter },
                  { label: 'Instagram', href: m.instagram }
                ].filter(link => link.href)
              })})}
            />
            ))}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
