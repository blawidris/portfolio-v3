import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Footer links
  await prisma.footerLink.createMany({
    data: [
      { label: "GitHub", url: "https://github.com/idrislawal", icon: "Github", order: 0 },
      { label: "LinkedIn", url: "https://linkedin.com/in/idrislawal", icon: "Linkedin", order: 1 },
      { label: "Twitter", url: "https://twitter.com/idrislawal", icon: "Twitter", order: 2 },
      { label: "Email", url: "mailto:Blawidris@gmail.com", icon: "Mail", order: 3 },
    ],
    skipDuplicates: true,
  })

  // Projects
  const projects = [
    {
      title: "EonsFleet Mobility Solutions",
      slug: "eonsfleet-mobility-solutions",
      category: "work",
      description:
        "Multi-tenant fleet management SaaS — real-time vehicle tracking, driver management, billing engine, and reporting for logistics companies across West Africa.",
      content: `## Overview\n\nEonsFleet is a multi-tenant SaaS platform for fleet management, purpose-built for logistics companies operating in West Africa.\n\n## Problem\n\nFleet operators had no reliable, affordable tool for real-time visibility into vehicle locations, driver behaviour, and fuel consumption. Existing solutions were either too expensive or built for Western markets.\n\n## Solution\n\nBuilt a full-stack SaaS with per-tenant data isolation (row-level security), real-time GPS tracking via WebSockets, a billing engine that supports multiple pricing tiers, and detailed reporting dashboards.\n\n## Stack\n\nNode.js, Next.js, PostgreSQL, Prisma, Redis, WebSockets, AWS EC2, Paystack.\n\n## Outcome\n\nServing multiple logistics companies across Nigeria and Ghana with a 99.7% uptime SLA.`,
      type: "web",
      status: "live",
      year: 2022,
      stack: ["Next.js", "Node.js", "PostgreSQL", "Prisma", "Redis", "WebSockets", "AWS"],
      featured: true,
      order: 0,
    },
    {
      title: "TTS Nigeria / 3MTT Platform",
      slug: "tts-nigeria-3mtt-platform",
      category: "work",
      description:
        "Technical training management platform for Nigeria's 3 Million Technical Talent government initiative — cohort management, progress tracking, and certificate issuance.",
      content: `## Overview\n\nThe 3MTT platform powers Nigeria's government-backed initiative to train 3 million technical talents. It handles learner enrollment, cohort management, assessment delivery, and verified certificate issuance at scale.\n\n## Challenge\n\nThe system needed to support hundreds of thousands of concurrent learners with robust role-based access (learner, facilitator, coordinator, admin) and comply with government reporting requirements.\n\n## Technical Approach\n\nBuilt on Next.js with a Postgres backend, heavy use of background jobs for certificate generation, and a hierarchical permissions system for multi-role access.\n\n## Outcome\n\nCurrently in active rollout with tens of thousands of enrolled learners.`,
      type: "web",
      status: "in-progress",
      year: 2023,
      stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Auth.js", "Tailwind CSS"],
      featured: true,
      order: 1,
    },
    {
      title: "Davton LMS",
      slug: "davton-lms",
      category: "work",
      description:
        "Learning management system with course delivery, assessment engine, multi-instructor support, and Paystack payments integration.",
      content: `## Overview\n\nDavton LMS is a learning management system designed for Nigerian training institutions.\n\n## Features\n\n- Course authoring with video, documents, and quizzes\n- Assessment engine with automatic grading\n- Multi-instructor course management\n- Learner progress tracking and certificates\n- Paystack integration for course purchases\n\n## Tech\n\nNode.js REST API, PostgreSQL, Cloudinary for media, Paystack for payments.`,
      type: "web",
      status: "live",
      year: 2021,
      stack: ["Node.js", "Express", "PostgreSQL", "Cloudinary", "Paystack"],
      featured: false,
      order: 2,
    },
    {
      title: "Paybills",
      slug: "paybills",
      category: "side-project",
      description:
        "Cross-platform mobile bill payments app — airtime, data, electricity, cable TV, and more. Built with React Native for iOS and Android.",
      content: `## Overview\n\nPaybills is a consumer mobile app for paying utility bills in Nigeria — airtime top-up, data bundles, electricity (prepaid tokens), cable TV subscriptions, and more.\n\n## Technical Highlights\n\n- React Native for both iOS and Android from a single codebase\n- Integrated with VTPass and Flutterwave for bill payment APIs\n- PIN-based transaction authentication\n- Transaction history with offline cache\n\n## Outcome\n\nLive on both App Store and Google Play.`,
      type: "mobile",
      status: "live",
      year: 2021,
      stack: ["React Native", "Expo", "TypeScript", "Flutterwave", "VTPass API"],
      featured: true,
      order: 3,
    },
    {
      title: "PHR & Tele-consulting",
      slug: "phr-tele-consulting",
      category: "side-project",
      description:
        "Personal health records management and teleconsulting mobile app — patients manage records, book appointments, and consult doctors via video.",
      content: `## Overview\n\nA mobile health platform that gives patients in Nigeria full control of their health records while enabling remote consultations with licensed physicians.\n\n## Key Features\n\n- Personal health record (PHR) storage and sharing\n- Doctor discovery and booking\n- Real-time video consultation via Agora SDK\n- Prescription and lab result management\n\n## Stack\n\nFlutter, Dart, Node.js backend, PostgreSQL, Agora for video.`,
      type: "mobile",
      status: "live",
      year: 2022,
      stack: ["Flutter", "Dart", "Node.js", "PostgreSQL", "Agora SDK"],
      featured: true,
      order: 4,
    },
    {
      title: "Aria — Car Renting App",
      slug: "aria-car-renting",
      category: "side-project",
      description:
        "Mobile car rental marketplace — browse vehicles, check availability, book instantly, and manage rentals from your phone.",
      content: `## Overview\n\nAria is a peer-to-peer car rental marketplace for Nigerian urban markets. Car owners list their vehicles; renters browse, book, and pay in-app.\n\n## Features\n\n- Vehicle listing with photos and availability calendar\n- Instant booking with in-app payment\n- Driver verification workflow\n- Rental tracking and handover confirmation\n\n## Stack\n\nFlutter, Dart, Node.js, PostgreSQL, Cloudinary, Paystack.`,
      type: "mobile",
      status: "live",
      year: 2022,
      stack: ["Flutter", "Dart", "Node.js", "PostgreSQL", "Paystack", "Cloudinary"],
      featured: false,
      order: 5,
    },
    {
      title: "Exam Attendance Marker",
      slug: "exam-attendance-marker",
      category: "side-project",
      description:
        "Mobile app for university exam halls — invigilators mark student attendance digitally, replacing paper registers with real-time sync.",
      content: `## Overview\n\nBuilt for a Nigerian university to digitise exam hall attendance marking. Invigilators use the app to scan or search student IDs, mark attendance, and sync records to the server in real time.\n\n## Problem\n\nPaper registers were slow, error-prone, and hard to audit. Collation took days after exams.\n\n## Solution\n\nA Flutter app with offline support — attendance syncs when connectivity is available — and a web admin dashboard for coordinators.\n\n## Outcome\n\nAttendance collation reduced from days to minutes.`,
      type: "mobile",
      status: "live",
      year: 2020,
      stack: ["Flutter", "Dart", "Node.js", "SQLite (offline)", "PostgreSQL", "REST API"],
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

After seven years building software that runs in Nigeria, Ghana, and Kenya, I've learned that the engineering challenges are real and specific. This isn't a generalisation — it's a set of concrete constraints that shape architectural decisions.

## The connectivity problem

Mobile internet in Nigerian cities is unreliable in ways that European 4G users never experience. Requests drop mid-flight. DNS resolution fails intermittently. Latency spikes to 3–5 seconds without warning.

The implication: **your app must handle partial failures gracefully**. This means:

- Idempotent API endpoints — retrying a failed request must not create duplicate records
- Client-side retry logic with exponential backoff
- Optimistic UI updates with rollback on failure
- Offline-first data models for mobile (SQLite local cache, sync on reconnect)

## Device fragmentation

The median Android device in Nigeria is 2–3 generations behind the flagship. 2GB RAM is common. Storage is tight.

React Native apps must be lean. No 50MB bundle. No unnecessary background processes. Hermes engine is non-negotiable. Code-split aggressively.

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
  ]

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
  }

  console.log("Seed complete.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
