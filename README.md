# Manokalpa — Integrated Wellness & Counselling Platform

Built by **Anve Groups** · Next.js 15 · Prisma · PostgreSQL (Neon) · Vercel

---

## Project Structure

```
manokalpa/
├── app/
│   ├── page.tsx              # Landing page
│   ├── not-found.tsx         # 404 page
│   ├── (auth)/
│   │   ├── login/            # Sign in page
│   │   └── register/         # Sign up page
│   ├── (landing)/
│   │   ├── privacy/          # Privacy policy
│   │   └── terms/            # Terms of service
│   ├── (platform)/           # User dashboard (protected)
│   │   ├── dashboard/        # Home dashboard
│   │   ├── appointments/     # Session booking & history
│   │   │   └── book/         # Multi-step booking wizard
│   │   ├── assessments/      # PHQ-9, GAD-7, WHO-5 etc.
│   │   │   └── [id]/         # Interactive assessment
│   │   ├── journal/          # Reflection journal
│   │   ├── events/           # Community events
│   │   ├── content/          # Learning hub (blogs, videos, podcasts)
│   │   ├── chat/             # Secure messaging + AI bot
│   │   ├── profile/          # User profile
│   │   └── notifications/    # Notification centre
│   ├── admin/                # Admin panel
│   │   ├── dashboard/        # Platform overview
│   │   ├── users/            # User management
│   │   ├── counsellors/      # Counsellor verification
│   │   ├── payments/         # Transaction management
│   │   └── content/          # CMS
│   ├── counsellor/           # Counsellor portal
│   │   ├── dashboard/        # Session overview
│   │   └── earnings/         # Earnings breakdown (70/30 split)
│   └── api/                  # REST API routes
│       ├── auth/login/       # POST — login
│       ├── auth/register/    # POST — register
│       ├── appointments/     # GET, POST
│       ├── assessments/      # GET
│       ├── content/          # GET
│       ├── counsellors/      # GET
│       ├── events/           # GET, POST
│       ├── journal/          # GET, POST
│       ├── payments/         # POST, PUT (webhook)
│       └── contact/          # POST — contact form
├── components/
│   ├── landing/              # 10 landing page sections
│   ├── platform/             # Sidebar, TopBar, BottomNav
│   ├── admin/                # AdminSidebar
│   └── counsellor/           # CounsellorSidebar
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   └── utils.ts              # Helpers (cn, formatCurrency, etc.)
├── prisma/
│   ├── schema.prisma         # Full DB schema
│   └── seed.ts               # Seed data
├── public/
│   ├── logo.svg              # Manokalpa logo (colour)
│   └── logo-white.svg        # Manokalpa logo (white)
└── middleware.ts             # JWT auth + role-based routing
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI primitives |
| Animation | Framer Motion |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| ORM | Prisma 5 |
| Auth | JWT (custom) + bcrypt |
| Payments | Razorpay |
| Media | Cloudinary |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo>
cd manokalpa
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL="postgresql://..."   # Neon connection string
NEXTAUTH_SECRET="..."
JWT_SECRET="..."
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

Seed creates:
- **Super Admin:** `hi.lokeshrm@gmail.com` / `Loki@2026`
- **Admin:** `admin@manokalpa.in` / `Admin@123`
- **Demo User:** `priya@example.com` / `User@123`
- Sample assessments, events, and subscription plans

### 4. Run Dev Server

```bash
npm run dev
# → http://localhost:3000
```

> **Note:** `npm run build` has a known issue on Windows with Node.js v22 due to a webpack/enhanced-resolve incompatibility. The dev server works fully. The production build succeeds on Vercel (Linux). If you need to build locally on Windows, use Node.js v20 LTS.

---

## Deploying to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (Neon connection string)
   - `DIRECT_URL` (Neon direct connection for migrations)
   - `NEXTAUTH_SECRET`
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
4. Deploy — Vercel runs `prisma generate && next build` automatically

---

## User Roles

| Role | Access |
|------|--------|
| `USER` | Platform dashboard, appointments, assessments, journal, events, content, chat |
| `COUNSELLOR` | Counsellor portal — schedule, clients, reports, earnings |
| `SUPERVISOR` | Review session reports, monitor counsellor quality |
| `ADMIN` | Full platform management — users, payments, content, analytics |

---

## Earnings Model

Per the proposal:
- **Counsellor:** 70% of session fee
- **Platform (Manokalpa):** 30%
- **TDS:** 10% deducted from counsellor share
- **Net to Counsellor:** 63% of gross fee

---

## Key Pages

| URL | Description |
|-----|-------------|
| `/` | Landing page with all sections |
| `/login` | Sign in |
| `/register` | Create account (User or Counsellor) |
| `/dashboard` | User home |
| `/appointments/book` | 4-step booking wizard |
| `/assessments` | PHQ-9, GAD-7, WHO-5, PSS |
| `/journal` | Daily reflection journal |
| `/chat` | Secure messaging + AI companion |
| `/admin/dashboard` | Admin overview |
| `/counsellor/earnings` | Earnings with 70/30 breakdown |

---

Built with ♥ by [Anve Groups](https://github.com/anve-company/manokalpa) for Manokalpa Wellness
