# Frontend components

The React/Vite client supports TypeScript alongside existing JSX, Tailwind CSS 3,
and the shadcn directory convention. Run `npm ci` in this directory to install
its dependencies, `npm run dev` to preview, `npm run typecheck` to check TypeScript,
and `npm run build` to build.

- Shared UI: `src/components/ui/` (`@/components/ui`)
- Existing application components: `src/components/`
- Global styles and theme tokens: `src/base.css`
- Tailwind configuration: `tailwind.config.js`
- shadcn configuration: `components.json`
- Class merging helper: `src/lib/utils.ts` (`@/lib/utils`)

The UI directory keeps reusable primitives separate from application components
and gives shadcn CLI additions a consistent destination. From `client/`, use
`npx shadcn@latest add <component>` for future additions.

## Team lanyard rail

`src/components/ui/team-lanyard-rail.tsx` contains the supplied rail with its
spring simulation, pull/drag gestures, flip animation, keyboard controls, and
reduced-motion support. Contact icons use lucide-react. It needs no provider or
external state store. For controlled selection, pass `active`/`flipped` with
the corresponding change callbacks; otherwise it manages its own state.

The `/team` page uses the existing `/api/team` members, groups, portraits, and
contact links. Empty and failed responses keep the existing messages. Badges
use a silhouette if a portrait fails. The supplied badge layout shows up to
three contact links, three tags, and four lines of biography. The QR-like mark
and barcode are decorative, as in the supplied component.

A rail switches to a swipeable carousel when its container cannot fit all badges
at their minimum width. Arrow keys, Home/End, Enter/Space, and Escape provide
keyboard access; Arrow Down tugs a badge. Autoplay defaults to off on the real
Team page and stops on interaction when enabled.

`src/components/ui/team-lanyard-rail-demo.tsx` exports the standalone eight-person
demo, with Unsplash stock portraits and sample contact details. Import it into a
preview page when needed; those sample people are not used as the live team.
Theme colors reference the existing GDG light/dark palette via `--color-*` tokens.
