# Portfolio Revamp — Repository Audit and Architecture Report

**Repository:** `my-portfolio`  
**Audit date:** 26 August 2026  
**Audit scope:** Existing source code, repository configuration, dependencies, routes, UI components, data model, content, authentication, SEO, media, deployment assumptions, accessibility, performance, security, and migration readiness.  
**Implementation status:** Audit only. No application source code or database schema was changed as part of this report.

## Executive summary

The repository is not a static or disposable portfolio. It is already a compact full-stack application built with Next.js 16, React 19, TypeScript, Prisma, PostgreSQL, and Auth.js. It contains a public portfolio, a small private administrator area, project and article CRUD, detailed real project/article seed content, shared metadata generation, a dynamic sitemap, robots configuration, and Vercel Analytics.

The correct strategy is therefore an incremental expansion—not a rebuild and not a separate CMS service. The existing single-application architecture can cleanly support the requested portfolio and CMS. Its main limitation is domain coverage: the CMS currently manages only projects, posts, and footer links, while the hero, biography, experience, skills, navigation, contact information, site identity, and most homepage content remain hardcoded.

The highest-priority issues are foundational rather than visual:

1. CMS Markdown is rendered to HTML without sanitization, creating a stored-XSS risk.
2. Administrator credentials are raw environment strings, with no password hashing, throttling, reset flow, or database-backed administrator record.
3. API request bodies are passed directly to Prisma without runtime validation or field allow-listing.
4. There are no committed Prisma migrations, tests, CI checks, or documented production schema-deployment process.
5. Projects have no draft/publication control, so every project record is publicly queryable and included in the sitemap.
6. The media system, contact form, resume handling, structured experience, skills, case studies, and global settings required by the product do not exist yet.

The recommended sequence is to establish migrations, validation, sanitized Markdown, secure authentication, tests, and a proper domain/query layer before adding content modules or significantly redesigning the public UI.

---

## 1. Current technology stack

### Framework and frontend

- **Next.js 16.2.4**, using the App Router.
- **React 19.2.4** and `react-dom` 19.2.4.
- **TypeScript 5**, with strict type checking enabled.
- **Tailwind CSS 4** through `@tailwindcss/postcss`.
- **Tailwind Typography** for rendered Markdown prose.
- **Framer Motion 12** for reveal animations.
- **Lucide React** for icons.
- Three optimized Google font families through `next/font`: Instrument Serif, DM Sans, and JetBrains Mono.

### Backend and persistence

- Next.js Server Components perform direct database reads.
- Next.js route handlers implement administrator CRUD endpoints.
- **Prisma 5.22** is the ORM.
- **PostgreSQL** is the database.
- Environment documentation indicates **Neon PostgreSQL**, using pooled and direct connection strings.

### Authentication

- **Auth.js / NextAuth 5 beta**.
- Credentials provider.
- JWT session strategy.
- Next.js middleware protects the administrator route tree.

### Content and supporting services

- Markdown rendering through `marked`.
- Vercel Analytics is mounted globally.
- `@dnd-kit/core` and `@dnd-kit/sortable` are installed, but no current source file uses them.

### Runtime and package management

- npm with a committed `package-lock.json`.
- No Node engine is declared in `package.json`.
- The audit environment uses Node.js 22.14.0 and npm 11.4.2, but that is not a repository-level runtime guarantee.

### Available scripts

| Script | Purpose | Observation |
|---|---|---|
| `npm run dev` | Start development server | Standard Next.js development command |
| `npm run build` | Generate Prisma client and build Next.js | Does not run database migrations |
| `npm run build:local` | Build without Prisma generation | Useful only if the client is already generated |
| `npm run start` | Start production server | Standard Next.js command |
| `npm run lint` | Run ESLint | No separate type-check command |
| `npm run db:migrate` | Run `prisma migrate dev` | Development-only migration command |
| `npm run db:seed` | Seed content | Contains valuable existing content |
| `npm run db:studio` | Open Prisma Studio | Local database inspection |

### Assessment

The stack is modern and fully capable of supporting the requested portfolio. Introducing another frontend framework, standalone API, external headless CMS, or microservice architecture would add cost and operational complexity without solving a demonstrated problem.

---

## 2. Current application architecture

The current architecture is a single deployable Next.js application:

```text
Browser
  |
  v
Next.js application
  |-- Public pages and Server Components
  |-- Private administrator pages
  |-- Auth.js authentication routes
  |-- Authenticated administrator APIs
  |
  v
Prisma ORM
  |
  v
Neon/PostgreSQL
```

### Public request flow

Public pages are predominantly Server Components. Project and article listings query Prisma directly and pass records into reusable cards. Detail pages query by slug, convert stored Markdown to HTML, and render the generated HTML into a prose container.

### Administrator request flow

CMS pages load initial data on the server. Client-side forms submit JSON to route handlers under `/api/admin`. Each route handler calls `auth()` and rejects unauthenticated requests. Mutations are performed through Prisma and then attempt cache invalidation with `revalidateTag`.

### Architectural strengths

- One repository and one deployment unit.
- Minimal network layering for server-rendered content.
- Clear public/admin route separation.
- Shared TypeScript types are available through Prisma.
- No unnecessary service boundary.
- Appropriate for a read-heavy personal site.

### Architectural weaknesses

- UI components query Prisma directly, so querying, publication policy, caching, and error behavior are not centralized.
- API handlers contain authentication and persistence but no runtime validation or domain rules.
- Public and administrator layout concerns are not fully separated; `/admin/login` inherits the admin layout.
- The CMS is organized around database records rather than complete editorial workflows.
- Cache invalidation calls are disconnected from cached/tagged public reads.
- Silent database failure handling makes operational failures appear as valid empty states.

---

## 3. Current folder and module structure

```text
app/
|-- about/page.tsx
|-- admin/
|   |-- layout.tsx
|   |-- login/page.tsx
|   |-- page.tsx
|   |-- posts/
|   |-- projects/
|   `-- settings/page.tsx
|-- api/
|   |-- admin/
|   |   |-- footer-links/
|   |   |-- posts/
|   |   `-- projects/
|   `-- auth/[...nextauth]/route.ts
|-- contact/page.tsx
|-- projects/
|   |-- [slug]/page.tsx
|   `-- page.tsx
|-- writing/
|   |-- [slug]/page.tsx
|   `-- page.tsx
|-- uses/page.tsx
|-- layout.tsx
|-- page.tsx
|-- robots.ts
|-- sitemap.ts
`-- globals.css

components/
|-- admin/
|-- home/
|-- layout/
|-- projects/
|-- writing/
`-- ui/

lib/
|-- markdown.ts
|-- metadata.ts
|-- prisma.ts
`-- slugify.ts

prisma/
|-- schema.prisma
`-- seed.ts

public/
|-- favicon and starter assets
```

### Assessment

The structure is easy to understand at its current size. As CMS coverage grows, placing all business logic inside route handlers and page components will become difficult to maintain. The next stage should introduce feature-oriented server modules such as:

```text
lib/
|-- auth/
|-- cache/
|-- content/
|   |-- articles/
|   |-- case-studies/
|   |-- projects/
|   `-- publication.ts
|-- media/
|-- security/
`-- validation/
```

This remains internal modularization, not a separate backend.

---

## 4. Existing pages and routes

### Public routes

| Route | Status | Source | Notes |
|---|---|---|---|
| `/` | Exists | `app/page.tsx` | Hero, selected work, latest writing only |
| `/about` | Exists | `app/about/page.tsx` | Biography, hardcoded experience, philosophy, core stack |
| `/projects` | Exists | `app/projects/page.tsx` | Database-backed list with tabs |
| `/projects/[slug]` | Exists | `app/projects/[slug]/page.tsx` | Markdown case-study-style detail |
| `/writing` | Exists | `app/writing/page.tsx` | Published article listing |
| `/writing/[slug]` | Exists | `app/writing/[slug]/page.tsx` | Published article detail |
| `/uses` | Exists | `app/uses/page.tsx` | Hardcoded tools and equipment |
| `/contact` | Partial | `app/contact/page.tsx` | Contact links only; no form |
| `/experience` | Missing | — | Experience is embedded in About |
| `/case-studies` | Missing | — | No standalone domain or route |
| `/case-studies/[slug]` | Missing | — | — |
| `/resume` | Missing | — | No resume model or file |
| `/sitemap.xml` | Exists | `app/sitemap.ts` | Dynamic, but includes every project |
| `/robots.txt` | Exists | `app/robots.ts` | Disallows `/admin` |

### Administrator routes

| Route | Status | Notes |
|---|---|---|
| `/admin` | Exists | Dashboard statistics and recent activity |
| `/admin/login` | Exists | Credentials login |
| `/admin/projects` | Exists | Project listing |
| `/admin/projects/new` | Exists | Project creation form |
| `/admin/projects/[id]/edit` | Exists | Project edit/delete form |
| `/admin/posts` | Exists | Post listing |
| `/admin/posts/new` | Exists | Post creation form |
| `/admin/posts/[id]/edit` | Exists | Post edit/delete form |
| `/admin/settings` | Partial | Footer links only |

### API routes

- `/api/auth/[...nextauth]`
- `/api/admin/projects`
- `/api/admin/projects/[id]`
- `/api/admin/posts`
- `/api/admin/posts/[id]`
- `/api/admin/footer-links`
- `/api/admin/footer-links/[id]`

There is no public JSON API, which is appropriate because Server Components can query the database directly. A public API should only be introduced for a real external consumer.

### URL preservation recommendation

Keep all current public URLs. Internally renaming `Post` to `Article` should not change `/writing/[slug]`. Keep `/uses` as an optional supplementary page even though it was not listed in the new required navigation. If it is removed from primary navigation, the URL should remain accessible or redirect deliberately.

---

## 5. Existing reusable components

### Retain with minor improvement

- `SectionHeader`: consistent section framing.
- `Tag`: suitable for technologies and article tags.
- `Badge`: suitable for availability and editorial status.
- `ProjectCard`: useful structural foundation.
- `PostCard`: useful article-list foundation.
- `Navbar`: brand and route foundations are sound.
- `Footer`: already reads configurable links from the database.
- `AdminSidebar`: good shell foundation for expanded CMS navigation.
- Prisma singleton and metadata helper.

### Retain but significantly refactor

- `Hero`: convert all content, CTAs, social links, availability, and media to CMS-backed data.
- `SelectedWork`: move query logic into a shared published-project query and add cover, role, results, and more intentional empty/error states.
- `WritingPreview`: use article publication dates and shared cached queries.
- `CaseStudyLayout`: preserve its clean reading layout, but support structured sections, diagrams, metrics, and sanitized Markdown.
- `ProjectTabs`: preserve the simple filtering interaction, then extend with project types/search only if content volume justifies it.
- `ProjectForm` and `PostForm`: split into composable field groups and add validation, preview, media selection, save state, errors, and unsaved-change protection.
- Administrator tables: retain compact tabular presentation but add accessible controls, status filters, pagination when required, and soft-delete/restore workflows.

### Replace

- Current raw Markdown rendering pipeline.
- Current credentials comparison.
- Current generic confirmation overlay with an accessible dialog implementation.
- Direct `body` to Prisma mutation pattern.

### Remove only after replacement

- Duplicated hardcoded biography, experience, skills, navigation, contact, and hero data.
- Starter SVG assets unused by the finished design.
- Unused drag-and-drop packages if homepage/navigation reordering does not use them.

---

## 6. Current content-management approach

### CMS-managed content

- Projects.
- Blog posts.
- Footer links/social links.

### Source-code-managed content

- Name and professional title.
- Hero headline and introduction.
- Availability message.
- Hero CTAs.
- Hero social destinations.
- About biography.
- Experience records.
- Engineering philosophy.
- Skills and tools.
- Navigation.
- Contact information and availability.
- Site identity and default metadata.
- Homepage section presence and order.

### Editorial workflow currently available

- Articles have a `published` boolean.
- Projects can be marked featured but have no draft/public status.
- Slugs can be typed or generated client-side.
- Articles and projects can be created, edited, or permanently deleted.
- There is no archive, restore, preview, scheduling, revision history, or soft deletion.
- The article editor is a plain Markdown textarea with no preview.

### Content quality

The existing seed data is a major asset. It contains detailed descriptions of real projects, technical decisions, engineering challenges, and outcomes. It also contains three substantive technical articles. This content should be migrated carefully, not regenerated or replaced with generic copy.

Before public launch, the owner should verify dates, roles, URLs, status claims, and any quantitative outcomes. The implementation must not invent missing professional details.

---

## 7. Existing backend and database capabilities

### Existing models

#### `Post`

- ID.
- Title.
- Unique slug.
- Description.
- Markdown content.
- String-array tags.
- Free-text reading time.
- Published boolean.
- Created and updated timestamps.

#### `Project`

- ID.
- Title.
- Unique slug.
- Description.
- Markdown content.
- Type.
- Category.
- Status.
- Year.
- String-array technology stack.
- Featured boolean.
- Display order.
- Created and updated timestamps.

#### `FooterLink`

- ID.
- Label.
- URL.
- Icon name.
- Display order.
- Created and updated timestamps.

### Existing capabilities worth preserving

- Unique slugs enforced at the database layer.
- Timestamps on every current model.
- Project ordering and featured selection.
- PostgreSQL arrays are a pragmatic choice for small technology/tag lists.
- Project and post seeds use slug-based upserts.
- Pooled and direct PostgreSQL URLs are separated.

### Gaps

- No migration history.
- No administrator identity in the database.
- No publication lifecycle enum.
- No project visibility control.
- No soft-deletion fields.
- No media relationships.
- No category model or article-tag relationship.
- No profile, experience, skill, site setting, navigation, resume, certification, contact, or case-study entities.
- No database constraints for status/type strings.
- No indexes for publication and ordering queries beyond unique slug indexes.
- No optimistic concurrency or revision tracking.

### Backend error behavior

Several public/admin pages catch all database exceptions and render empty lists or zero statistics. Graceful degradation can be useful, but silently treating an outage as “no content” hides failures. Errors should be logged and public pages should distinguish an unavailable service from a genuinely empty collection where appropriate.

---

## 8. Authentication status

### What exists

- Credentials-provider login.
- JWT sessions.
- Custom `/admin/login` page.
- Middleware redirect for unauthenticated administrator pages.
- Per-route-handler authentication checks.
- Client-side logout.

### Problems

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are compared directly against submitted strings.
- Passwords are not hashed.
- No database-backed administrator record exists.
- The returned administrator identity is hardcoded.
- No forgot-password or reset-password flow.
- No failed-login throttling, exponential delay, lockout, or audit record.
- No session list or session revocation.
- No account profile page.
- No explicit preparation for multiple administrators.
- `/admin/login` inherits the administrator layout and may show the sidebar on the authentication screen.

### Recommended authentication design

- Add an `Admin` record with `email`, `name`, `passwordHash`, `isActive`, timestamps, and optional last-login metadata.
- Hash passwords with Argon2id using current OWASP-aligned parameters.
- Bootstrap the first administrator through an idempotent command using environment-provided credentials.
- Add normalized, single-use, hashed password-reset tokens with short expiry.
- Rate-limit login and reset requests by both IP and normalized email.
- Retain Auth.js unless Next.js 16 guidance or an implementation constraint demonstrates a better native option.
- Keep sessions server-validated and use secure, HTTP-only cookies in production.
- Split `/admin/login` into an authentication route group with its own layout.
- Keep the model extensible to multiple administrators without implementing full RBAC in the MVP.

---

## 9. Current SEO implementation

### Existing strengths

- Global metadata.
- Shared `buildMetadata` helper.
- Page-specific title and description.
- Dynamic project/article metadata.
- Canonical URLs.
- OpenGraph metadata.
- Twitter large-image cards.
- `metadataBase` based on `NEXT_PUBLIC_SITE_URL`.
- Dynamic sitemap.
- Robots configuration that disallows `/admin`.

### Issues

- `/og-image.png` is referenced but absent from `public`.
- No structured data for Person, WebSite, Article, BlogPosting, WebPage, or breadcrumbs.
- No CMS-managed SEO title, description, image, canonical, or index state.
- Sitemap uses the current time for `lastModified` rather than content update timestamps.
- Every project is exposed in the sitemap because there is no publication status.
- No case-study or experience routes to include.
- No explicit noindex metadata for administrator/authentication pages.
- No per-article OpenGraph type or publication date metadata.
- Site identity is duplicated across code.
- Canonical construction assumes clean URL concatenation and does not centralize trailing-slash or origin normalization.
- There is no content-level social image fallback chain.

### Recommended SEO hierarchy

1. Content-specific overrides.
2. Generated content defaults from title/excerpt/cover.
3. CMS-managed global defaults.
4. Safe code defaults for first-run behavior.

Structured data should be rendered only when the underlying data is complete and truthful.

---

## 10. Current media and image handling

There is no meaningful media subsystem.

### Current state

- No `next/image` usage.
- No profile image.
- No project covers or galleries.
- No article covers.
- No architecture diagrams.
- No company logos.
- No resume file.
- No media metadata model.
- No upload endpoint.
- No upload type/size/dimension validation.
- No local media-development convention.
- No S3/R2 integration.
- Public assets are mostly untouched create-next-app SVGs.
- The referenced OpenGraph image is missing.

### Recommended design

Use a storage adapter with two implementations:

- Local filesystem or a development object-storage bucket for local work.
- S3-compatible object storage, preferably Cloudflare R2 or AWS S3, in production.

Store metadata in a `Media` record:

- ID.
- Stable storage key.
- Public or signed URL strategy.
- Original filename.
- Safe generated filename.
- MIME type.
- Byte size.
- Width and height where applicable.
- Alt text.
- Caption.
- Checksum.
- Creator.
- Created/updated timestamps.
- Soft-deletion timestamp.

Upload security must validate content signature rather than trusting the extension or browser-provided MIME type. SVG uploads should be disabled initially or sanitized through a deliberately reviewed pipeline.

---

## 11. Current deployment setup

### Evidence in the repository

- Vercel is named in the scaffold documentation.
- Vercel Analytics is installed and rendered.
- Neon-style pooled/direct database variables are documented.
- The Git remote points to a GitHub repository.
- The build script generates Prisma Client before building.

### Missing deployment controls

- No `vercel.json`.
- No GitHub Actions workflow.
- No Dockerfile or Compose configuration.
- No production migration script.
- No committed Prisma migrations.
- No explicit Node runtime version.
- No environment-variable validation.
- No health/readiness endpoint.
- No deployment smoke-test script.
- No backup/restore documentation.
- No staging environment guidance.
- README remains the generic create-next-app document.

### Deployment risk

The production database schema may have been created through `prisma db push` or another manual process, but the repository does not document it. Before the first schema change, production schema state must be introspected and baselined. Creating new migrations blindly could conflict with the deployed database.

---

## 12. Current strengths

### Product and content

- The public site already presents a recognizable engineering profile.
- Projects are treated as more than screenshot cards; existing Markdown includes problems, decisions, challenges, and outcomes.
- Existing writing is technically substantive.
- The design is restrained and avoids proficiency percentages, spinning icons, and excessive visual effects.
- Navigation and page naming are concise.

### Engineering

- Suitable modern framework and database.
- Strict TypeScript configuration.
- Server Components reduce unnecessary client fetching.
- Slugs are database-unique.
- Article drafts are protected in public list and detail queries.
- Admin APIs do not rely solely on middleware; they perform their own authentication checks.
- External public links generally use `noopener noreferrer`.
- `next/font` provides optimized font delivery.
- Public routes already have metadata and canonical URLs.
- Repository scope is small enough for safe incremental migration.

### Design assets worth preserving

- “IL” monogram.
- Dark neutral palette with green accent, subject to contrast adjustment.
- Instrument Serif/DM Sans typographic personality.
- Compact cards and case-study reading width.
- Content-first visual hierarchy.

---

## 13. Technical debt

### Data and domain debt

- Three broad models represent only a small part of the required domain.
- String fields are used for values that should become constrained enums.
- Publication state is inconsistent between articles and projects.
- Content is split between seed records and hardcoded page arrays.
- No migration history or production schema baseline.

### Application debt

- Data access is distributed through components and pages.
- No runtime request validation.
- No centralized authorization policy.
- No explicit cache/query layer.
- No standardized API error response.
- No user-facing mutation-error handling.
- Hard deletion throughout the CMS.
- No loading, retry, or conflict states for forms.
- No unsaved-change protection.
- No preview workflow.

### Repository and operations debt

- Generic README.
- No tests.
- No CI.
- No runtime pin.
- No deployment migration command.
- No environment validation.
- Unused dependencies.
- Silent exception handling.

### Caching debt

Mutation routes call `revalidateTag("projects")` and `revalidateTag("posts")`, but no corresponding tagged cache is attached to public reads. The invalidation calls therefore do not express a complete caching contract. Projects are also explicitly marked `force-dynamic`, so they are rendered on every request.

---

## 14. UI and UX problems

This section is based on source inspection rather than a completed browser/Lighthouse run.

### Public website

- Homepage lacks a professional-summary section.
- No profile photograph or equivalent visual identity asset.
- No current-focus field beyond static copy.
- No featured case-study section separate from selected projects.
- No experience preview.
- No grouped skills preview.
- No strong closing contact CTA.
- No visible resume action.
- Project cards lack covers, role, project context, and result summaries.
- Writing lacks category, tag, search, cover image, and sharing behavior.
- Contact is a link directory, not a contact workflow.
- Some displayed social profile paths point to generic platform homepages.
- Experience is embedded in About and cannot be browsed independently.
- The `/uses` desktop two-column item layout may compress poorly on narrow screens.
- Only a dark theme exists.

### Administrator experience

- Sidebar assumes a desktop-width viewport.
- Navigation covers only projects, posts, and footer links.
- Login page is nested inside the admin layout.
- No breadcrumbs or contextual navigation.
- Forms are large undivided screens.
- Save failures are silent.
- No field-level validation feedback.
- No Markdown preview.
- No media picker.
- No scheduling.
- No archive/restore.
- No bulk actions.
- No explicit reordering interface despite installed drag-and-drop dependencies.
- Destructive operations are permanent.

### Design direction

The visual language should evolve rather than be replaced. Recommended improvements are stronger content density, clearer evidence of engineering impact, better media handling, responsive admin layouts, and a light/system theme—not decorative gradients or high-motion effects.

---

## 15. Accessibility problems

### Navigation and focus

- No skip-to-content link.
- The mobile navigation trigger lacks `aria-expanded` and `aria-controls`.
- Menu focus is not moved into or restored from the mobile menu.
- Escape-key dismissal is not implemented.
- No visible global `:focus-visible` system.

### Dialogs and CMS controls

- Confirmation overlay has no `role="dialog"`, `aria-modal`, accessible title association, focus trap, initial focus, Escape handling, or focus restoration.
- Some icon-only edit/delete buttons lack accessible names.
- Toggle controls expose switch state but lack a programmatically associated accessible name.
- Form errors are not attached to fields through `aria-describedby` and are not announced.
- Save state is not reliably announced.

### Visual accessibility

- Muted `#444444` text on `#0A0A0A` is likely below WCAG AA contrast for normal text.
- Small text is used extensively with muted colors.
- Hover is frequently the only additional interaction cue.
- There is no tested light theme.

### Motion

- Framer Motion reveal effects do not visibly respect `prefers-reduced-motion`.
- Smooth scrolling is always enabled.

### Content

- There is no media alt-text system because there is no media model.
- Rendered Markdown heading hierarchy depends entirely on editor discipline.
- Architecture diagrams will require meaningful text alternatives.

### Target

Adopt WCAG 2.1 AA as the acceptance standard and add automated axe checks plus manual keyboard and screen-reader smoke tests.

---

## 16. Performance problems

### Rendering and data access

- Project listing/detail routes force dynamic rendering.
- Project/article metadata and detail rendering can perform duplicate record lookups.
- No shared cached query layer exists.
- CMS dashboard retrieves complete records to calculate counts.
- List queries do not use selective fields.
- No pagination.
- No deliberate database indexes for status/date/order filters.

### Client-side JavaScript

- Framer Motion is used for many simple section reveals.
- Navbar scroll behavior and animations require hydration.
- Three font families increase font assets.
- Admin pages are client-heavy by necessity, but components are not currently split around minimal interactive boundaries.

### Media

- No optimized image pipeline exists yet.
- Adding unbounded CMS media without policy would create a major performance regression.

### Reliability and observability

- Database failures are swallowed into empty content states.
- No error monitoring or performance tracing is configured beyond Vercel Analytics.
- No Lighthouse CI or bundle-budget checks.

### Recommended performance approach

- Build narrow shared queries with selected fields.
- Cache stable public queries with explicit tags and finite revalidation periods.
- Invalidate the exact affected tags after successful mutations.
- Generate static or cached published detail pages where appropriate.
- Deduplicate metadata/detail queries through request memoization.
- Add database indexes based on actual query shapes.
- Use responsive `next/image` sizes and storage transformations.
- Reduce motion-client boundaries and honor reduced-motion preferences.
- Measure before removing a font; retain the existing typography if budgets remain acceptable.

---

## 17. Security concerns

### Critical: unsanitized stored HTML

Markdown is parsed through `marked` and injected with `dangerouslySetInnerHTML`. `marked` does not sanitize HTML. Because CMS content is stored in the database, malicious HTML or event attributes could become persistent XSS.

**Required response:** sanitize generated HTML with a strict allow-list suitable for technical writing, prohibit unsafe protocols, define how inline HTML is handled, and test common XSS payloads. A stronger alternative is a reviewed Markdown/MDX AST pipeline that never permits arbitrary raw HTML.

### High: raw administrator credentials

The administrator password is a raw environment string and compared directly. It cannot support password reset, multiple admins, revocation, password rotation history, or secure database-backed identity.

**Required response:** database-backed administrator, Argon2id hashing, login throttling, reset tokens, and an auditable bootstrap flow.

### High: unvalidated mass assignment

Administrator APIs use request JSON directly as Prisma `data`. This accepts any Prisma-writable field present in the body and provides poor malformed-input handling.

**Required response:** define runtime schemas, trim/normalize values, allow-list writable fields, return structured 4xx errors, and handle unique/conflict cases.

### High: project publication exposure

Projects do not have a draft/publication state. All records are returned by public project queries and included in the sitemap.

**Required response:** add a status/visibility policy and use the same public-content predicate in listings, details, related content, sitemap, search, metadata, and preview logic.

### Medium: destructive deletion

Current deletion permanently removes records.

**Required response:** soft-delete editorial records and provide restore/permanent-delete flows with tighter confirmation and authorization.

### Additional hardening requirements

- Content Security Policy compatible with Next.js and analytics.
- `X-Content-Type-Options`, referrer policy, frame protection, and appropriate permissions policy.
- Explicit origin/CSRF review for custom mutation endpoints.
- Request size limits.
- Secure cookie verification in production.
- Login/reset audit events without logging secrets.
- Media signature validation, randomized keys, safe response headers, and upload quotas.
- Contact-form rate limits and spam controls.
- Secret validation on startup.
- Dependency scanning in CI.
- Avoid secrets in editable site settings or client bundles.

---

## 18. KEEP / IMPROVE / REPLACE / REMOVE assessment

### KEEP

- Next.js App Router and TypeScript.
- Single-application deployment architecture.
- PostgreSQL and Prisma.
- Existing public URLs.
- Existing project and article content.
- Existing project/article CRUD as a functional prototype.
- “IL” brand identity.
- Restrained dark visual language.
- Existing typography direction.
- Project card and case-study layout foundations.
- Shared metadata helper, sitemap, and robots implementation.
- Vercel Analytics.
- Server Component data rendering.

### IMPROVE

- Public/admin route grouping.
- Authentication lifecycle.
- Schema and migration discipline.
- Query/domain layer.
- Runtime validation.
- Error handling and observability.
- Homepage composition.
- About and Experience information architecture.
- Project domain and case-study structure.
- Article editor and taxonomy.
- Administrator navigation and responsive behavior.
- Caching and invalidation.
- SEO and structured data.
- Accessibility and theme support.
- README and operational documentation.

### REPLACE

- Raw environment password comparison.
- Unsanitized Markdown rendering.
- Raw request-body Prisma writes.
- Permanent deletion as the default editorial action.
- Generic confirmation overlay.
- Placeholder social destinations.
- Silent mutation failures.

### REMOVE

- Starter SVG assets not used by the final design.
- Unused dependencies after architecture decisions are complete.
- Duplicated hardcoded content after successful migration and verification.
- Obsolete forms/components only after their replacements are working.
- Compatibility columns only in a later migration after rollback risk is eliminated.

---

## 19. Proposed CMS architecture

### Recommended application structure

```text
Next.js application
|
|-- Public route group
|   |-- Public layouts
|   |-- Published content only
|   |-- Cached server rendering
|   `-- SEO and structured data
|
|-- Authentication route group
|   |-- Login
|   |-- Forgot password
|   `-- Reset password
|
|-- Administrator route group
|   |-- Dashboard
|   |-- Content modules
|   |-- Media library
|   |-- Website settings
|   |-- Contact inbox
|   `-- Account
|
|-- Server/domain layer
|   |-- Authorization
|   |-- Validation
|   |-- Publication policy
|   |-- Queries and mutations
|   |-- Cache tagging/invalidation
|   |-- Markdown rendering
|   |-- Media adapter
|   `-- Notifications
|
|-- Prisma/PostgreSQL
`-- S3-compatible object storage
```

### Public data access

Do not add an internal HTTP hop between Server Components and the database. Public pages should call typed server query functions directly. Every query must apply a centralized publication policy.

Example conceptual API:

```text
getPublicProfile()
getPublishedProjects(filters)
getPublishedProjectBySlug(slug)
getPublishedArticles(filters)
getPublishedArticleBySlug(slug)
getPublishedCaseStudies(filters)
getHomepageComposition()
```

### Administrator mutation layer

Use route handlers or server actions consistently, based on current Next.js 16 project guidance. In either case, mutations must follow this order:

1. Authenticate.
2. Authorize.
3. Validate and normalize.
4. Apply domain rules.
5. Persist in a transaction where needed.
6. Invalidate exact cache tags.
7. Record an audit event where useful.
8. Return a structured result.

### Homepage management

Avoid a general-purpose page builder. Use a fixed set of supported sections with:

- Section key/type.
- Enabled flag.
- Display order.
- Optional section heading/subheading.
- Module-specific configuration such as item limit or explicit featured selection.

This provides editorial control without arbitrary nested layout complexity.

### Draft preview

- Use short-lived, signed preview tokens or the framework’s secure draft mode.
- Require an authenticated administrator session.
- Keep unpublished routes inaccessible without preview context.
- Add `noindex` to preview responses.
- Never encode draft authorization solely in a predictable URL.

---

## 20. Proposed database and domain model

The following model is intentionally comprehensive but still suitable for one application.

### Identity

#### `Admin`

- `id`
- `email` unique
- `name`
- `password_hash`
- `is_active`
- `last_login_at`
- `created_at`
- `updated_at`

#### `PasswordResetToken`

- `id`
- `admin_id`
- `token_hash` unique
- `expires_at`
- `used_at`
- `created_at`

### Profile and website

#### `Profile`

- Name, headline, short introduction, biography, career story.
- Current focus, engineering philosophy, learning areas.
- Location, availability, primary media relation.
- Updated timestamp.

Use one profile row initially, enforced through application logic or a singleton key.

#### `SiteSetting`

- Site name, professional title, description.
- Logo, favicon, primary email, location.
- Copyright, social image, availability.
- Public analytics configuration only.

Do not store API keys, passwords, connection strings, or other secrets.

#### `HomepageSection`

- Stable section type.
- Enabled flag.
- Display order.
- Heading/subheading override.
- Limited typed/validated JSON configuration if required.

#### `NavigationItem`

- Label, URL, position, external/new-tab flags.
- Enabled flag and display order.

#### `SocialLink`

- Platform, URL, icon identifier.
- Visibility and display order.

### Professional content

#### `Experience`

- All fields required by the product brief.
- Structured responsibilities and achievements can initially be string arrays or child records.
- Technologies can remain an array until cross-content technology management is needed.
- Add indexes on visibility/current/order.

#### `SkillCategory`

- Name, slug, display order, visibility.

#### `Skill`

- Name, category relation, icon/media relation, description.
- Featured, display order, visibility.

#### `Certification`

- Required certification fields.
- Certificate media relation.
- Visibility and soft deletion.

#### `Resume`

- Media relation.
- Public filename.
- Active flag.
- Public-download flag.
- Created timestamp.

Enforce one active resume transactionally.

### Projects and case studies

#### `Project`

- Existing ID and slug where possible.
- Required project fields from the brief.
- Explicit editorial status and public visibility.
- Cover/SEO media relations.
- Publication timestamps and soft deletion.
- Indexes on status, featured, display order, and publication date.

#### `ProjectImage`

- Project relation, media relation, image role, caption, display order.

#### `ProjectChallenge`

- Required challenge fields and display order.

#### `ProjectMetric`

- Label, value, optional context, display order.
- Values remain strings because units and truthful phrasing vary.

#### `CaseStudy`

- Optional project relation.
- Required structured fields.
- Markdown fields for long explanations.
- Editorial status, publication date, SEO fields, and soft deletion.

Standalone and project-linked case studies should use the same table with nullable `project_id`.

### Writing

#### `Article`

- Required writing fields.
- Markdown source content.
- Status enum: draft, scheduled, published, archived.
- Publication/scheduling timestamps.
- Featured flag.
- Numeric reading-time minutes, calculated by the application but editable if required.
- SEO overrides and soft deletion.

#### `Category`

- Name, unique slug, description, visibility.

An article should initially have zero or one primary category unless multi-category editorial needs are demonstrated.

#### `Tag` and `ArticleTag`

- Normalized tag records with unique slugs.
- Explicit many-to-many join.

The current string-array tags can be migrated without data loss.

### Media and communication

#### `Media`

- Metadata specified in the media section.
- Storage provider/bucket/key rather than only a mutable public URL.
- Soft deletion and reference checks.

#### `ContactSubmission`

- Name, normalized email, subject, message.
- Status enum.
- Spam score/reason where available.
- Request metadata limited to what is necessary for security.
- Created/read/replied/archived timestamps.

Avoid retaining raw IP addresses indefinitely; hash or expire rate-limit identifiers according to the chosen privacy policy.

### Optional later model

- `Testimonial`, only after real approved testimonials are available.
- `ContentRevision`, if revision history becomes valuable.
- `AdminAuditEvent`, useful for security-sensitive activity.

---

## 21. Existing-content migration strategy

### Principle

The migration must preserve IDs/slugs and real content wherever possible. It must be additive, repeatable, observable, and safe against an existing production database.

### Pre-migration steps

1. Confirm production hosting and obtain a current database backup.
2. Introspect the production schema and compare it with `schema.prisma`.
3. Baseline the existing database in Prisma migration history.
4. Record current row counts, slugs, publication states, and timestamps.
5. Review existing project/article claims with the portfolio owner.
6. Confirm existing public URLs through analytics/search-console data if available.

### Schema rollout

1. Add new tables and nullable columns.
2. Add publication fields with conservative defaults.
3. Backfill data.
4. Verify every row.
5. Update application reads to use new fields.
6. Only later enforce non-null constraints.
7. Remove obsolete fields in a separate release after rollback risk passes.

### Content mapping

#### Posts to articles

- Preserve ID if technically practical.
- Preserve title, slug, description/excerpt, Markdown, tags, and timestamps.
- Convert `published=true` to `status=published` with a reviewed publication timestamp.
- Convert `published=false` to `status=draft`.
- Parse free-text reading time into minutes where possible; preserve the original if parsing fails.
- Create normalized tags and join rows.

#### Projects

- Extend in place.
- Map description to short description.
- Keep current Markdown as legacy/detail content.
- Map `stack` to technologies.
- Map `order` to display order.
- Review current status strings and translate to a constrained project lifecycle.
- Decide public status explicitly before enabling publication filtering.
- Do not fabricate live URLs, repositories, metrics, clients, roles, or dates.

#### Hardcoded pages

- Hero content to `Profile` and homepage settings.
- About paragraphs to biography/career story.
- Experience array to structured `Experience` records.
- Engineering principles to a profile Markdown field or structured ordered list.
- Core stack and Uses sections to skill categories and skills, retaining Uses-only notes where appropriate.
- Contact links and footer links to deduplicated `SocialLink` records.
- Navbar array to `NavigationItem` records.
- Site metadata to `SiteSetting`.

### Migration tooling

Create an idempotent migration/import script that:

- Uses stable keys/slugs.
- Upserts rather than blindly inserts.
- Logs created, updated, skipped, and conflicting records.
- Supports dry-run mode.
- Never deletes production content.
- Exits non-zero on unresolved conflicts.
- Produces a verification summary.

### URL strategy

- Keep `/projects/[slug]`.
- Keep `/writing/[slug]`.
- Add `/case-studies/[slug]` only for new standalone case studies.
- Preserve `/uses` even if it leaves primary navigation.
- Add explicit permanent redirects only when an old URL truly changes.

---

## 22. Recommended implementation phases

### Phase 0: confirm and baseline

- Verify production database and deployment process.
- Establish migration baseline.
- Install locked dependencies successfully.
- Run lint/build and document existing failures.
- Capture current screenshots and route smoke-test results.
- Review content accuracy.

### Phase 1: safety foundation

- Add a test runner and end-to-end framework.
- Add runtime validation.
- Sanitize Markdown.
- Introduce structured error handling.
- Add publication-policy helpers.
- Add environment validation.
- Establish migrations and CI.

### Phase 2: authentication and CMS foundation

- Database-backed administrators.
- Password hashing.
- Login throttling.
- Forgot/reset password.
- Separate auth/admin layouts.
- Expand administrator navigation.
- Add settings and media foundations.

### Phase 3: professional content

- Profile and About CMS.
- Structured Experience CMS and public page.
- Skills/categories CMS.
- Social links and navigation.
- Resume management/download.
- Certifications.

### Phase 4: projects and case studies

- Expand project schema.
- Add editorial/publication workflow.
- Add covers, galleries, and diagrams.
- Add challenges and metrics.
- Improve cards and details.
- Add standalone case studies.
- Add secure preview.

### Phase 5: writing

- Migrate posts to articles.
- Categories and normalized tags.
- Markdown preview and syntax highlighting.
- Scheduling and archive states.
- Public category/tag routes.
- Database-backed search.
- Sharing and article structured data.

### Phase 6: homepage

- CMS-managed hero.
- Professional summary.
- Featured projects and case studies.
- Experience and skills previews.
- Latest writing.
- Final contact CTA.
- Section visibility and ordering.

### Phase 7: contact and remaining CMS

- Validated contact form.
- Honeypot and time-to-submit checks.
- Rate limiting.
- Submission storage.
- Email notification.
- Administrator contact inbox and statuses.
- Global SEO/settings controls.

### Phase 8: quality

- Light/dark/system themes without flash.
- Accessibility pass.
- Responsive public/admin pass.
- Structured data.
- Query caching and exact invalidation.
- Image and font optimization.
- Lighthouse and bundle analysis.
- Security review.

### Phase 9: production migration

- Dry-run import against a production-like backup.
- Apply additive migrations.
- Run content import.
- Verify row counts, slugs, routes, downloads, and metadata.
- Run smoke tests.
- Monitor errors and cache behavior.
- Remove old hardcoded fallbacks only after verification.

---

## 23. Risks and blockers

| Risk/blocker | Impact | Mitigation |
|---|---|---|
| No migration history | High | Introspect and baseline production before schema changes |
| Unknown production data | High | Backup, compare row counts, test migrations on a clone |
| Unsanitized Markdown | High | Fix and test before broader CMS use |
| Weak authentication | High | Replace before exposing expanded CMS functionality |
| No project draft state | High | Add centralized publication policy before preview/search/sitemap work |
| No tests | High | Establish critical regression coverage in the foundation phase |
| Media provider undecided | Medium | Implement adapter; select R2/S3 before production upload work |
| Notification provider undecided | Medium | Keep interface provider-neutral; choose before contact launch |
| Hardcoded content may conflict with seeded content | Medium | Build deterministic field mapping and owner review |
| Existing professional claims may need verification | Medium | Never infer or embellish; require owner confirmation |
| Next.js 16 breaking behavior | Medium | Read installed version-specific docs before each implementation area |
| Dependency install unavailable during audit | Medium | Restore install, then run lint/build/security checks before Phase 1 |
| Cached content becoming stale | Medium | Use explicit tags and mutation invalidation tests |
| Admin expansion causing mobile regressions | Medium | Implement responsive shell early, not at final polish stage |
| Storage cost/security | Medium | Quotas, validation, lifecycle rules, and reference-aware deletion |
| URL changes harming SEO | Medium | Preserve current routes and test redirect map |

---

## 24. Files and modules likely to change

### Existing files

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `auth.ts`
- `middleware.ts`
- `next.config.ts`
- `package.json`
- `.env.example`
- `README.md`
- `app/layout.tsx`
- `app/page.tsx`
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/projects/**`
- `app/writing/**`
- `app/admin/**`
- `app/api/admin/**`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/globals.css`
- `components/home/**`
- `components/layout/**`
- `components/projects/**`
- `components/writing/**`
- `components/admin/**`
- `components/ui/AnimatedSection.tsx`
- `lib/markdown.ts`
- `lib/metadata.ts`

### Likely additions

```text
app/(public)/
app/admin/(auth)/
app/admin/(authenticated)/
app/experience/
app/case-studies/
app/resume/
app/api/contact/
app/api/admin/media/

components/cms/
components/experience/
components/media/
components/seo/

lib/auth/
lib/cache/
lib/content/
lib/media/
lib/notifications/
lib/security/
lib/validation/

prisma/migrations/
scripts/
tests/
```

The exact route-group organization must follow the installed Next.js 16 documentation and should not alter existing public URLs.

---

## Proposed testing strategy

There are currently no tests. The minimum useful suite should include:

### Unit tests

- Slug normalization and uniqueness conflict mapping.
- Publication policy.
- Markdown sanitization against representative XSS payloads.
- Reading-time calculation.
- Metadata fallback hierarchy.
- Contact validation and spam heuristics.
- Media type/size validation.
- Cache-tag selection after mutations.

### Integration tests

- Administrator password verification.
- Login throttling.
- Password-reset token expiry and one-time use.
- CRUD validation for every CMS module.
- Soft deletion and restoration.
- Only published projects/articles/case studies returned publicly.
- Scheduled content remains private until eligible.
- Draft preview requires authorization.
- Contact submission validation and storage.
- Resume active-file behavior and disabled-download behavior.
- Unique slug constraints.
- Content migration idempotency.

### End-to-end tests

- Public navigation.
- Mobile navigation and keyboard behavior.
- Administrator login/logout.
- Create draft, preview, publish, unpublish, archive, and restore.
- Upload/select media.
- Contact success and validation errors.
- Resume download.
- Metadata/canonical checks for representative pages.
- Accessibility checks with axe.

### CI gates

- Dependency installation from lockfile.
- ESLint.
- Type checking.
- Unit/integration tests.
- Production build.
- Prisma schema validation and migration status.
- End-to-end smoke tests against an ephemeral PostgreSQL database.
- Dependency/security scan.

---

## Proposed caching strategy

The portfolio is read-heavy and should use a small, explicit cache vocabulary:

```text
site-settings
navigation
profile
homepage
social-links
experience
skills
projects
project:{slug}
case-studies
case-study:{slug}
articles
article:{slug}
article-category:{slug}
article-tag:{slug}
resume
```

Mutation handlers should invalidate collection tags, affected detail tags, homepage when featured/latest content changes, and sitemap-affecting tags when publication state changes. Stable content should also have a finite revalidation period so a missed invalidation cannot leave it stale indefinitely.

The cache layer must never allow an unauthenticated request to reuse a draft-preview result.

---

## Proposed contact workflow

```text
Visitor submits form
        |
        v
Validate and normalize
        |
        v
Rate limit + honeypot + timing checks
        |
        v
Store submission transactionally
        |
        +----> Notify administrator
        |
        v
Return accessible success state
```

If notification delivery fails, the valid submission should remain stored and the failure should be logged/retried. Notification delivery must not be the transaction that determines whether the visitor’s message is retained.

---

## Proposed media workflow

1. Administrator selects a file.
2. Client performs early size/type checks for feedback.
3. Server authenticates and authorizes.
4. Server validates extension, MIME type, and file signature.
5. Image metadata is extracted.
6. A randomized storage key is generated.
7. File is uploaded directly or through a short-lived signed upload.
8. A `Media` record is stored.
9. CMS requires or strongly prompts for alt text where the image is informative.
10. Deletion first checks references and soft-deletes metadata/object according to policy.

Profile, cover, gallery, diagram, logo, certification, article, resume, and SEO media should all use this shared layer.

---

## Recommended approach

### Architecture

Retain and extend the existing single Next.js application. Separate public, authentication, and authenticated administrator layouts through route groups, while keeping one deployment unit and preserving URLs.

### Frontend

Evolve the current restrained, technical design. Keep the brand identity, typography direction, content-first cards, and case-study reading experience. Add CMS-backed sections, responsive media, light/dark/system themes, reduced-motion behavior, stronger mobile layouts, and WCAG 2.1 AA accessibility.

### Backend and CMS

Expand the current administrator area rather than installing a separate headless CMS. Add a typed domain/query layer, runtime validation, publication policies, secure preview, soft deletion, a media library, deliberate cache invalidation, and reliable mutation feedback.

### Database

Retain PostgreSQL and Prisma. First baseline the deployed schema, then use additive committed migrations. Extend projects in place, migrate posts to articles without changing public URLs, and avoid premature normalization of simple arrays.

### Media storage

Use a provider adapter with local development storage and S3-compatible production storage such as Cloudflare R2 or AWS S3. Keep metadata and relationships in PostgreSQL and render responsive images through Next.js.

### Authentication

Retain Auth.js but replace direct environment-password comparison with database-backed administrators, Argon2id password hashing, throttled login, short-lived reset tokens, secure sessions, and a dedicated authentication layout.

### Content migration

Create an idempotent, dry-runnable import/backfill process. Preserve project/article slugs and timestamps, import hardcoded profile/experience/skills/navigation/contact content, deduplicate social links, and never delete or fabricate professional content.

### Reasoning

The repository already has the right deployment boundary, framework, database, route conventions, content, and visual foundation. A rebuild would introduce avoidable migration and SEO risk while discarding useful work. An incremental, migration-first expansion delivers the required CMS with lower operational cost and a much safer path to production.

---

## Audit verification status

### Completed

- Repository and file inventory.
- Dependency and script inspection.
- Route and component mapping.
- Prisma schema and seed inspection.
- Authentication and middleware review.
- Public/admin API review.
- SEO, sitemap, and robots review.
- Media/deployment/test inventory.
- Static accessibility, performance, and security assessment.
- Git working-tree verification.

### Not completed due to environment limitations

- Successful locked dependency installation.
- ESLint execution.
- Production build.
- Runtime route testing.
- Database connectivity testing.
- Lighthouse/axe/browser audit.
- Dependency vulnerability audit.
- Production deployment/database inspection.

Dependency installation was attempted but could not finish in the audit environment. The subsequent lint command could not locate the ESLint executable because installation was incomplete. These checks must be repeated before implementation begins; this report does not claim that the current application builds successfully.

## Final decision

**Proceed with an incremental revamp of the existing application. Do not rebuild from scratch.**

The first implementation milestone should be a safety foundation: baseline migrations, restore a reproducible dependency/build workflow, add tests and CI, sanitize Markdown, validate all mutations, centralize publication rules, and replace the raw administrator-password mechanism. Once that foundation is verified, extend the CMS module by module while migrating and preserving the existing content and routes.
