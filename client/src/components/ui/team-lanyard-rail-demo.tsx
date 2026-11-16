"use client";

import TeamLanyardRail, {
  type LanyardMember,
} from "@/components/ui/team-lanyard-rail";

// Stock portraits are demo assets only; the Team page uses the actual /team data.
const portrait = (photo: string) =>
  `https://images.unsplash.com/${photo}?w=240&h=240&fit=crop&crop=faces`;
export const LANYARD_DEMO_TEAM: LanyardMember[] = [
  {
    id: "ada",
    name: "Ada Lindqvist",
    role: "Head of Design",
    team: "Acme · Design",
    tone: 1,
    image: portrait("photo-1494790108377-be9c29b29330"),
    bio: "Turns fuzzy product ideas into calm, honest interfaces. Runs the Friday design crit.",
    tags: ["Design systems", "Since 2019"],
    links: [
      { label: "Email", href: "mailto:ada@example.com" },
      { label: "Portfolio", href: "https://example.com" },
    ],
  },
  {
    id: "ravi",
    name: "Ravi Menon",
    role: "Engineering Lead",
    team: "Acme · Platform",
    tone: 2,
    image: portrait("photo-1500648767791-00dcc994a43e"),
    bio: "Keeps the build green and the on-call quiet. Happiest deleting old code.",
    tags: ["Platform", "Rust", "Since 2020"],
    links: [
      { label: "Email", href: "mailto:ravi@example.com" },
      { label: "Calendar", href: "https://example.com" },
    ],
  },
  {
    id: "imani",
    name: "Imani Okafor",
    role: "Product Manager",
    team: "Acme · Product",
    tone: 3,
    image: portrait("photo-1534528741775-53994a69daeb"),
    bio: "Talks to five customers a week and writes the one-page plan everyone actually reads.",
    tags: ["Research", "Since 2021"],
    links: [
      { label: "Email", href: "mailto:imani@example.com" },
      { label: "Notes", href: "https://example.com" },
    ],
  },
  {
    id: "kenji",
    name: "Kenji Arata",
    role: "iOS Engineer",
    team: "Acme · Mobile",
    tone: 4,
    image: portrait("photo-1506794778202-cad84cf45f1d"),
    bio: "Sweats the last 10% of every animation. Ships the app with a 99.9% crash-free rate.",
    tags: ["Swift", "Motion", "Since 2022"],
    links: [
      { label: "Email", href: "mailto:kenji@example.com" },
      { label: "Portfolio", href: "https://example.com" },
    ],
  },
  {
    id: "lucia",
    name: "Lucia Ferreira",
    role: "People & Culture",
    team: "Acme · People",
    tone: 5,
    image: portrait("photo-1517841905240-472988babdf9"),
    bio: "Hires kind, curious people and makes sure their first week feels like a welcome.",
    tags: ["Hiring", "Since 2018"],
    links: [
      { label: "Email", href: "mailto:lucia@example.com" },
      { label: "Open roles", href: "https://example.com" },
    ],
  },
  {
    id: "mateo",
    name: "Mateo Ruiz",
    role: "Backend Engineer",
    team: "Acme · Platform",
    tone: 2,
    image: portrait("photo-1519085360753-af0119f7cbe7"),
    bio: "Designs the APIs other teams love to call. Writes the docs before the code.",
    tags: ["APIs", "Go", "Since 2021"],
    links: [
      { label: "Email", href: "mailto:mateo@example.com" },
      { label: "Calendar", href: "https://example.com" },
    ],
  },
  {
    id: "mila",
    name: "Mila Novak",
    role: "Brand Designer",
    team: "Acme · Design",
    tone: 1,
    image: portrait("photo-1524504388940-b1c1722653e1"),
    bio: "Draws the illustrations, picks the type and guards the brand from clip art.",
    tags: ["Illustration", "Since 2023"],
    links: [
      { label: "Email", href: "mailto:mila@example.com" },
      { label: "Portfolio", href: "https://example.com" },
    ],
  },
  {
    id: "noah",
    name: "Noah Mensah",
    role: "Customer Success",
    team: "Acme · Support",
    tone: 3,
    image: portrait("photo-1506794778202-cad84cf45f1d"),
    bio: "Answers within the hour and turns every tricky ticket into a help-center article.",
    tags: ["Support", "Since 2020"],
    links: [
      { label: "Email", href: "mailto:noah@example.com" },
      { label: "Calendar", href: "https://example.com" },
    ],
  },
];
export default function TeamLanyardRailDemo({
  autoplay = true,
}: {
  autoplay?: boolean;
}) {
  return (
    <div
      data-lanyard-demo
      className="flex min-h-svh w-full items-center justify-center bg-background text-foreground"
    >
      <TeamLanyardRail
        items={LANYARD_DEMO_TEAM}
        eyebrow="Meet the team · Eight people"
        heading="A team wall you can flip through, right on the page."
        caption="Brush along the rail to meet someone, pull a badge down, click to flip it."
        autoplay={autoplay}
        action={
          <a
            href="mailto:careers@example.com"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-chart-2"
            />
            We're hiring
          </a>
        }
      />
    </div>
  );
}
