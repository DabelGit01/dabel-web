# Dabel Resources Ventures Limited — Website

Corporate website and admin dashboard for **Dabel Resources Ventures Limited**: integrated marine logistics, procurement and environmental solutions (Rivers State, Nigeria).

Built on the Stalan platform (same admin, API and data model), with a new public front-end — the **Tidal** design: custom logo-draw preloader, cinematic hero slider, brochure-style "Title | Subtitle" sections, and full **light + dark mode** across the site and admin.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Prisma · **Supabase** (Postgres + Storage — the only backend) · iron-session · next-themes

## Getting started

```bash
npm install
cp .env.example .env.local        # fill in the values
npm run prisma:generate
npm run db:migrate                # applies prisma/migrations to Supabase
npm run db:seed                   # brochure content + super admin (needs ADMIN_PASSWORD)
npm run dev
```

Prisma CLI reads `.env`, not `.env.local` — either copy the DB variables into `.env` or export them in your shell before `db:migrate` / `db:seed`.

The public site renders brochure fallback content when the database is empty or unreachable, so pages never appear blank.

## Structure

```
app/
  (site)/            public site — layout adds Preloader, Navbar, Footer
    page.tsx         Home: hero slider → who we are → services → values → history → insights → certifications → contact
    about/           overview, values, history, vision & mission, founder, team, certifications, socials
    services/        services list (+ /services/[slug] detail)
    insights/        blog list with categories/search (+ /insights/[id] article)
    contact/         form → admin inbox, contact methods, map
  admin/             dashboard (unchanged features from Stalan, rebranded + themed)
  api/               public + admin API routes
  admin-theme.css    remaps legacy admin colours to theme tokens (dark mode)
components/
  brand/             DabelLogo / DabelMark (vector logo)
  site/              Preloader, Navbar, Footer, ThemeToggle, primitives, shared sections
  home/ about/ services/ insights/ contact/
lib/site.ts          brand constants, hero slides, brochure copy (fallbacks)
public/images/       photography extracted from the company brochure
```

Old Stalan URLs redirect: `/offers → /services`, `/blog → /insights`.

## Admin

Everything from Stalan is preserved: overview charts, messages inbox, services (offers) CRUD with gallery, blog posts / categories / newsletter / subscribers, site meta (landing copy, contact details, offices, socials, team, certifications), admins & permissions, devices. Theme toggle lives in the sidebar.

## Editing the hero

Hero slides live in `lib/site.ts` (`HERO_SLIDES`) — image, eyebrow, three headline lines, body and CTA.
