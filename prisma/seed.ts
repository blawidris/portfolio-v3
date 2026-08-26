import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Bootstrap admin account. Reads ADMIN_EMAIL/ADMIN_PASSWORD directly
  // (not through lib/env.ts's getServerEnvironment(), which no longer
  // requires them at runtime) — these are seed-only credentials now that
  // login is database-backed.
  const bootstrapEmail = process.env.ADMIN_EMAIL
  const bootstrapPassword = process.env.ADMIN_PASSWORD
  if (!bootstrapEmail || !bootstrapPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the bootstrap admin account.")
  }

  // update: {} — never overwrite passwordHash on reseed, otherwise rotating
  // the password via the admin UI would silently revert on the next seed run.
  await prisma.admin.upsert({
    where: { email: bootstrapEmail.trim().toLowerCase() },
    update: {},
    create: {
      email: bootstrapEmail.trim().toLowerCase(),
      name: "Idris Lawal",
      passwordHash: await bcrypt.hash(bootstrapPassword, 12),
    },
  })

  // Footer links
  await prisma.footerLink.createMany({
    data: [
      { label: "GitHub", url: "https://github.com/blawidris", icon: "Github", order: 0 },
      { label: "LinkedIn", url: "https://linkedin.com/in/idrislawal", icon: "Linkedin", order: 1 },
      { label: "Twitter", url: "https://twitter.com/blawidris", icon: "Twitter", order: 2 },
      { label: "Email", url: "mailto:blawidris@gmail.com", icon: "Mail", order: 3 },
    ],
    skipDuplicates: true,
  })

  // Profile — singleton. update: {} so re-running seed never reverts edits
  // made later through the admin Settings page.
  await prisma.profile.upsert({
    where: { id: "profile" },
    update: {},
    create: {
      id: "profile",
      name: "Idris Lawal",
      headline: "I build the backend that makes SaaS scale.",
      tagline: "Senior software engineer specialising in distributed systems, multi-tenant SaaS, and cross-platform mobile apps — Lagos, Nigeria.",
      bio: [
        "I'm Idris Lawal — a senior software engineer based in Lagos, Nigeria. I specialise in building scalable SaaS backends, multi-tenant systems, and cross-platform mobile applications.",
        "My work spans fintech, logistics, edtech, and health-tech — always with a focus on reliability, performance, and the real constraints of building for African markets: variable connectivity, diverse devices, cost-conscious infrastructure.",
        "I believe great software is built through clear thinking, strong opinions loosely held, and an obsession with correctness. I care deeply about the craft.",
      ].join("\n\n"),
      philosophy: [
        "Correctness before performance — a fast wrong answer is worse than a slow right one.",
        "Design for the failure case first — distributed systems fail in interesting ways.",
        "Ship incrementally — large PRs are a risk surface, not a sign of effort.",
        "Measure before optimising — premature optimisation is still the root of most evil.",
        "Build for maintainability — future you will thank present you.",
      ],
      location: "Lagos, Nigeria",
      availability: "Available for work",
    },
  })

  // Experience — no natural unique key, so seed only creates entries that
  // don't already exist by (company, role); never overwrites admin edits.
  const experienceEntries = [
    {
      role: "Senior Software Engineer",
      company: "EonsFleet Mobility Solutions",
      period: "2022 – Present",
      description: "Architected a multi-tenant fleet management SaaS — real-time vehicle tracking, driver management, billing engine, and reporting dashboard. Serves logistics companies across West Africa.",
      isCurrent: true,
      order: 0,
    },
    {
      role: "Full-Stack Engineer",
      company: "TTS Nigeria / 3MTT Platform",
      period: "2023 – Present",
      description: "Building the technical training management platform for Nigeria's 3 Million Technical Talent programme. Multi-role auth, cohort management, progress tracking, and certificate issuance.",
      isCurrent: true,
      order: 1,
    },
    {
      role: "Backend Engineer",
      company: "Davton LMS",
      period: "2021 – 2022",
      description: "Designed and built the API for a learning management system — course delivery, assessment engine, multi-instructor support, and Paystack payments integration.",
      isCurrent: false,
      order: 2,
    },
    {
      role: "Mobile Engineer",
      company: "Paybills / PHR & Tele-consulting",
      period: "2020 – 2022",
      description: "Built cross-platform mobile applications using React Native — bill payments, health records management, and teleconsulting features with real-time video.",
      isCurrent: false,
      order: 3,
    },
  ]

  for (const entry of experienceEntries) {
    const existing = await prisma.experience.findFirst({ where: { company: entry.company, role: entry.role } })
    if (!existing) await prisma.experience.create({ data: entry })
  }

  // Skills — grouped using the site's own existing Uses-page taxonomy.
  // This is a starting point, editable anytime via /admin/skills.
  const skillCategories = [
    { name: "Languages & Runtimes", slug: "languages-runtimes", order: 0, skills: ["TypeScript", "Node.js"] },
    { name: "Frontend", slug: "frontend", order: 1, skills: ["Next.js", "Tailwind CSS", "Framer Motion"] },
    { name: "Mobile", slug: "mobile", order: 2, skills: ["React Native"] },
    { name: "Backend & Database", slug: "backend-database", order: 3, skills: ["PostgreSQL", "Prisma", "Redis", "Neon"] },
    { name: "Infrastructure", slug: "infrastructure", order: 4, skills: ["Docker", "AWS", "Vercel"] },
  ]

  for (const category of skillCategories) {
    const categoryRow = await prisma.skillCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: { name: category.name, slug: category.slug, order: category.order },
    })

    for (const [index, skillName] of category.skills.entries()) {
      const existing = await prisma.skill.findFirst({ where: { categoryId: categoryRow.id, name: skillName } })
      if (!existing) {
        await prisma.skill.create({ data: { name: skillName, categoryId: categoryRow.id, order: index } })
      }
    }
  }

  // Navigation — the current hardcoded Navbar links.
  const navigationItems = [
    { label: "Work", href: "/projects", order: 0 },
    { label: "Writing", href: "/writing", order: 1 },
    { label: "About", href: "/about", order: 2 },
    { label: "Uses", href: "/uses", order: 3 },
  ]

  for (const item of navigationItems) {
    const existing = await prisma.navigationItem.findFirst({ where: { href: item.href } })
    if (!existing) await prisma.navigationItem.create({ data: item })
  }

  // Projects
  const projects = [
    {
      title: "EonsFleet Mobility Solutions",
      slug: "eonsfleet-mobility-solutions",
      category: "work",
      description:
        "Fleet management SaaS built from the ground up for African logistics operators.",
      content: `## The Problem

African logistics operators had no reliable, affordable fleet management tool built for local market conditions — poor connectivity, high operational costs, and limited real-time visibility into vehicle movement. Most available tools were built for Western markets and priced accordingly.

## My Role

I joined as the sole backend engineer and eventually became Lead Engineer, taking ownership of architecture, DevOps, frontend migration, and client-facing technical work.

## Technical Decisions

- **Laravel monolith** — chosen for productivity and ecosystem maturity; premature microservices would have slowed the team down
- **PostgreSQL + Redis** — Postgres as the primary store, Redis for queues (Laravel Horizon) and caching
- **3-server AWS architecture (af-south-1)** — App server, DB server, cache server; region chosen for latency to Nigerian users
- **Terraform IaC** — all infrastructure version-controlled; reproducible environments
- **Leaflet + OpenStreetMap** — migrated from Google Maps to cut licensing costs without sacrificing UX
- **React/TypeScript frontend** — migrated from JavaScript using Atomic Design, Zustand for state, TanStack Query for server state

## Key Challenges & Solutions

**Redis queue crisis:** Discovered 9 million backed-up jobs in the queue caused by a misconfigured worker and a long-running job blocking shorter ones. Resolved by restructuring job queues into priority tiers, scaling Horizon workers, and draining the backlog without downtime or data loss.

**Frontend migration:** Migrated a large JavaScript codebase to TypeScript incrementally — new components written in TypeScript first, existing components migrated in priority order. Introduced Atomic Design system to enforce consistency across a growing codebase.

## Outcomes & Impact

- Platform in active production use by logistics operators
- Secured an **MTN Nigeria PoC trial agreement** — a major enterprise validation milestone
- Resolved infrastructure crises that would have caused data loss and extended downtime
- Reduced frontend bug rate significantly after TypeScript migration`,
      type: "web",
      status: "live",
      year: 2023,
      stack: ["Laravel", "PostgreSQL", "Redis", "React", "TypeScript", "AWS", "Terraform"],
      featured: true,
      order: 0,
    },
    {
      title: "TTS Nigeria / 3MTT Platform",
      slug: "tts-nigeria-3mtt-platform",
      category: "work",
      description:
        "Multi-tenant SaaS platform for BPO workforce development — part of Nigeria's 3MTT government initiative.",
      content: `## The Problem

Nigeria's 3 Million Technical Talent (3MTT) initiative needed a platform to manage BPO workforce development at scale — across multiple training providers, cohorts, and employer partners. The existing processes were manual, fragmented, and couldn't scale to the programme's ambitions.

## My Role

Lead Backend Engineer at Davton, responsible for architecture, implementation planning, and backend development of the platform.

## Technical Decisions

- **Multi-tenancy with row-level isolation** — each BPO client operates in the same database with strict tenant-scoped queries enforced at the repository layer; chosen over schema-per-tenant for operational simplicity at current scale
- **Participant FSM (Finite State Machine)** — participants move through defined states (enrolled → active → assessed → placed); state transitions are explicit and auditable
- **Provider abstraction layer** — assessment and identity providers (Skilladder, Prembly) are wrapped behind interfaces, making them swappable without business logic changes
- **BullMQ for async workloads** — bulk participant processing, notification dispatch, and report generation run as background jobs to keep API response times fast
- **Fastify over Express** — lower overhead, TypeScript-first, better schema validation via JSON Schema

## Architecture Overview

\`\`\`
API Layer (Fastify)
  └── Route handlers → Service layer → Repository layer → PostgreSQL
                    ↘ BullMQ job queue → Workers
                    ↘ Provider adapters (Skilladder, Prembly)
\`\`\`

Tenancy enforced at repository level — every query scopes by \`tenantId\` extracted from the JWT.

## Key Challenges & Solutions

**Assessment provider abstraction:** Different clients required different assessment providers. Built a provider interface with adapters per provider — the service layer never calls providers directly, only through the interface. Adding a new provider is a new adapter file, not a system change.

**Placement pipeline complexity:** Matching participants to job openings required considering skills, location, availability, and employer requirements simultaneously. Built a scoring-based pairing engine that produces ranked match lists, reviewable before placement is confirmed.

## Outcomes & Impact

- Platform actively in development with a deployment roadmap targeting end of May 2026
- Architecture supports onboarding new BPO tenants without schema changes
- Placement pipeline designed to handle thousands of participant-to-job matches per cohort`,
      type: "web",
      status: "in-progress",
      year: 2025,
      stack: ["Node.js", "TypeScript", "Fastify", "PostgreSQL", "BullMQ", "AWS"],
      featured: true,
      order: 1,
    },
    {
      title: "Davton LMS",
      slug: "davton-lms",
      category: "work",
      description:
        "Enterprise learning management system with SCORM player support — performance engineering on a Go + Laravel stack.",
      content: `## The Problem

The Davton LMS was serving enterprise clients but suffering from SCORM player performance degradation under concurrent load and periodic MySQL CPU saturation that was causing slow queries and cascading timeouts across the platform.

## My Role

Backend engineer at Davton — brought in to diagnose and resolve performance issues and contribute to ongoing feature development.

## Technical Decisions

- **Go (Fiber) for performance-critical paths** — SCORM player interactions, progress tracking, and content delivery moved to a Go service for its low overhead and goroutine-based concurrency
- **Laravel retained for content management** — admin workflows, course authoring, and reporting stay in Laravel where developer productivity matters more than raw throughput
- **MySQL query optimisation** — identified and rewrote slow queries; added missing indexes; restructured N+1 patterns

## Key Challenges & Solutions

**MySQL CPU saturation:** Diagnosed a critical issue where a scheduled Laravel command was overlapping with itself on each run — the command had no mutex/lock, so multiple instances ran concurrently, each issuing expensive queries. Resolved by implementing a cache-based lock that prevents concurrent execution, plus query optimisation to reduce the command's footprint even in the single-instance case.

**SCORM player degradation:** SCORM xAPI calls were hitting the Laravel monolith synchronously, creating a bottleneck under concurrent learner sessions. Moved SCORM interaction processing to the Go service with async persistence, reducing p99 response time significantly.

## Outcomes & Impact

- MySQL CPU saturation crisis resolved — platform stability restored
- SCORM player performance improved under concurrent load
- Architecture pattern established for future performance-critical features`,
      type: "web",
      status: "live",
      year: 2025,
      stack: ["Go", "Fiber", "Laravel", "PHP", "MySQL", "DigitalOcean"],
      featured: false,
      order: 2,
    },
    {
      title: "Paybills",
      slug: "paybills",
      category: "side-project",
      description:
        "Cross-platform fintech app for bills payment and event ticket booking.",
      content: `## The Problem

Paying utility bills and booking event tickets in Nigeria involves juggling multiple apps and platforms, each with inconsistent UX and reliability issues. Paybills consolidates both into a single, reliable mobile experience.

## My Role

Mobile engineer — responsible for the full React Native application, payment flow implementation, and third-party service integrations.

## Technical Decisions

- **React Native + TypeScript** — single codebase for iOS and Android; TypeScript enforced from the start to catch integration contract mismatches early
- **Payment gateway integration** — integrated a Nigerian payment provider API; handled webhook-based payment confirmation rather than polling to ensure reliability
- **Optimistic UI for ticket booking** — booking confirmations show immediately with background verification to reduce perceived latency on slower networks

## Key Challenges & Solutions

**Payment state management:** Payment flows have multiple intermediate states (initiated, pending, confirmed, failed) that need to survive app backgrounding and network drops. Implemented a persistent payment session store that resumes correctly on app reopen.

**Event ticket validation:** Tickets needed to be verifiable offline. Implemented QR code generation client-side with a signed payload — scannable without network connectivity at the venue gate.

## Outcomes & Impact

- App live on both iOS and Android
- Handles utility payments and event bookings in a single flow
- QR ticket system works reliably in low/no connectivity environments`,
      type: "mobile",
      status: "live",
      year: 2024,
      stack: ["React Native", "TypeScript"],
      featured: true,
      order: 3,
    },
    {
      title: "PHR & Tele-consulting",
      slug: "phr-tele-consulting",
      category: "side-project",
      description:
        "Personal health records and remote specialist consultation platform built with Flutter.",
      content: `## The Problem

Patients in Nigeria struggle with fragmented health records — results, prescriptions, and history spread across multiple hospitals with no portable record. Accessing specialists remotely was either unavailable or required expensive private clinic visits.

## My Role

Mobile engineer — built the Flutter application covering health record management, appointment booking, and tele-consultation flows.

## Technical Decisions

- **Flutter** — single codebase for iOS and Android with near-native performance; strong choice for a health app where UI consistency across platforms matters for user trust
- **Local-first health records** — patient records cached locally with encrypted storage; readable without network, synced when online
- **Video consultation** — integrated a third-party WebRTC SDK for video/audio calls within the app; text chat as a fallback

## Key Challenges & Solutions

**Sensitive data handling:** Health records required encryption at rest on device. Used Flutter Secure Storage for sensitive fields and structured the data model to distinguish between locally-only and synced records.

**Consultation scheduling across time zones:** Doctors and patients aren't always in the same location. Handled all scheduling in UTC server-side, displayed in the device's local timezone client-side.

## Outcomes & Impact

- Patients can carry a portable, consolidated health record accessible offline
- Remote consultations available without requiring in-person visits
- Appointment booking system reduces no-shows via in-app reminders`,
      type: "mobile",
      status: "live",
      year: 2023,
      stack: ["Flutter", "Dart"],
      featured: true,
      order: 4,
    },
    {
      title: "Aria — Car Renting App",
      slug: "aria-car-renting",
      category: "side-project",
      description: "On-demand car rental mobile application.",
      content: `## The Problem

Car rental in Nigeria is largely informal — finding available vehicles, confirming pricing, and completing the booking process is fragmented and unreliable. Aria brings the full rental experience into a structured mobile app.

## My Role

Mobile engineer — built the Flutter application covering browse, booking, and rental management flows.

## Technical Decisions

- **Flutter** — cross-platform from a single codebase with consistent UI across iOS and Android
- **Map integration** — integrated a map SDK for browsing available vehicles by location and showing pickup points
- **Booking state machine** — rental lifecycle (searched → reserved → active → returned) managed as explicit states to prevent invalid transitions

## Outcomes & Impact

- Full car rental flow available on iOS and Android
- Map-based vehicle discovery reduces friction in finding available cars nearby`,
      type: "mobile",
      status: "live",
      year: 2024,
      stack: ["Flutter", "Dart"],
      featured: false,
      order: 5,
    },
    {
      title: "Exam Attendance Marker",
      slug: "exam-attendance-marker",
      category: "side-project",
      description:
        "Offline-capable mobile app for exam supervisors to mark and manage attendance.",
      content: `## The Problem

Exam supervisors at institutions were managing attendance with paper sheets — error-prone, slow to process, and impossible to query after the fact. The app needed to work in environments with poor or no internet connectivity.

## My Role

Built the Flutter application end-to-end — UI, offline data layer, and sync logic.

## Technical Decisions

- **Flutter** — fast UI rendering important for a supervisor marking hundreds of students quickly
- **Offline-first with sync** — attendance records written locally first using SQLite; synced to the server when connectivity is available. Supervisors never lose data due to poor network.
- **Conflict resolution** — if two supervisors mark the same student (edge case), server-side last-write-wins with a local audit log

## Outcomes & Impact

- Supervisors can mark full exam halls without network dependency
- Attendance data available for querying and reporting immediately after sync
- Eliminated paper-based attendance errors`,
      type: "mobile",
      status: "live",
      year: 2023,
      stack: ["Flutter", "Dart"],
      featured: false,
      order: 6,
    },
  ]

  for (const { slug, ...data } of projects) {
    await prisma.project.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    })
  }

  // Blog posts
  const posts = [
    {
      title: "Multi-tenancy in SaaS: Row-Level vs Schema-Level Isolation",
      slug: "multi-tenancy-row-level-vs-schema-level",
      description:
        "A deep dive into the two dominant multi-tenancy patterns in SaaS — row-level isolation with RLS and schema-per-tenant — and when to choose each.",
      content: `# Multi-tenancy in SaaS: Row-Level vs Schema-Level Isolation

When building a SaaS product, one of the first architectural decisions you'll face is: how do you isolate tenant data in a shared database? The two dominant patterns are **row-level isolation** and **schema-per-tenant**. Both work. Neither is universally better.

## What is multi-tenancy?

Multi-tenancy means multiple customers (tenants) share the same application infrastructure — the same code, the same database cluster — while their data remains logically separated.

## Row-Level Isolation

In row-level isolation, all tenants share the same tables. Every row has a \`tenant_id\` column. Queries always filter by \`tenant_id\`.

\`\`\`sql
SELECT * FROM vehicles WHERE tenant_id = $1 AND deleted_at IS NULL;
\`\`\`

**Postgres Row Level Security (RLS)** takes this further — you configure security policies at the database level so the DB engine enforces tenant isolation, not just application code.

### Pros
- Single schema to migrate
- No per-tenant provisioning overhead
- Works well with connection poolers like PgBouncer

### Cons
- One bad query missing a \`tenant_id\` filter can leak data cross-tenant
- Harder to give tenants their own database dumps
- Index design becomes more complex

## Schema-Per-Tenant

Each tenant gets their own Postgres schema: \`tenant_acme.vehicles\`, \`tenant_beta.vehicles\`. The application switches the search path based on the current tenant.

### Pros
- Hard isolation boundary — cross-tenant leaks require schema confusion, not just a missing WHERE clause
- Easy per-tenant backup and restore
- Tenants can have slightly different schemas (careful with this)

### Cons
- Schema migrations must run N times (once per tenant)
- Connection pooling is harder — search paths invalidate pooled connections
- Provisioning a new tenant requires a DDL operation

## What I use in practice

For most SaaS I build, **row-level isolation with RLS** wins. The migration story is simpler, connection pooling works well with Neon, and RLS policies provide a meaningful safety net. Schema-per-tenant makes sense when you have regulatory requirements (GDPR data residency, healthcare), enterprise tenants who need isolated backups, or when per-tenant schema customisation is a product requirement.

The wrong answer is starting with schema-per-tenant because it "feels safer" and then discovering that your migration tooling can't handle 500 schemas at once.`,
      tags: ["SaaS", "PostgreSQL", "Architecture", "Multi-tenancy"],
      readingTime: "8 min read",
      published: true,
    },
    {
      title: "Building Reliable Software for African Markets",
      slug: "building-reliable-software-for-african-markets",
      description:
        "The real constraints of building software for African users — connectivity, device fragmentation, payment rails — and the engineering patterns that address them.",
      content: `# Building Reliable Software for African Markets

After several years building software that runs in Nigeria and across West Africa, I've learned that the engineering challenges are real and specific. This isn't a generalisation — it's a set of concrete constraints that shape architectural decisions.

## The connectivity problem

Mobile internet in Nigerian cities is unreliable in ways that European 4G users never experience. Requests drop mid-flight. DNS resolution fails intermittently. Latency spikes to 3–5 seconds without warning.

The implication: **your app must handle partial failures gracefully**. This means:

- Idempotent API endpoints — retrying a failed request must not create duplicate records
- Client-side retry logic with exponential backoff
- Optimistic UI updates with rollback on failure
- Offline-first data models for mobile (SQLite local cache, sync on reconnect)

## Device fragmentation

The median Android device in Nigeria is 2–3 generations behind the flagship. 2GB RAM is common. Storage is tight.

Mobile apps must be lean. No bloated bundles. No unnecessary background processes. Code-split aggressively and test on low-end hardware.

## Payment rails

Flutterwave, Paystack, and Interswitch are the dominant payment processors. Card penetration is growing but bank transfer (USSD) and wallet payments remain significant.

Every payment flow must:
- Handle network interruptions between charge initiation and verification
- Verify payment status server-side before fulfilling orders (webhooks are authoritative, not the client redirect)
- Provide clear failure messages (declined cards often give vague bank codes)

## The upside

These constraints make you a better engineer. When you design for unreliable networks and constrained devices as a first principle — not an afterthought — the resulting software is more robust everywhere. The patterns translate: your offline-first mobile app handles NYC subway tunnels just as well as Lagos connectivity.

Build for the hardest case first.`,
      tags: ["Africa", "Engineering", "Mobile", "Reliability"],
      readingTime: "6 min read",
      published: true,
    },
    {
      title: "9 Million Backed-Up Jobs: Lessons from a Redis Queue Crisis",
      slug: "redis-queue-crisis-lessons",
      description:
        "How a misconfigured queue worker turned into 9 million backed-up jobs in production — and how we drained it without downtime.",
      content: `# 9 Million Backed-Up Jobs: Lessons from a Redis Queue Crisis

At some point in a backend engineer's career, you open a monitoring dashboard and see a number that makes your stomach drop. For me, it was a Redis queue depth of 9 million jobs.

This is what happened, why it happened, and what we changed so it couldn't happen again.

## How It Started

EonsFleet uses Laravel Horizon to manage background jobs — notifications, webhook dispatches, report generation, real-time telemetry processing. The queue system had been running fine for months.

The problem started with a telemetry processing job that, under certain vehicle data conditions, would stall rather than fail. It didn't throw an exception. It didn't timeout cleanly. It just sat there, holding a worker slot.

## How 9 Million Jobs Accumulated

The telemetry queue processes vehicle location updates — every tracked vehicle sends a ping every 30 seconds. With workers stalling, queue throughput dropped. New jobs kept arriving at the normal rate. The backlog grew slowly at first, then faster as more workers got stuck.

By the time monitoring caught the depth crossing a threshold alarm, the queue already had millions of backed-up jobs. The alarm threshold was set too high.

## The Drain Problem

You can't just delete 9 million queued jobs. Some of those jobs were legitimate and important — payment confirmations, critical notifications, SLA-sensitive webhooks. Nuking the queue would mean losing real work.

We needed to stop the bleeding, triage the backlog, and drain safely.

## What We Did

**Step 1:** Scaled down the problematic workers first — stopped new workers from getting stuck and freed capacity for other queue types.

**Step 2:** Split queues by priority. Jobs sharing a single queue were moved to named queues — \`critical\`, \`default\`, \`low\`, \`telemetry\`. Workers were assigned with explicit priority ordering.

**Step 3:** Triaged the backlog. Telemetry location pings older than 5 minutes were stale by definition — we discarded the telemetry backlog entirely (safely — no business logic depended on historical pings being processed in-order).

**Step 4:** Drained the remaining backlog by temporarily scaling Horizon workers up.

**Step 5:** Fixed the root cause — lowered job timeout on the telemetry job to 15 seconds, added a mutex to prevent concurrent execution, added retry logic with exponential backoff.

## What We Changed After

- **Lower, specific timeouts** — every job class now has an explicit \`$timeout\` appropriate to what it actually does
- **Named queues with priorities** — payments and critical notifications on the \`critical\` queue; telemetry isolated so it can't block payment processing
- **Alerting at lower thresholds** — queue depth alarm now triggers at 10,000 jobs, not 1 million
- **Job observability** — every job logs its start, completion, and duration

## The Broader Lesson

Queue systems fail silently in ways that other systems don't. A web server returning 500s is visible immediately. A queue backing up does so gradually, and by the time it's obviously broken, the damage is already done.

Design your jobs so you know which ones can be safely dropped and which ones can't. That knowledge is the difference between a recoverable incident and a data loss event.`,
      tags: ["Redis", "Queues", "Backend", "Incident"],
      readingTime: "7 min read",
      published: true,
    },
  ]

  for (const { slug, ...data } of posts) {
    await prisma.post.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    })
  }

  console.log("Seed complete.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
