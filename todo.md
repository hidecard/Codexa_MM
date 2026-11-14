# Codexa MM — Master Implementation Plan

> **Plan version:** 2.0
> **Product:** Codexa MM — Learn. Build. Innovate.
> **Architecture:** Laravel Modular Monolith + Inertia.js + React + TypeScript
> **Status:** Database migration foundation completed; Phase 1 authentication and branding remain in progress.

## 0. Non-negotiable product and brand rules

- `image.png` is the source-of-truth Codexa MM brand board and **must not be deleted, replaced, or visually simplified away**. It contains the approved logo, Light Icon, Dark Icon, Monochrome Icon, color palette, typography, brand values, divisions, and hero direction.
- Product name is **Codexa MM**. Do not use “Code Nest” in user-facing copy except when referring to the historical architecture notes below.
- Brand promise: **Learn. Build. Innovate.**
- Primary users: Students, Instructors, Clients, Administrators, and internal Development Staff.
- MVP priorities: Public Website, Authentication, Course Management, Student Dashboard, Video Learning, Enrollment, Assignments, Client Inquiry, Project Management, Quotations, and Invoices.
- Deferred features: Online Payment Provider integration, Live Classes, AI Assistant, Mobile App, Advanced Analytics, and Affiliate System.

## 1. Logo and visual identity specification — preserve exactly

### 1.1 Approved logo assets

- Source board: `image.png` at repository root. Keep it permanently in the repository.
- Logo mark: geometric open `C` / code-bracket symbol from the source board.
- Wordmark: `Codexa` in dark navy plus `MM` in primary blue.
- Tagline: `LEARN. BUILD. INNOVATE.`
- Supporting statement: `Technology · Education · Innovation` and “Empowering Myanmar’s developers with world-class skills and solutions.”
- Required variants: Light Icon on white, Dark Icon on navy, Monochrome for print/low-color contexts, horizontal wordmark, compact favicon/app icon.
- Required future files: `public/brand/codexa-mark.svg`, `public/brand/codexa-wordmark.svg`, `public/brand/codexa-wordmark-dark.svg`, `public/brand/favicon.svg`, and an accessible `BrandLogo.tsx` component. These are additive assets; never remove `image.png`.

### 1.2 Tokens and usage rules

- Primary: `#2563EB`
- Dark: `#0F172A`
- Accent: `#60A5FA`
- Background: `#F1F5F9`
- Main text: `#0F172A`; muted text: `#64748B`; border: `#E2E8F0`.
- English font: Inter / Plus Jakarta Sans direction from the board; Myanmar font: Noto Sans Myanmar.
- Logo clear space: at least the height of the inner code mark on every side.
- Never stretch, rotate, recolor arbitrarily, add a drop shadow to the mark, or place the light logo on a low-contrast background.
- Header, auth screens, dashboards, certificates, email templates, favicon, and social previews must use the same logo component/tokens.

## 2. Delivery strategy and Definition of Done

Every feature must pass all of these gates before its phase is marked complete:

- [ ] UI is implemented for desktop, tablet, and mobile.
- [ ] Backend validation and safe error handling are implemented.
- [ ] Authentication, authorization, and ownership rules are enforced server-side.
- [ ] Database relationships, indexes, constraints, and soft deletes are verified.
- [ ] Feature and policy tests are added.
- [ ] TypeScript check, Vite build, Laravel tests, and formatting checks pass.
- [ ] Accessibility basics pass: labels, focus states, keyboard navigation, contrast, and semantic landmarks.
- [ ] English and Myanmar copy can be localized without changing component structure.
- [ ] Documentation and seed data are updated.

## 3. Phase-by-phase implementation plan

### Phase 1 — Foundation, branding, authentication, and RBAC

**Current sprint / next implementation unit**

- [x] Complete the migration foundation: dependency ordering, missing FAQ/system-log columns, relationship uniqueness, query indexes, and clean fresh-database verification.
- [x] Laravel 13 + Inertia + React + TypeScript bootstrapped.
- [x] Composer and npm dependency compatibility repaired.
- [x] Public landing page shipped with responsive hero, navigation, divisions, and footer.
- [x] `/health` endpoint and public smoke tests added.
- [x] TypeScript and production Vite build passing.
- [x] Set `APP_NAME=Codexa MM` in `.env.example` and document environment defaults.
- [x] Add the complete logo asset set and reusable `BrandLogo` component without deleting `image.png`.
- [x] Seed `admin`, `instructor`, `student`, and `client` roles.
- [x] Seed granular permissions using `{domain}.{action}` names, for example `courses.create`, `courses.update`, `projects.view-own`, `invoices.manage`.
- [x] Assign `student` automatically on public registration; never allow public self-registration as admin or instructor.
- [x] Add account status enforcement (`active`, `inactive`, `suspended`) in authentication middleware.
- [x] Build the first auth UI slice: login, register, and forgot-password pages with Codexa branding.
- [x] Add role-aware post-login redirects: admin → `/admin/dashboard`, instructor → `/instructor/dashboard`, client → `/client/dashboard`, student → `/student/dashboard`.
- [x] Add policies and tests for role checks and authenticated/guest access.
- [x] Add baseline portal gates (`access-*-portal`) and `CoursePolicy` (instructor ownership/admin override) with feature coverage.
- [x] Add shared UI primitives: Button, Input, Card, Badge, Modal, Toast, EmptyState, PageHeader, and accessible AppShell.

**Exit criteria:** a new user registers as `student`, cannot select privileged roles, can log in, and is redirected to the correct portal; seeded roles and permissions work in a fresh database.

### Phase 2 — Public website and content foundation

- [x] Build About, Course Catalog, Course Detail, Curriculum, Services, Service Detail, Portfolio, Instructors, Blog, Contact, FAQ, Privacy, and Terms pages.
- [x] Replace the Course Catalog and Course Detail placeholder routes with real data-driven Inertia pages.
- [x] Add course category/course/module models, seed data, slugs, published/draft visibility, pagination, search, and category filtering.
- [x] Replace the Services and Service Detail placeholder routes with real data-driven Inertia pages, active visibility, search, category filtering, and seed data.
- [x] Add the remaining public models, factories, seeders, slugs, published/draft visibility, pagination, search, and filtering for services, portfolio, instructors, blog, and FAQ.
- [x] Add contact form validation, spam/rate protection, persistence, and queued notification hooks.
- [x] Add SEO title, description, canonical URL, Open Graph image, sitemap, robots, and JSON-LD where relevant.
- [x] Use the approved Codexa logo in header, footer, auth screens, favicon, and social preview.

**Exit criteria:** public visitors can browse published content and submit a validated inquiry on mobile and desktop.

### Phase 3 — Academy LMS

- [ ] Course categories, courses, modules, lessons, resources, instructors, announcements, reviews, and course status management.
- [ ] Support free, paid, and package-based course pricing in the domain model.
- [ ] Support multiple instructors per course through `course_instructors`.
- [ ] Instructor CRUD with ownership policy: instructors manage only assigned courses.
- [ ] Student dashboard with enrolled courses, progress, continue-learning, assignments, activities, certificates, and notifications.
- [ ] Enrollment service with database transaction and duplicate-enrollment protection.
- [ ] Lesson player with resume position, progress, captions, playback speed, and lesson navigation.
- [ ] Never expose private video URLs directly; use authorized access and expiring signed URLs.

**Exit criteria:** a student can browse a published course, enroll in a free course, access lessons, and see durable progress.

### Phase 4 — Assignments, quizzes, and certificates

- [ ] Assignment authoring, attachments, submissions, late-submission rules, grading, feedback, and status transitions.
- [ ] Quiz authoring with question types, options, attempts, scoring, pass marks, and server-side answer validation.
- [ ] Never return `is_correct` or answer keys in student payloads.
- [ ] Course completion calculation based on lesson, assignment, and quiz requirements.
- [ ] Certificate generation, certificate number uniqueness, verification code, public `/verify/{code}` page, and downloadable certificate layout.
- [ ] Add policy tests for student ownership and instructor grading scope.

### Phase 5 — Codexa Solutions / CRM / project portal

- [ ] Service categories, services, lead capture, lead activities, clients, and inquiry workflow.
- [ ] Client portal with strict ownership filtering: clients can see only their own projects, files, milestones, tasks, quotations, invoices, and support tickets.
- [ ] Project lifecycle: `inquiry → reviewing → quoted → approved → planning → in_progress → testing → client_review → completed`; include `cancelled` and `on_hold` paths.
- [ ] Milestones with dates, status, completion percentage, assigned team members, and attachments.
- [ ] Tasks with assignee, priority, status, due date, comments, and activity history.
- [ ] Project updates, documents, support tickets, internal notes, and client feedback.
- [ ] Add ownership policy tests using two different client accounts.

### Phase 6 — Quotations, invoices, and financial records

- [ ] Quotation CRUD, line items, totals, tax, validity, approval/rejection, and immutable numbering.
- [ ] Invoice CRUD, line items, due date, partial payment fields, status transitions, and PDF-ready presentation.
- [ ] Keep invoice, payment, transaction, and refund records separate.
- [ ] Use decimal monetary fields and database transactions for financial operations.
- [ ] Add payment provider abstraction only; keep actual Myanmar provider integration behind a later feature flag.
- [ ] Add audit events for invoice creation, approval, payment confirmation, adjustment, and refund.

### Phase 7 — Shared operations

- [ ] In-app notifications with read/unread state and preferences.
- [ ] Queued email notifications for enrollment, assignment, grading, project, milestone, invoice, and payment events.
- [ ] Settings, media/file metadata, activity logs, system logs, and admin reports.
- [ ] Secure uploads with MIME, size, ownership, and storage-disk validation.
- [ ] Redis cache, queue worker, scheduler, and failed-job monitoring configuration.

### Phase 8 — API and mobile-readiness

- [ ] Versioned `/api/v1` routes for auth, academy, solutions, billing, notifications, and profile.
- [ ] Sanctum token authentication for future Flutter clients.
- [ ] Consistent JSON envelope, pagination, validation errors, authorization policies, throttling, and OpenAPI documentation.
- [ ] Keep Inertia web flows as the primary product; do not add Next.js unless SSR becomes necessary.

### Phase 9 — Quality, security, performance, and launch

- [ ] Feature, unit, policy, authorization, and API tests with realistic factories.
- [ ] Security review: CSRF, XSS, SQL injection, rate limiting, session cookies, file validation, secret handling, audit logs, and ownership checks.
- [ ] Performance review: indexes, eager loading, query counts, pagination, caching, queue throughput, asset compression, and CDN strategy.
- [ ] Daily database backup, off-site file backup, retention rules, and scheduled restore test.
- [ ] Separate local, staging, and production environments.
- [ ] GitHub Actions: install, lint, TypeScript, build, migrations, tests, and deployment artifact checks.
- [ ] Ubuntu + Nginx + PHP-FPM + PostgreSQL + Redis + SSL deployment documentation.
- [ ] Launch checklist, rollback plan, monitoring, error reporting, and post-launch review.

## 4. Database implementation order

1. Identity: users, profiles, preferences, roles, permissions, activity logs.
2. Academy: categories, courses, course instructors, modules, lessons, resources, enrollments, progress, reviews, announcements.
3. Assessment: assignments, files, submissions, grades, quizzes, questions, options, attempts, answers.
4. Certificates: templates, certificates, verification records.
5. Solutions: service categories, services, requests, leads, clients, projects, members, milestones, tasks, updates, documents, tickets, messages.
6. Finance: quotations, quotation items, invoices, invoice items, payments, transactions, refunds.
7. Shared content: notifications, preferences, media, settings, contact messages, blog, portfolio, FAQs, system logs.
8. Every foreign key, unique constraint, status enum, index, soft-delete decision, and transaction boundary must have a test or documented reason.

## 5. Portal and route delivery order

- Public: `/`, `/about`, `/courses`, `/courses/{slug}`, `/services`, `/portfolio`, `/blog`, `/contact`, `/faq`, `/verify/{code}`.
- Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/email/verify`, `/profile`.
- Student: `/student/dashboard`, `/student/my-courses`, learning, assignments, submissions, quizzes, certificates, notifications, payments, wishlist, reviews, profile.
- Instructor: dashboard, courses, curriculum, lessons, resources, students, assignments, submissions, grading, announcements, reviews, profile.
- Client: dashboard, projects, milestones, tasks, quotations, invoices, payments, documents, support, feedback, profile.
- Admin: dashboard, users, roles, permissions, academy, solutions, finance, content, notifications, reports, activity logs, settings.

## 6. Working agreement for each next task

1. Read this plan and identify the first unchecked item in the current phase.
2. Inspect the existing implementation before changing files.
3. Implement the smallest complete vertical slice: database → policy/service → route/controller → Inertia UI → tests.
4. Run `php artisan test`, `npx tsc --noEmit`, `npm run build`, and relevant formatting checks.
5. Update this plan's checkboxes and a short implementation note.
6. Commit with a focused message and push to `main` only after the checks pass.
7. Never remove `image.png` or the approved Codexa MM logo variants while refactoring UI.

---

## Implementation notes

- Completed: public landing page, responsive navigation, brand colors, `/health`, public smoke tests, dependency compatibility, and build pipeline.
- Completed in this change: full master plan rewrite, preserved logo specification, Codexa MM environment name, RBAC roles/permissions seeder, default student registration role, and RBAC tests.
- Completed in this change: reusable logo SVG variants, `BrandLogo` component, auth layout, login/register/forgot-password pages, Fortify provider registration, account status middleware, and role-aware `/dashboard` redirects.
- Completed in this change: public blog, portfolio, instructor, and FAQ catalogs now have seeded data, published visibility rules, pagination, search/category filtering, responsive Inertia pages, and feature coverage.
- Completed in this change: contact inquiries now validate and persist safely, use route throttling plus a honeypot spam guard, and queue admin email notifications with feature coverage.
- Completed in this change: shared public SEO metadata now covers descriptions, canonicals, Open Graph/Twitter cards, JSON-LD, a default social image, dynamic sitemap XML, and protected robots rules with feature coverage.
- Completed in this change: approved Codexa mark/wordmark variants now cover public and auth headers, public footers, the SVG favicon/apple touch icon, and social preview metadata with consistency coverage.
- Current next slice: reset-password/email-verification UI, authenticated AppShell, and shared UI primitives.
- Historical architecture specification retained below for reference and traceability.

Code Nest — Complete System Architecture & Development Specification
Architecture Proposal v1.0
 Production-oriented


Business Model: Academy + Software Development Agency
Learning Model: Online Learning
Design: Clean Light UI + Optional Dark Mode
Platform: Web Application
Architecture: Modular Monolith

Code Nest ကို တည်ဆောက်ရာမှာ အရေးကြီးဆုံး ဆုံးဖြတ်ချက်က Academy နဲ့ Software Agency ကို Business အနေနဲ့ သီးခြားစီ လုပ်ဆောင်နိုင်ပေမဲ့ User Management, Authentication, Notification, Payment, Admin Dashboard စတဲ့ Core Systems တွေကို အတူတကွ အသုံးပြုနိုင်ဖို့ ဖြစ်ပါတယ်။

အဲဒါကြောင့် Microservices နဲ့ အစကတည်းက ရှုပ်ထွေးအောင် မလုပ်ဘဲ Laravel Modular Monolith ကို ရွေးချယ်ဖို့ အကြံပြုပါတယ်။
CODE NEST
LEARN · BUILD · GROW
Education & Software Solutions
ACADEMY

Online Courses, LMS, Students, Instructors

SOLUTIONS

Services, Clients, Projects, CRM


SHARED CORE PLATFORM

Authentication · Users · Payments · Notifications · Files · Analytics

Laravel + Inertia.js + React

PostgreSQL · Redis · Vite · TypeScript



1. System Architecture
1.1 Technology Stack
ဒီ Stack ကို Main Stack အဖြစ် သတ်မှတ်ပါမယ်။
Layer	Technology	Purpose
Backend	Laravel	Business logic
Frontend	React	User interface
Bridge	Inertia.js	Laravel-React integration
Language	PHP + TypeScript	Application development
Styling	Tailwind CSS	UI styling
UI Library	shadcn/ui	Reusable components
Database	PostgreSQL	Primary database
Cache	Redis	Cache & queues
Authentication	Laravel Fortify	Authentication backend
Authorization	Spatie Permission	RBAC
Build	Vite	Frontend bundling
Charts	Recharts	Analytics
Icons	Lucide	Icons
Testing	Pest + Vitest	Backend & frontend testing
Deployment	VPS + Nginx	Production hosting

Important: Inertia.js ကို အသုံးပြုတဲ့အတွက် Public Website နဲ့ Admin Dashboard နှစ်ခုလုံးကို React နဲ့ တည်ဆောက်နိုင်ပါတယ်။ Next.js ကို Main Application မှာ ထပ်ထည့်စရာ မလိုသေးပါဘူး။

SEO အတွက် SSR လိုအပ်လာတဲ့အခါ Inertia SSR ကို စဉ်းစားနိုင်ပါတယ်။
1.2 High-Level Architecture
#chatgpt-mermaid-_r_1jm_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1jm_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1jm_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1jm_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1jm_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1jm_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1jm_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1jm_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1jm_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1jm_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1jm_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1jm_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1jm_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1jm_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1jm_ p{margin:0;}#chatgpt-mermaid-_r_1jm_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1jm_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1jm_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1jm_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1jm_ .label text,#chatgpt-mermaid-_r_1jm_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1jm_ .node rect,#chatgpt-mermaid-_r_1jm_ .node circle,#chatgpt-mermaid-_r_1jm_ .node ellipse,#chatgpt-mermaid-_r_1jm_ .node polygon,#chatgpt-mermaid-_r_1jm_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1jm_ .rough-node .label text,#chatgpt-mermaid-_r_1jm_ .node .label text,#chatgpt-mermaid-_r_1jm_ .image-shape .label,#chatgpt-mermaid-_r_1jm_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1jm_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1jm_ .rough-node .label,#chatgpt-mermaid-_r_1jm_ .node .label,#chatgpt-mermaid-_r_1jm_ .image-shape .label,#chatgpt-mermaid-_r_1jm_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1jm_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1jm_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1jm_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1jm_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_1jm_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_1jm_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1jm_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1jm_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1jm_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_1jm_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_1jm_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1jm_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1jm_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1jm_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1jm_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1jm_ .icon-shape,#chatgpt-mermaid-_r_1jm_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1jm_ .icon-shape p,#chatgpt-mermaid-_r_1jm_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_1jm_ .icon-shape .label rect,#chatgpt-mermaid-_r_1jm_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1jm_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1jm_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1jm_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1jm_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1jm_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1jm_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1jm_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1jm_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1jm_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1jm_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1jm_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1jm_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1jm_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1jm_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1jm_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1jm_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_1jm_ .node rect,#chatgpt-mermaid-_r_1jm_ .node circle,#chatgpt-mermaid-_r_1jm_ .node ellipse,#chatgpt-mermaid-_r_1jm_ .node polygon,#chatgpt-mermaid-_r_1jm_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1jm_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1jm_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_1jm_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1jm_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1jm_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Visitors / Students / Clients /StaffCode Nest Web ApplicationReact + TypeScriptInertia.jsLaravel ApplicationAuthentication & RBACAcademy ModuleSolutions ModuleShared Core ModulesPostgreSQLRedisQueue WorkersEmail / NotificationsFile ProcessingObject StoragePayment Providers





1.3 Application Structure
Project ကို Domain အလိုက် ခွဲထားပါ။
code-nest/
│
├── app/
│   ├── Domain/
│   │   ├── Identity/
│   │   ├── Academy/
│   │   ├── Learning/
│   │   ├── Assessment/
│   │   ├── Certificates/
│   │   ├── Solutions/
│   │   ├── CRM/
│   │   ├── Projects/
│   │   ├── Billing/
│   │   └── Notifications/
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   │
│   ├── Jobs/
│   ├── Policies/
│   ├── Providers/
│   └── Support/
│
├── resources/
│   ├── js/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── academy/
│   │   │   ├── instructor/
│   │   │   ├── student/
│   │   │   ├── client/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── app.tsx
│   │
│   └── views/
│
├── routes/
│   ├── web.php
│   ├── academy.php
│   ├── solutions.php
│   └── admin.php
│
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
│
├── tests/
│   ├── Feature/
│   └── Unit/
│
└── docs/
    ├── architecture.md
    ├── database.md
    ├── api.md
    └── deployment.md


ဒီ Structure က Feature တွေ တိုးလာတဲ့အခါ Domain တစ်ခုချင်းစီကို သီးခြားထိန်းသိမ်းနိုင်အောင် ရည်ရွယ်ထားပါတယ်။

2. Complete Sitemap
Code Nest မှာ Public Website, Student Portal, Instructor Portal, Client Portal နဲ့ Admin Portal ဆိုပြီး အဓိက Portal ငါးခု ထားပါမယ်။
2.1 Public Website
/
├── /about
├── /courses
│   ├── /courses/categories
│   ├── /courses/:slug
│   └── /courses/:slug/curriculum
│
├── /services
│   ├── /services/web-development
│   ├── /services/mobile-development
│   ├── /services/software-development
│   ├── /services/ui-ux-design
│   └── /services/:slug
│
├── /portfolio
│   └── /portfolio/:slug
│
├── /instructors
│   └── /instructors/:slug
│
├── /blog
│   └── /blog/:slug
│
├── /contact
├── /faq
├── /privacy-policy
├── /terms
│
├── /login
├── /register
└── /forgot-password


2.2 Student Portal
/student
├── /dashboard
├── /my-courses
├── /courses/:id/learn
│   └── /courses/:id/lessons/:lessonId
├── /assignments
│   └── /assignments/:id
├── /submissions
├── /quizzes
├── /certificates
├── /notifications
├── /payments
├── /wishlist
├── /reviews
└── /profile


Student Dashboard မှာ ပါသင့်တာတွေက -
- Enrolled Courses
- Learning Progress
- Continue Learning
- Upcoming Assignments
- Recent Activities
- Completed Courses
- Certificates
- Notifications
2.3 Instructor Portal
/instructor
├── /dashboard
├── /courses
│   ├── /create
│   └── /:id/edit
├── /curriculum
├── /lessons
├── /resources
├── /students
├── /assignments
├── /submissions
├── /grading
├── /announcements
├── /reviews
└── /profile


Instructor တစ်ယောက်က မိမိတာဝန်ပေးထားတဲ့ Course တွေကိုသာ စီမံနိုင်ရပါမယ်။
2.4 Client Portal
/client
├── /dashboard
├── /projects
│   └── /projects/:id
├── /milestones
├── /tasks
├── /quotations
├── /invoices
├── /payments
├── /documents
├── /support
├── /feedback
└── /profile


2.5 Admin Portal
/admin
├── /dashboard
│
├── /users
├── /roles
├── /permissions
│
├── /academy
│   ├── /courses
│   ├── /categories
│   ├── /modules
│   ├── /lessons
│   ├── /enrollments
│   ├── /students
│   ├── /instructors
│   ├── /assignments
│   ├── /quizzes
│   └── /certificates
│
├── /solutions
│   ├── /services
│   ├── /leads
│   ├── /clients
│   ├── /projects
│   ├── /milestones
│   └── /tasks
│
├── /finance
│   ├── /quotations
│   ├── /invoices
│   ├── /payments
│   └── /transactions
│
├── /content
│   ├── /pages
│   ├── /blog
│   ├── /portfolio
│   └── /faq
│
├── /notifications
├── /reports
├── /activity-logs
└── /settings



3. Database Schema
Database ကို PostgreSQL အသုံးပြုပြီး Domain အလိုက် စီစဉ်ပါမယ်။
3.1 Identity & Access Management
Table	အဓိက Columns
users	id, name, email, password, status
profiles	user_id, phone, avatar, bio, address
roles	id, name, guard_name
permissions	id, name, guard_name
model_has_roles	role_id, model_id
model_has_permissions	permission_id, model_id
role_has_permissions	role_id, permission_id
user_preferences	user_id, locale, theme
activity_logs	user_id, action, subject_type, subject_id

users ကို Student, Instructor, Client, Admin အားလုံးအတွက် အခြေခံ Identity အဖြစ် အသုံးပြုပါ။

User တစ်ယောက်မှာ Role တစ်ခုထက်ပိုရှိနိုင်အောင် ပြင်ဆင်ထားပါ။
3.2 Academy & LMS
Table	အဓိက Columns
course_categories	id, name, slug
courses	id, category_id, instructor_id, title, slug, description, price, status
course_instructors	course_id, instructor_id
course_modules	id, course_id, title, position
lessons	id, module_id, title, content, video_url, duration, position
lesson_resources	id, lesson_id, file_path, file_type
enrollments	id, student_id, course_id, status, enrolled_at
lesson_progress	id, enrollment_id, lesson_id, completed_at
course_reviews	id, student_id, course_id, rating, comment
course_announcements	id, course_id, title, content

Relationships
Course
 ├── Category
 ├── Instructors (Many-to-Many)
 ├── Modules (One-to-Many)
 │    └── Lessons (One-to-Many)
 │         └── Resources
 ├── Enrollments
 └── Reviews

Student
 └── Enrollments
      └── Lesson Progress


3.3 Assignments & Assessment
Table	အဓိက Columns
assignments	id, course_id, lesson_id, title, instructions, due_at
assignment_attachments	id, assignment_id, file_path
submissions	id, assignment_id, student_id, content, submitted_at
submission_files	id, submission_id, file_path
grades	id, submission_id, instructor_id, score, feedback
quizzes	id, course_id, title, pass_mark
quiz_questions	id, quiz_id, question, type, points
quiz_options	id, question_id, option_text, is_correct
quiz_attempts	id, quiz_id, student_id, score, status
quiz_answers	id, attempt_id, question_id, answer

Quiz အတွက် Correct Answer တွေကို Student API Response ထဲ မပို့ရပါဘူး။ Server-side မှာပဲ စစ်ဆေးရပါမယ်။
3.4 Certificates
Table	အဓိက Columns
certificates	id, enrollment_id, certificate_number, issued_at
certificate_templates	id, name, design_config
certificate_verifications	id, certificate_id, verification_code

Public Verification Page ကို ဒီလိုထားပါ။

/verify/{verification_code}
3.5 Software Solutions & CRM
Table	အဓိက Columns
service_categories	id, name, slug
services	id, category_id, title, description, status
service_requests	id, client_id, service_id, message, status
leads	id, name, email, phone, source, status
lead_activities	id, lead_id, activity_type, notes
clients	id, user_id, company_name, status
projects	id, client_id, title, description, status, start_date, due_date
project_members	project_id, user_id, role
project_milestones	id, project_id, title, status, due_date
project_tasks	id, milestone_id, assigned_to, title, status
project_updates	id, project_id, user_id, content
project_documents	id, project_id, file_path, uploaded_by
support_tickets	id, client_id, project_id, subject, status
ticket_messages	id, ticket_id, user_id, message

Project Workflow
#chatgpt-mermaid-_r_1kp_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1kp_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1kp_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1kp_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1kp_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1kp_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1kp_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1kp_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1kp_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1kp_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1kp_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1kp_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1kp_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1kp_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1kp_ p{margin:0;}#chatgpt-mermaid-_r_1kp_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1kp_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1kp_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1kp_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1kp_ .label text,#chatgpt-mermaid-_r_1kp_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1kp_ .node rect,#chatgpt-mermaid-_r_1kp_ .node circle,#chatgpt-mermaid-_r_1kp_ .node ellipse,#chatgpt-mermaid-_r_1kp_ .node polygon,#chatgpt-mermaid-_r_1kp_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1kp_ .rough-node .label text,#chatgpt-mermaid-_r_1kp_ .node .label text,#chatgpt-mermaid-_r_1kp_ .image-shape .label,#chatgpt-mermaid-_r_1kp_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1kp_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1kp_ .rough-node .label,#chatgpt-mermaid-_r_1kp_ .node .label,#chatgpt-mermaid-_r_1kp_ .image-shape .label,#chatgpt-mermaid-_r_1kp_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1kp_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1kp_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1kp_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1kp_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_1kp_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_1kp_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1kp_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1kp_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1kp_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_1kp_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_1kp_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1kp_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1kp_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1kp_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1kp_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1kp_ .icon-shape,#chatgpt-mermaid-_r_1kp_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1kp_ .icon-shape p,#chatgpt-mermaid-_r_1kp_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_1kp_ .icon-shape .label rect,#chatgpt-mermaid-_r_1kp_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1kp_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1kp_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1kp_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1kp_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1kp_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1kp_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1kp_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1kp_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1kp_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1kp_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1kp_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1kp_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1kp_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1kp_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1kp_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1kp_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_1kp_ .node rect,#chatgpt-mermaid-_r_1kp_ .node circle,#chatgpt-mermaid-_r_1kp_ .node ellipse,#chatgpt-mermaid-_r_1kp_ .node polygon,#chatgpt-mermaid-_r_1kp_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1kp_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1kp_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_1kp_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1kp_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1kp_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}New InquiryLeadRequirementsQuotationClient ApprovalProject CreatedDevelopmentTestingClient ReviewDeliveryMaintenance





3.6 Billing & Payments
Table	အဓိက Columns
quotations	id, client_id, quotation_number, subtotal, total, status
quotation_items	id, quotation_id, description, quantity, unit_price
invoices	id, client_id, invoice_number, total, due_date, status
invoice_items	id, invoice_id, description, quantity, unit_price
payments	id, invoice_id, amount, method, status, paid_at
payment_transactions	id, payment_id, provider_reference, payload
refunds	id, payment_id, amount, reason, status

Payment နဲ့ Invoice ကို သီးခြားထားပါ။ Partial Payment, Multiple Transactions နဲ့ Refund တွေကို နောက်ပိုင်းမှာ စီမံနိုင်ပါမယ်။
3.7 Shared Core
Table	Purpose
notifications	User Notifications
notification_preferences	Notification Settings
media_files	File Metadata
settings	Global Settings
contact_messages	Contact Inquiries
blog_posts	Blog Content
blog_categories	Blog Categories
portfolio_projects	Portfolio
portfolio_images	Portfolio Media
faqs	FAQ Content
system_logs	System Events


4. Database Relationship & Design Rules
Database ကို တည်ဆောက်တဲ့အခါ ဒီ Rules တွေကို အစကတည်းက သတ်မှတ်ပါ။
Primary Rules
1. Table အားလုံးမှာ Primary Key ထားပါ။
2. Foreign Key Constraints သုံးပါ။
3. Email ကို Unique သတ်မှတ်ပါ။
4. Course Slug, Invoice Number, Certificate Number တွေကို Unique ထားပါ။
5. created_at, updated_at ထည့်ပါ။
6. လိုအပ်တဲ့ Table တွေမှာ deleted_at (Soft Deletes) သုံးပါ။
7. Payment Amount တွေကို DECIMAL သုံးပါ။
8. Database Transaction သုံးပြီး Payment, Enrollment, Invoice Operations တွေကို စီမံပါ။
Important Indexes
users.email
courses.slug
courses.status
enrollments.student_id + course_id
lesson_progress.enrollment_id + lesson_id
assignments.course_id
submissions.student_id + assignment_id
projects.client_id
projects.status
project_tasks.assigned_to
invoices.invoice_number
payments.provider_reference
certificates.certificate_number


enrollments(student_id, course_id) မှာ Unique Constraint ထားပြီး Student တစ်ယောက် Course တစ်ခုကို Duplicate Enrollment မဖြစ်အောင် ကာကွယ်ပါ။

lesson_progress(enrollment_id, lesson_id) မှာလည်း Unique Constraint ထားပါ။
Database Naming Convention
- Table names: plural snake_case
- Column names: snake_case
- Model names: singular PascalCase
- Enum/Status values: consistent lowercase identifiers
- Foreign keys: {model}_id

5. UI/UX Design Specification
Code Nest ကို Professional Education Technology Brand ပုံစံ တည်ဆောက်ပါမယ်။
Design System
LIGHT FIRST · RESPONSIVE · ACCESSIBLE










Dashboard











Course Catalog











Learning Interface











Client Portal



Color Tokens

Primary

Text

Muted

Background

Border


Typography
- English: Inter
- Myanmar: Noto Sans Myanmar
- Heading: 600–700
- Body: 400–500
- Code: JetBrains Mono
UI Components
Reusable Component Library တစ်ခု တည်ဆောက်ထားပါ။
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── tabs.tsx
│   ├── pagination.tsx
│   ├── skeleton.tsx
│   └── toast.tsx
│
├── shared/
│   ├── app-sidebar.tsx
│   ├── app-header.tsx
│   ├── data-table.tsx
│   ├── page-header.tsx
│   ├── file-upload.tsx
│   ├── empty-state.tsx
│   └── confirm-dialog.tsx
│
└── academy/
    ├── course-card.tsx
    ├── lesson-player.tsx
    ├── progress-bar.tsx
    └── curriculum-list.tsx


UX Requirements
- Responsive Desktop, Tablet, Mobile
- Sidebar Navigation
- Breadcrumb Navigation
- Search & Filtering
- Pagination
- Loading Skeleton
- Empty States
- Form Validation
- Confirmation Dialog
- Toast Notifications
- Light/Dark Theme
- Keyboard Accessibility
- Myanmar & English Language Support

6. Functional Development Specifications
6.1 Authentication
Authentication မှာ -
- Register
- Login
- Logout
- Forgot Password
- Reset Password
- Email Verification
- Change Password
- Session Management
- Account Status
- Role-Based Redirect
Registration လုပ်တဲ့အခါ Student Account ကို Default Role အဖြစ် သတ်မှတ်နိုင်ပါတယ်။

Instructor, Admin Role တွေကို Public Registration ကနေ တိုက်ရိုက် ပေးခွင့်မရှိစေရပါဘူး။
6.2 Online Learning System
Learning System ရဲ့ အဓိက Workflow -
Student Register
      ↓
Browse Courses
      ↓
Course Details
      ↓
Enrollment / Payment
      ↓
Access Course
      ↓
Watch Lessons
      ↓
Track Progress
      ↓
Submit Assignments
      ↓
Complete Quiz
      ↓
Course Completion
      ↓
Certificate


Course Access Rules
- Free Course: Enrollment အတည်ပြုပြီး Access ပေးမယ်။
- Paid Course: Payment အတည်ပြုပြီးမှ Access ပေးမယ်။
- Draft Course: Public မမြင်ရ။
- Published Course: Public မှာ မြင်ရမယ်။
- Archived Course: Enrollment အသစ် ပိတ်နိုင်ရမယ်။
Lesson Completion ကို Student က Button နှိပ်ရုံနဲ့ အလိုအလျောက် အပြည့်အဝ မသတ်မှတ်သင့်ပါဘူး။ Video Progress, Lesson Type, Assignment Requirements အလိုက် စည်းမျဉ်း သတ်မှတ်ပါ။
6.3 Video Learning
Video တွေကို ကိုယ်ပိုင် VPS မှာ အားလုံး သိမ်းဆည်းတာထက် Dedicated Video Hosting သို့မဟုတ် Object Storage + CDN ကို အသုံးပြုပါ။

လိုအပ်တဲ့ Features -
- Video Player
- Resume Watching
- Playback Speed
- Lesson Navigation
- Captions / Subtitles
- Video Progress
- Access Authorization
Video URL တွေကို Public Database Response ထဲမှာ တိုက်ရိုက် မဖော်ပြဘဲ Authorized Access နဲ့ Expiring Signed URL သုံးပါ။
6.4 Agency Project System
Project Status တွေကို အောက်ပါအတိုင်း သတ်မှတ်ပါ။
inquiry
reviewing
quoted
approved
planning
in_progress
testing
client_review
completed
cancelled
on_hold


Client တစ်ယောက်က မိမိ Project တွေကိုပဲ မြင်ရပါမယ်။

Project Milestone တစ်ခုစီမှာ -
- Title
- Description
- Start Date
- Due Date
- Status
- Completion Percentage
- Assigned Team Members
- Attachments
တွေ ပါဝင်ရပါမယ်။
6.5 Notification System
Notification Channels -
- In-App Notifications
- Email Notifications
- Optional Push Notifications
ဥပမာ -
Event	Recipient
New Enrollment	Instructor
New Assignment	Student
Assignment Graded	Student
New Project	Client + Admin
Milestone Completed	Client
Invoice Created	Client
Payment Confirmed	Client + Admin

Queue အသုံးပြုပြီး Email နဲ့ Notification ပို့ခြင်းကို Background မှာ လုပ်ဆောင်ပါ။

7. API Architecture
လက်ရှိမှာ Inertia.js နဲ့ Web Application ကို အဓိက အသုံးပြုပါမယ်။

ဒါပေမဲ့ နောက်ပိုင်း Flutter App ထုတ်နိုင်ဖို့ API Layer ကို Domain အလိုက် ကြိုတင်စီစဉ်ပါ။
/api/v1/
│
├── auth/
│
├── academy/
│   ├── courses
│   ├── enrollments
│   ├── lessons
│   ├── progress
│   ├── assignments
│   ├── quizzes
│   └── certificates
│
├── solutions/
│   ├── services
│   ├── inquiries
│   ├── projects
│   ├── milestones
│   └── support
│
├── billing/
│   ├── quotations
│   ├── invoices
│   └── payments
│
├── notifications/
│
└── profile/


API Standard:
- RESTful API
- JSON Response
- API Versioning
- Form Request Validation
- Authorization Policies
- Rate Limiting
- Consistent Error Responses
- Pagination
- API Documentation (OpenAPI)
Web Authentication အတွက် Laravel Session ကို အသုံးပြုနိုင်ပြီး API Token လိုအပ်တဲ့ Mobile Client အတွက် Laravel Sanctum ကို အသုံးပြုပါ။

8. Security & Performance
ဒီအပိုင်းက Production မှာ အရေးကြီးဆုံးပါ။
Security
- Password Hashing
- CSRF Protection
- XSS Protection
- SQL Injection Prevention
- Role & Permission Checks
- Ownership Authorization
- Secure File Upload
- MIME Type Validation
- Rate Limiting
- Login Attempt Protection
- Secure Session Cookies
- HTTPS
- Secrets via Environment Variables
- Audit Logs
- Database Backups
အထူးသတိပြုရန်: Frontend မှာ Button ကို ဖျောက်ထားတာနဲ့ Permission ကာကွယ်ပြီးပြီလို့ မယူဆရပါဘူး။ Backend Policy မှာလည်း Access ကို စစ်ဆေးရပါမယ်။
Performance
- Redis Cache
- Database Indexing
- Query Optimization
- Eager Loading
- Queue Workers
- Image Optimization
- CDN
- Pagination
- Lazy Loading
- Asset Compression
- Database Backup Automation
Backup Strategy
- Daily Database Backup
- Off-site Backup Storage
- File Storage Backup Policy
- Backup Retention Policy
- Periodic Restore Testing
Backup ရှိရုံနဲ့ မလုံလောက်ပါဘူး။ Restore လုပ်ပြီး အမှန်တကယ် ပြန်လည်အသုံးပြုနိုင်မှုကို စစ်ဆေးပါ။

9. Development Roadmap & Milestones
အောက်ပါ Roadmap က Development Team အတွက် အကြမ်းဖျင်း ၁၂ ပတ် စီမံကိန်း ဖြစ်ပါတယ်။ အချိန်က Team Size နဲ့ Feature Complexity ပေါ်မူတည်ပြီး ပြောင်းလဲနိုင်ပါတယ်။
12-Week Development Plan
PLANNED DELIVERY ROADMAP
Phase 1 — Foundation & Branding
Week 1–2

Laravel setup

React + Inertia setup

Database foundation

Authentication & RBAC

Design system



Phase 2 — Public Website
Week 3

Home & About

Course Catalog

Services & Portfolio

Blog & Contact

SEO & Responsive UI



Phase 3 — Academy LMS
Week 4–6

Course Management

Student & Instructor Portals

Lessons & Video

Enrollment & Progress

Assignments & Quizzes



Phase 4 — Software Agency
Week 7–8

CRM & Leads

Client Portal

Project Management

Milestones & Tasks

Quotations



Phase 5 — Business Core
Week 9–10

Invoices & Payments

Certificates

Notifications

Reports

Email Integration



Phase 6 — Testing & Launch
Week 11–12

Automated Testing

Security Review

Performance Testing

Production Deployment

Documentation



Definition of Done
Feature တစ်ခုကို ပြီးပြီလို့ သတ်မှတ်ဖို့ -
- UI Completed
- Backend Validation Completed
- Authorization Tested
- Database Relations Verified
- Error Handling Implemented
- Automated Tests Passed
- Mobile Responsive Verified
- Documentation Updated
ဆိုတဲ့ Criteria တွေ ပြည့်မီရပါမယ်။
10. Deployment Architecture
အစပိုင်းမှာ Single VPS ပေါ်မှာ စတင်နိုင်ပါတယ်။
#chatgpt-mermaid-_r_1nr_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1nr_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1nr_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1nr_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1nr_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1nr_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1nr_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1nr_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1nr_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1nr_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1nr_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1nr_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1nr_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1nr_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1nr_ p{margin:0;}#chatgpt-mermaid-_r_1nr_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1nr_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1nr_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1nr_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1nr_ .label text,#chatgpt-mermaid-_r_1nr_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1nr_ .node rect,#chatgpt-mermaid-_r_1nr_ .node circle,#chatgpt-mermaid-_r_1nr_ .node ellipse,#chatgpt-mermaid-_r_1nr_ .node polygon,#chatgpt-mermaid-_r_1nr_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1nr_ .rough-node .label text,#chatgpt-mermaid-_r_1nr_ .node .label text,#chatgpt-mermaid-_r_1nr_ .image-shape .label,#chatgpt-mermaid-_r_1nr_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1nr_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1nr_ .rough-node .label,#chatgpt-mermaid-_r_1nr_ .node .label,#chatgpt-mermaid-_r_1nr_ .image-shape .label,#chatgpt-mermaid-_r_1nr_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1nr_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1nr_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1nr_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1nr_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_1nr_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_1nr_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1nr_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1nr_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1nr_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_1nr_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_1nr_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1nr_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1nr_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1nr_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1nr_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1nr_ .icon-shape,#chatgpt-mermaid-_r_1nr_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1nr_ .icon-shape p,#chatgpt-mermaid-_r_1nr_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_1nr_ .icon-shape .label rect,#chatgpt-mermaid-_r_1nr_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1nr_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1nr_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1nr_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1nr_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1nr_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1nr_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1nr_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1nr_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1nr_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1nr_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1nr_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1nr_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1nr_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1nr_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1nr_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1nr_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_1nr_ .node rect,#chatgpt-mermaid-_r_1nr_ .node circle,#chatgpt-mermaid-_r_1nr_ .node ellipse,#chatgpt-mermaid-_r_1nr_ .node polygon,#chatgpt-mermaid-_r_1nr_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1nr_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1nr_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_1nr_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1nr_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1nr_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}UsersCDN / DNS / SSLNginx Reverse ProxyLaravel + Inertia + ReactPostgreSQLRedisQueue WorkerLaravel SchedulerObject StorageEmail Provider





Recommended Infrastructure
Service	Recommendation
Server	Ubuntu VPS
Web Server	Nginx
Runtime	PHP-FPM
Database	PostgreSQL
Cache	Redis
SSL	Let's Encrypt
CI/CD	GitHub Actions
Storage	S3-compatible
Monitoring	Sentry / Laravel Logs
Backup	Remote Storage

Production မှာ Development, Staging, Production Environment သုံးခု ခွဲထားပါ။
Local Development
       ↓
GitHub Repository
       ↓
Automated Tests
       ↓
Staging Deployment
       ↓
Manual Approval
       ↓
Production Deployment


11. MVP နဲ့ Future Features ခွဲခြားခြင်း
အကုန်လုံးကို ပထမ Version မှာ မထည့်သင့်ပါဘူး။
Feature	MVP	Future
Public Website	Yes
Authentication	Yes
Course Management	Yes
Student Dashboard	Yes
Video Learning	Yes
Enrollment	Yes
Assignments	Yes
Client Inquiry	Yes
Project Management	Yes
Quotations & Invoices	Yes
Online Payment		Later
Live Classes		Later
AI Learning Assistant		Later
Mobile Application		Later
Advanced Analytics		Later
Affiliate System		Later

Online Payment ကို Later ထားတာက Myanmar မှာ အသုံးပြုမယ့် Payment Provider နဲ့ Merchant Integration အခြေအနေကို စစ်ဆေးပြီးမှ ထည့်သွင်းဖို့ပါ။

12. နောက်ဆုံး Architecture Decisions
အောက်ပါအချက်တွေကို Code Nest ရဲ့ Initial Technical Decisions အဖြစ် သတ်မှတ်ဖို့ အကြံပြုပါတယ်။
Decision	Selected
Architecture	Modular Monolith
Backend	Laravel
Frontend	React + TypeScript
Integration	Inertia.js
Database	PostgreSQL
Cache	Redis
UI	Tailwind + shadcn/ui
Authentication	Laravel Fortify
Authorization	Spatie Permission
API	Laravel Sanctum
Testing	Pest + Vitest
Deployment	Ubuntu + Nginx
Design	Light-first + Dark Mode
Language	English + Myanmar
Initial Platform	Responsive Web
Future Platform	Flutter App

13. မဖြစ်မနေ စဉ်းစားသင့်တဲ့ အချက် ၅ ချက်
1. Course Pricing: Free, Paid, Package-Based သုံးမျိုးလုံး Support လုပ်ပါ။
2. Course Ownership: Course တစ်ခုကို Instructor တစ်ယောက်ထက်ပိုပြီး တာဝန်ယူနိုင်အောင် ထားပါ။
3. Project Ownership: Client တစ်ယောက်ရဲ့ Project Data ကို အခြား Client မမြင်နိုင်အောင် Backend မှာ စစ်ဆေးပါ။
4. Financial Records: Payment History ကို မူရင်းမှတ်တမ်းမပျက်စေဘဲ Refund နဲ့ Adjustment သီးခြားမှတ်တမ်းတင်ပါ။
5. Scalability: အစကတည်းက Modular Design သုံးပြီး လိုအပ်လာတဲ့အခါ Domain တွေကို သီးခြား Service အဖြစ် ထုတ်နိုင်အောင် ရေးပါ။

14. အခု စတင်တည်ဆောက်မယ့် Project Definition
CODE NEST
Project Specification v1.0

One Platform. Two Businesses.
Learn programming. Build software. Grow together.

Business Modules
- Code Nest Academy
- Code Nest Solutions
- Code Nest Management
Primary Stack
- Laravel + Inertia.js + React
- PostgreSQL + Redis
- TypeScript + Tailwind CSS
Target Users
- Students
- Instructors
- Clients
- Administrators
- Development Team
Product Goal

A unified platform for online programming education and professional software development services.

Architecture document အတွင်း ပါဝင်သည့် အဓိကအပိုင်းများ
Sitemap
Architecture
Database
RBAC
API
Security
Deployment
Roadmap


Codexa MM — Brand Identity
Initial Brand Concept
Brand tagline: LEARN. BUILD. INNOVATE.

Brand positioning: Empowering Myanmar’s developers with world-class skills and solutions.
1. Brand divisions
Division	အဓိကလုပ်ငန်း
Codexa Academy	Programming Education & Online Courses
Codexa Solutions	Software Development & IT Services
Codexa Labs	Research & Digital Products

2. Brand colors

Primary
#2563EB

Dark
#0F172A

Accent
#60A5FA

Background
#F1F5F9

3. Typography
- English: Plus Jakarta Sans
- Myanmar: Noto Sans Myanmar
- Logo: Bold geometric sans-serif
4. Brand values
- Learn More
- Build Better
- Innovate Together
5. Website hero copy
Learn Programming. Build Real Solutions.

Join Codexa MM — Your partner in tech education and software development.

Buttons: Explore Courses · Our Services
