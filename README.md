# Invoicer - Professional Billing Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/MoroccanTea/invoicer)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)
![GitHub issues](https://img.shields.io/github/issues/MoroccanTea/invoicer)

## Overview

![Invoicer Dashboard](./dashboard.png)

Invoicer is a full-stack invoice management solution built for freelancers and small businesses, with first-class support for Moroccan tax compliance (ICE, IF, TP, RC, TVA). It runs as a single Dockerized Next.js application backed by MongoDB and Redis.

## Key Features

- **Invoice Management** — Create, edit, and track invoices with multiple line items, optional tax (TVA), and automatic numbering per category/year
- **PDF Export** — Server-side A4 PDF generation with business branding, tax fields, banking info, digital signature and stamp
- **Client & Project Tracking** — Full client profiles with ICE numbers, project-based grouping, billing history
- **Role-Based Access Control** — Admin and user roles with fine-grained per-feature permissions (view, create, edit, delete, export)
- **Configuration System** — Morocco and generic modes; supports business logo, digital signature/stamp, bank details, footer text, tax settings
- **Reporting Dashboard** — Revenue charts, invoice status breakdown, top clients, and period comparisons (powered by Recharts)
- **Multi-Language UI** — English, French, Arabic, and Spanish (via next-intl)
- **Dark Mode** — System, light, and dark themes; print/PDF always renders in light mode regardless of active theme
- **Dockerized** — Development and production Docker Compose configs with MongoDB and Redis

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Auth | NextAuth v4 (JWT strategy, bcrypt password hashing) |
| Database | MongoDB 7 via Mongoose 9 |
| Cache / Sessions | Redis 7 via ioredis |
| PDF Generation | @react-pdf/renderer |
| Styling | Tailwind CSS v4 (CSS-first config, class-based dark mode) |
| i18n | next-intl 4 |
| Charts | Recharts 3 |
| Deployment | Docker, Docker Compose, Nginx |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 28+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.40+
- [Git](https://git-scm.com/downloads)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/MoroccanTea/invoicer.git
cd invoicer
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values. Required fields:

```ini
# MongoDB
MONGO_INITDB_ROOT_USERNAME=invoicer_admin
MONGO_INITDB_ROOT_PASSWORD=your_strong_password_here
MONGODB_URI=mongodb://invoicer_admin:your_strong_password_here@mongodb:27017/invoicer?authSource=admin

# NextAuth — generate with: openssl rand -hex 32
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Redis
REDIS_URL=redis://redis:6379

# Environment
NODE_ENV=development
```

> **Security**: Never commit `.env` to version control. Generate all secrets with `openssl rand -hex 32`.

### 3. Start the application

**Development** (hot reload, services exposed for debugging):
```bash
docker compose -f docker-compose.dev.yml up --build
# shortcut:
npm run docker:dev
```

**Production** (Nginx on port 80, optimized build):
```bash
docker compose up --build -d
# shortcut:
npm start
```

### 4. Access the application

| Environment | URL |
|---|---|
| Development | http://localhost:3000 |
| Production | http://localhost |

### 5. First login

On first startup, an admin account is created automatically:

- **Email**: `admin@invoicer.com`
- **Password**: printed in the container logs

```bash
docker logs invoicer_dev   # development
docker logs invoicer       # production
```

You will be prompted to change the password on first login.

## Available Scripts

```bash
npm run docker:dev    # Start development stack (docker-compose.dev.yml)
npm start             # Start production stack
npm run logs          # Tail all container logs
npm stop              # Stop all containers
npm run clean         # Remove containers and volumes
```

For local (non-Docker) development:
```bash
npm install
npm run dev           # Next.js dev server (requires local MongoDB + Redis)
npm run build         # Production build
npx tsc --noEmit      # TypeScript type check
```

## Project Structure

```
invoicer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/       # NextAuth handler
│   │   │   ├── auth/change-password/     # Password change endpoint
│   │   │   ├── clients/[id]/            # Client CRUD
│   │   │   ├── configuration/           # Business configuration
│   │   │   ├── invoices/
│   │   │   │   ├── route.ts             # Invoice list + create
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts         # Invoice get/update/delete
│   │   │   │       └── pdf/route.tsx    # PDF generation (A4, server-side)
│   │   │   ├── profile/                 # User profile
│   │   │   ├── projects/[id]/           # Project CRUD
│   │   │   ├── stats/                   # Dashboard statistics
│   │   │   └── users/[id]/              # User management (admin)
│   │   ├── dashboard/
│   │   │   ├── clients/                 # Client management UI
│   │   │   ├── configuration/           # Configuration UI (Morocco/generic)
│   │   │   ├── invoices/
│   │   │   │   ├── InvoicesClient.tsx   # Invoice list + create/edit modal
│   │   │   │   └── [id]/                # Invoice detail + print/download
│   │   │   ├── profile/                 # User profile UI
│   │   │   ├── projects/                # Project management UI
│   │   │   └── users/                   # User management UI (admin)
│   │   ├── login/                       # Login page
│   │   ├── change-password/             # Forced password change
│   │   ├── globals.css                  # Tailwind v4 CSS config + theme vars
│   │   └── layout.tsx                   # Root layout (providers, toaster)
│   ├── components/
│   │   ├── common/                      # LanguageSwitcher, ThemeToggle, etc.
│   │   ├── layout/                      # Sidebar, Header, DashboardLayout
│   │   └── providers/                   # SessionProvider, ThemeProvider
│   └── lib/
│       ├── auth/auth.ts                 # NextAuth config + JWT callbacks
│       ├── db/
│       │   ├── mongoose.ts              # MongoDB connection with retry
│       │   └── redis.ts                 # Redis client (SCAN-based key deletion)
│       ├── models/                      # Mongoose models (Invoice, Client, etc.)
│       └── utils/objectId.ts            # ObjectId validation utility
├── docker-compose.yml                   # Production compose
├── docker-compose.dev.yml               # Development compose
├── Dockerfile                           # Production image
├── Dockerfile.dev                       # Development image (hot reload)
└── nginx.conf                           # Nginx reverse proxy + security headers
```

## Security

The following security measures are implemented:

- **Password hashing** — bcrypt with salt rounds
- **JWT allowlist** — session updates only propagate safe fields (prevents privilege escalation via `trigger: update`)
- **Mass assignment protection** — all API routes use explicit field allowlists, never `Object.assign(model, body)`
- **ObjectId validation** — all `[id]` routes validate the ID before querying MongoDB
- **ReDoS prevention** — user-supplied search strings are regex-escaped before use in MongoDB `$regex`
- **Redis SCAN** — uses non-blocking cursor-based `SCAN` instead of `KEYS`
- **Nginx security headers** — HSTS, X-Frame-Options, X-Content-Type-Options, Content-Security-Policy, Permissions-Policy
- **Role-based access** — admin and user roles with per-feature permissions enforced on both API and UI layers

### Security best practices for deployment

- Generate all secrets with `openssl rand -hex 32`
- Change the auto-generated admin password immediately after first login
- Use HTTPS in production (configure your reverse proxy or load balancer)
- Keep MongoDB and Redis off public networks (handled by Docker internal network)
- Run `npm audit` regularly to check for dependency vulnerabilities

## Configuration

After logging in, visit **Dashboard → Configuration** to set up:

- Business name, address, logo
- Moroccan tax identifiers: ICE, IF (Identifiant Fiscal), TP (Taxe Professionnelle), RC (Registre du Commerce)
- Currency and tax name/rate
- Bank details (RIB, IBAN)
- Digital signature and company stamp images
- Invoice footer text and terms & conditions

## Docker Notes

### Development stack (`docker-compose.dev.yml`)

- App runs with `npm run dev` (hot reload via volume mount)
- MongoDB exposed on `27017`, Redis on `6380` (host port, avoids conflicts with any local Redis)
- Redis runs without persistence (`--save "" --appendonly no`) — safe for Windows Docker Desktop
- All services use `restart: unless-stopped`

### Production stack (`docker-compose.yml`)

- App runs as optimized Next.js standalone build
- Nginx on port 80 with gzip, security headers, and static asset caching
- MongoDB data persisted in a named Docker volume

### Checking service health

```bash
docker compose -f docker-compose.dev.yml ps
docker logs invoicer_dev
docker logs invoicer_mongodb_dev
docker logs invoicer_redis_dev
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
git clone https://github.com/MoroccanTea/invoicer.git
cd invoicer
cp .env.example .env   # fill in local values
npm run docker:dev
```

## License

MIT — see [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/MoroccanTea/invoicer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MoroccanTea/invoicer/discussions)
- **Email**: hamza@essad.ma

## Roadmap

### Core Features
- [x] JWT authentication with forced password change on first login
- [x] Fine-grained Role-Based Access Control (admin + per-feature permissions)
- [x] Invoice creation and management (line items, categories, billing types)
- [x] Optional tax (TVA) per invoice
- [x] Automatic invoice numbering per category/year
- [x] PDF export (server-side, A4, branded)
- [x] Print view (forced light mode regardless of theme)
- [x] Client management with Moroccan ICE support
- [x] Project-based invoice grouping
- [x] Business configuration (Morocco and generic modes)
- [x] Digital signature and company stamp on invoices
- [x] Multi-language UI (English, French, Arabic, Spanish)
- [x] Dark mode (system/light/dark)
- [x] Advanced reporting dashboard with charts
- [x] Dockerized deployment (dev + production)

### Planned
- [ ] Email notifications and payment reminders
- [ ] Two-factor authentication (2FA)
- [ ] Custom invoice template upload (XLSX, DOCX)
- [ ] Payment gateway integration
- [ ] Client portal
- [ ] Rate limiting
- [ ] Swagger API documentation
- [ ] Mobile application

---

Made with care for freelancers and small businesses in Morocco and beyond.
