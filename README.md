# Codexa MM

**Learn. Build. Innovate.** Codexa MM is a Myanmar-focused learning and digital-solutions platform. The repository contains a Laravel application with an Inertia.js, React, and TypeScript frontend.

> **Project status:** Core public-site, learning-management, administration, client-portal, and finance code is present. This repository has not yet documented a production deployment or continuous-integration workflow. Treat seeded credentials and sample content as development-only. Review the [implementation roadmap](todo.md) and verify the current code and tests before deploying.

## Product areas

- **Public website:** course and service catalogues, portfolio, instructors, blog, FAQ, contact form, SEO metadata, sitemap, and certificate verification.
- **Codexa Academy:** role-based student and instructor portals; course curriculum and learning; enrollments and progress; assignments, quizzes, reviews, announcements, and certificates; administration and moderation.
- **Codexa Solutions:** service and lead management, projects, milestones, tasks, client documents, support, feedback, quotations, invoices, and payment records.
- **Administration and operations:** user and role management, content, settings, reports, activity logs, imports, integrations, scheduled campaigns, and live-class-related code.

The presence of a screen or route does not by itself mean the workflow has passed production testing. Payment-provider integration and other deployment-dependent capabilities may require additional configuration.

## Technology

- PHP 8.3 or newer and Laravel 13
- Inertia.js with React 18 and TypeScript
- Vite 8 and Tailwind CSS 4
- SQLite by default for local development; Laravel database configuration also defines other drivers
- Pest for application tests

## Requirements

Install PHP 8.3+, Composer, Node.js compatible with Vite 8 (Node.js 20.19+ or 22.12+), and npm. Enable the PHP extensions required by Laravel and the Composer packages, including PDO/SQLite when using the default local database.

## Local development

From the repository root:

```bash
composer install
cp .env.example .env
```

The default database is SQLite. Create its file before running migrations:

```bash
touch database/database.sqlite
php artisan key:generate
php artisan migrate --seed
```

Install frontend dependencies and compile assets:

```bash
npm ci
npm run build
```

Start the Laravel development server:

```bash
php artisan serve
```

Open `http://127.0.0.1:8000`. For frontend hot reload, run `npm run dev` in a second terminal while developing.

### Seeded development accounts

Running `php artisan db:seed` creates development accounts for the administrator, instructor, client, and student roles. The seeder uses the password `password`; example addresses include `admin@codexamm.test`, `instructor@codexamm.test`, `client@codexamm.test`, and `student@codexamm.test`.

**These credentials are public in source code and must never be used in a production environment.** Do not seed these accounts into a publicly accessible deployment. Create production accounts through a secure, controlled process and set unique credentials.

## Checks

Run the backend suite with:

```bash
php artisan test
```

Run the production frontend build with:

```bash
npm run build
```

TypeScript is configured in `tsconfig.json`. A dedicated `typecheck` script is not currently defined in `package.json`; use the project's chosen TypeScript command or add a maintained check script before relying on it in CI. Formatting and CI requirements are tracked in [`todo.md`](todo.md).

## Configuration notes

- `.env.example` is configured for local SQLite, database-backed sessions/cache/queue, and log-based mail. Configure real mail delivery, a production database, storage, queue workers, cache, and scheduler explicitly before deployment.
- Do not commit `.env`, production keys, API tokens, or user data.
- The scheduler includes a once-per-minute dispatch for scheduled email campaigns. A production scheduler/worker must be configured and monitored for this behavior to run.
- Review private file authorization and storage configuration before enabling uploads or serving user documents.

## Documentation and planning

- [Master implementation plan and launch checklist](todo.md)
- [Burmese README](README_MM.md)

## Contributing

Before changing the application, review [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md) for repository-specific development guidance. Keep changes focused, add or update tests for behavior changes, run the applicable checks, and update the roadmap when implementation status changes.

## Security

Do not report security vulnerabilities in public issues. Contact the repository maintainers privately through a security contact configured for this GitHub repository. Until a private security policy/contact is configured, avoid posting exploit details publicly.

## License

The repository does not currently contain a standalone `LICENSE` file. No license is stated here; contact the maintainers before redistributing or reusing the code.
