# Manokalpa — Development Status
> Last updated: 2026-03-22

---

## Legend
- ✅ Done & working
- 🟡 UI built, not wired to backend (mock/hardcoded data)
- 🔴 Not built yet (stub or missing entirely)

---

## 1. Infrastructure & Setup

| Item | Status | Notes |
|------|--------|-------|
| Next.js 15.5 + React 19 + TypeScript | ✅ | |
| Tailwind CSS + Radix UI + Framer Motion | ✅ | |
| Prisma schema (25+ models) | ✅ | |
| Neon PostgreSQL — tables created | ✅ | `npm run db:push` done |
| Seed data (admin, user, assessments, events, plans) | ✅ | |
| JWT auth middleware (route protection) | ✅ | `middleware.ts` |
| Role-based redirect on login | ✅ | ADMIN → /admin, COUNSELLOR → /counsellor, USER → /dashboard |
| `.env` / `.env.local` configured | ✅ | Direct URL for local dev |
| Razorpay keys | 🔴 | Placeholder values only |
| Cloudinary keys | 🔴 | Placeholder values only |
| Email service (Resend / Nodemailer) | 🔴 | Not set up |
| Real-time (WebSocket / Pusher) | 🔴 | Not set up |

---

## 2. Landing Page (`/`)

| Section | Status | Notes |
|---------|--------|-------|
| Navbar (logo, links, login CTA) | ✅ | |
| Hero section | ✅ | |
| About section | ✅ | |
| Services section | ✅ | |
| How It Works section | ✅ | |
| Team section (no individual profiles) | ✅ | |
| Events section | ✅ | |
| Testimonials section | ✅ | |
| CTA section | ✅ | |
| Contact form (UI) | ✅ | |
| Contact form → save to DB | ✅ | `/api/contact` route exists |
| Footer | ✅ | |
| Privacy Policy page | ✅ | |
| Terms & Conditions page | ✅ | |

---

## 3. Authentication

| Item | Status | Notes |
|------|--------|-------|
| Login page UI | ✅ | |
| Login API (`/api/auth/login`) | ✅ | bcrypt + JWT cookie |
| Register page UI | ✅ | |
| Register API (`/api/auth/register`) | ✅ | |
| Logout (sign out button) | 🔴 | Button exists in sidebar but has no handler |
| Forgot password page | 🔴 | |
| OTP send API | 🔴 | OTP model in DB, no API route |
| OTP verify API | 🔴 | |
| Email verification flow | 🔴 | |
| `/api/me` — get current user from JWT | 🔴 | Needed by all dashboard pages |

---

## 4. User Platform — Sidebar & Layout

| Item | Status | Notes |
|------|--------|-------|
| Desktop sidebar | ✅ | Collapse/expand works |
| Mobile bottom nav | ✅ | |
| Active link highlighting | ✅ | |
| TopBar — user name | 🟡 | Hardcoded, needs JWT/session |
| TopBar — notification badge count | 🟡 | Hardcoded "3", needs real unread count |
| TopBar — user avatar dropdown | 🔴 | No menu/handler |
| Sign out button | 🔴 | No handler, needs clear cookie + redirect |

---

## 5. User Dashboard (`/dashboard`)

| Item | Status | Notes |
|------|--------|-------|
| Page UI & layout | ✅ | |
| Stats cards (sessions, wellness, journal, rating) | 🟡 | Hardcoded numbers |
| Upcoming session card | 🟡 | Hardcoded appointment |
| Recent activity list | 🟡 | Hardcoded 3 items |
| Mood check-in buttons | 🟡 | UI only — no save to DB |
| "Join Session" button | 🔴 | No handler |
| Fetch real data on page load | 🔴 | No API calls at all |

---

## 6. Appointments (`/appointments`)

| Item | Status | Notes |
|------|--------|-------|
| Appointments list UI | ✅ | |
| Fetch appointments from DB | 🔴 | Hardcoded 3 items, `/api/appointments` not called |
| Tab filters (Upcoming / Completed / Cancelled) | 🟡 | UI only, no filter logic |
| Reschedule button | 🔴 | No handler |
| Cancel button | 🔴 | No handler |
| View report button | 🔴 | No handler |
| "Join Session" link | 🔴 | No meeting link wired |

---

## 7. Book Appointment (`/appointments/book`)

| Item | Status | Notes |
|------|--------|-------|
| 4-step wizard UI | ✅ | |
| Step navigation (next/back) | ✅ | |
| Calendar date picker logic | ✅ | Client-side |
| Price calculation display | ✅ | Client-side |
| Counsellor list | 🟡 | Hardcoded 4 counsellors, needs `/api/counsellors` |
| Available time slots | 🟡 | Hardcoded 9am–6pm, needs availability API |
| "Confirm & Pay" button | 🔴 | No handler at all |
| POST to `/api/appointments` | 🔴 | |
| Razorpay payment flow | 🔴 | Order creation → checkout modal → verify |
| Booking confirmation email | 🔴 | |

---

## 8. Assessments (`/assessments`)

| Item | Status | Notes |
|------|--------|-------|
| Assessments list UI | ✅ | |
| Fetch assessments from DB | 🔴 | Hardcoded 5 items, `/api/assessments` not called |
| Progress summary (completed/pending/score) | 🟡 | Hardcoded |
| Start / retake assessment links | ✅ | Navigation works |

### Assessment Quiz (`/assessments/[id]`)

| Item | Status | Notes |
|------|--------|-------|
| Question-by-question UI | ✅ | |
| Answer selection + progress bar | ✅ | Client-side |
| Score calculation + result page | ✅ | Client-side logic |
| Fetch questions from DB by ID | 🔴 | Only PHQ-9 hardcoded |
| Save answers + result to DB | 🔴 | No POST on submit |
| View past results / history | 🔴 | |

---

## 9. Journal (`/journal`)

| Item | Status | Notes |
|------|--------|-------|
| Journal entry form UI | ✅ | |
| Mood selector (emoji 1–5) | ✅ | State works |
| Thought / feeling / reaction / reframe fields | ✅ | State works |
| "Save Entry" button | 🔴 | No handler, no API call |
| Fetch past entries from DB | 🔴 | Hardcoded 3 entries |
| Tags input | 🟡 | UI only, not included in save |
| Edit / delete entry | 🔴 | |
| Search / filter by tag or mood | 🔴 | |

---

## 10. Chat (`/chat`)

| Item | Status | Notes |
|------|--------|-------|
| Chat UI (sidebar + message area) | ✅ | |
| Conversation switching | ✅ | Client-side |
| Message history display | 🟡 | Hardcoded 5 messages |
| Send message | 🔴 | Clears input only, no POST |
| Fetch conversations from DB | 🔴 | |
| Real-time updates (WebSocket / polling) | 🔴 | |
| Video / Phone call buttons | 🔴 | No handler |
| Unread badge counts | 🟡 | Hardcoded |

---

## 11. Profile (`/profile`)

| Item | Status | Notes |
|------|--------|-------|
| Profile display + edit toggle UI | ✅ | |
| Form fields (name, email, DOB, city, etc.) | ✅ | State works |
| Fetch logged-in user data | 🔴 | Hardcoded "Priya Mehta" |
| "Save Changes" button | 🔴 | No handler, no PATCH API call |
| Profile picture upload | 🔴 | No Cloudinary handler |
| Health metrics sliders | 🟡 | Hardcoded values, needs `health_details` table |
| Stats badges (sessions, journal, assessments) | 🟡 | Hardcoded counts |

---

## 12. Events (`/events`)

| Item | Status | Notes |
|------|--------|-------|
| Events list UI | ✅ | |
| Fetch events from DB | 🔴 | Hardcoded 4 items |
| Category tab filters | 🟡 | UI only, no filter logic |
| "Register" button | 🔴 | No handler |
| "Join" button for registered events | 🔴 | No handler |
| Registration status per user | 🔴 | |

---

## 13. Content / Learning Hub (`/content`)

| Item | Status | Notes |
|------|--------|-------|
| Content grid UI | ✅ | |
| Fetch content from DB | 🔴 | Hardcoded 6 items |
| Category / type tab filters | 🟡 | UI only, no filter logic |
| Content detail page | 🔴 | No route exists |
| Video / audio player | 🔴 | |
| Like / bookmark content | 🔴 | |

---

## 14. Notifications (`/notifications`)

| Item | Status | Notes |
|------|--------|-------|
| Notifications list UI | ✅ | |
| Fetch notifications from DB | 🔴 | Hardcoded 5 items |
| Mark as read (individual) | 🔴 | No handler |
| "Mark all as read" button | 🔴 | No handler |
| Real-time push notifications | 🔴 | |

---

## 15. Admin — Layout & Sidebar

| Item | Status | Notes |
|------|--------|-------|
| Admin sidebar UI | ✅ | |
| Active link highlighting | ✅ | |
| Sign out button | 🔴 | No handler |

---

## 16. Admin Dashboard (`/admin/dashboard`)

| Item | Status | Notes |
|------|--------|-------|
| Dashboard UI & layout | ✅ | |
| Stats cards (users, counsellors, sessions, revenue) | 🟡 | Hardcoded numbers |
| Revenue bar chart | 🟡 | Hardcoded 5 months |
| Pending tasks with counts | 🟡 | Hardcoded |
| Recent registrations list | 🟡 | Hardcoded 4 users |
| Fetch real aggregate data from DB | 🔴 | No API calls |
| "Export Report" button | 🔴 | No handler |

---

## 17. Admin — Users (`/admin/users`)

| Item | Status | Notes |
|------|--------|-------|
| Users table UI | ✅ | |
| Client-side search (name/email) | ✅ | Works |
| Fetch users from DB | 🔴 | Hardcoded 5 users |
| Role tab filters | 🟡 | UI only, no filter logic |
| Add user form / modal | 🔴 | No handler |
| Edit user | 🔴 | No handler |
| Deactivate / delete user | 🔴 | No handler |

---

## 18. Admin — Counsellors (`/admin/counsellors`)

| Item | Status | Notes |
|------|--------|-------|
| Counsellors table UI | ✅ | |
| Fetch counsellors from DB | 🔴 | Hardcoded 7 counsellors |
| Verify counsellor button | 🔴 | UI exists, no handler |
| View counsellor profile | 🔴 | No route |
| Suspend / remove counsellor | 🔴 | |

---

## 19. Admin — Payments (`/admin/payments`)

| Item | Status | Notes |
|------|--------|-------|
| Payments table UI | ✅ | |
| Fetch payments from DB | 🔴 | Hardcoded 4 transactions |
| Verify payment button | 🔴 | UI exists, no handler |
| "Export CSV" button | 🔴 | No handler |
| Payment status filter | 🟡 | UI only |
| Razorpay webhook handler | ✅ | `/api/payments` route exists |

---

## 20. Admin — Content (`/admin/content`)

| Item | Status | Notes |
|------|--------|-------|
| Content table UI | ✅ | |
| Client-side search | ✅ | Works |
| Fetch content from DB | 🔴 | Hardcoded 4 items |
| Create new content | 🔴 | No form/modal |
| Edit content | 🔴 | No handler |
| Delete content | 🔴 | No handler |
| Publish / archive toggle | 🔴 | |
| File / media upload | 🔴 | Cloudinary not wired |

---

## 21. Admin — Stub Pages (not built)

| Page | Status |
|------|--------|
| `/admin/appointments` | 🔴 Not built |
| `/admin/reports` | 🔴 "Coming Soon" stub |
| `/admin/analytics` | 🔴 "Coming Soon" stub |
| `/admin/settings` | 🔴 "Coming Soon" stub |

---

## 22. Counsellor — Layout & Sidebar

| Item | Status | Notes |
|------|--------|-------|
| Counsellor sidebar UI | ✅ | |
| Active link highlighting | ✅ | |
| Sign out button | 🔴 | No handler |

---

## 23. Counsellor Dashboard (`/counsellor/dashboard`)

| Item | Status | Notes |
|------|--------|-------|
| Dashboard UI & layout | ✅ | |
| Stats (sessions, clients, rating, earnings) | 🟡 | Hardcoded |
| Today's sessions list | 🟡 | Hardcoded 2 sessions |
| Pending reports list | 🟡 | Hardcoded 2 reports |
| "Join Session" button | 🔴 | No handler |
| "Write Report" button | 🔴 | No handler / page |
| Fetch real data from DB | 🔴 | No API calls |

---

## 24. Counsellor Earnings (`/counsellor/earnings`)

| Item | Status | Notes |
|------|--------|-------|
| Earnings UI (gross / share / TDS / net) | ✅ | |
| Session-by-session breakdown table | ✅ | |
| Fetch real earnings from DB | 🔴 | All numbers hardcoded |
| "Export Statement" button | 🔴 | No handler |
| Date range filter | 🔴 | |

---

## 25. Counsellor — Pages Not Built Yet

| Page | Status |
|------|--------|
| `/counsellor/appointments` | 🔴 "Coming Soon" stub |
| `/counsellor/clients` | 🔴 "Coming Soon" stub |
| `/counsellor/reports` | 🔴 "Coming Soon" stub |
| `/counsellor/profile` | 🔴 Not built |
| `/counsellor/events` | 🔴 Not built |
| `/counsellor/feedback` | 🔴 Not built |

---

## 26. Supervisor Role

| Item | Status |
|------|--------|
| Supervisor layout / sidebar | 🔴 Not built |
| Supervisor dashboard | 🔴 Not built |
| Review session reports | 🔴 Not built |
| Manage counsellors under supervision | 🔴 Not built |

---

## 27. API Routes

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| `/api/auth/login` | POST | ✅ | bcrypt + JWT cookie |
| `/api/auth/register` | POST | ✅ | Create user + profile |
| `/api/auth/logout` | POST | 🔴 | Not built |
| `/api/me` | GET | 🔴 | Get current user from JWT |
| `/api/appointments` | GET | ✅ | Fetch with counsellor details |
| `/api/appointments` | POST | ✅ | Create appointment |
| `/api/appointments/[id]` | PATCH | 🔴 | Reschedule / cancel |
| `/api/assessments` | GET | ✅ | Fetch active assessments |
| `/api/assessments/[id]` | GET | 🔴 | Fetch questions by ID |
| `/api/assessments/submit` | POST | 🔴 | Save answers + result |
| `/api/journal` | GET | ✅ | Fetch user reflections |
| `/api/journal` | POST | ✅ | Create reflection |
| `/api/journal/[id]` | PATCH/DELETE | 🔴 | Edit / delete entry |
| `/api/counsellors` | GET | ✅ | Fetch verified counsellors |
| `/api/counsellors/[id]/availability` | GET | 🔴 | Fetch available slots |
| `/api/events` | GET | ✅ | Fetch events |
| `/api/events` | POST | ✅ | Create event |
| `/api/events/[id]/register` | POST | 🔴 | Register for event |
| `/api/content` | GET | ✅ | Fetch published content |
| `/api/content` | POST | 🔴 | Create content (admin) |
| `/api/content/[id]` | PATCH/DELETE | 🔴 | Edit / delete content |
| `/api/payments` | POST | ✅ | Create payment record |
| `/api/payments` | PUT | ✅ | Razorpay webhook |
| `/api/notifications` | GET | 🔴 | Fetch user notifications |
| `/api/notifications/read` | PATCH | 🔴 | Mark as read |
| `/api/contact` | POST | ✅ | Save contact enquiry |
| `/api/admin/stats` | GET | 🔴 | Aggregate stats for admin |
| `/api/admin/users` | GET | 🔴 | All users for admin |
| `/api/admin/counsellors/verify` | PATCH | 🔴 | Verify counsellor |
| `/api/otp/send` | POST | 🔴 | Send OTP |
| `/api/otp/verify` | POST | 🔴 | Verify OTP |
| `/api/upload` | POST | 🔴 | Cloudinary upload |

---

## 28. Integrations

| Integration | Status | Notes |
|-------------|--------|-------|
| Razorpay — payment order creation | 🔴 | Keys placeholder only |
| Razorpay — checkout modal (client) | 🔴 | |
| Razorpay — webhook verification | ✅ | Handler in `/api/payments` |
| Cloudinary — image upload | 🔴 | Keys placeholder only |
| Email (Resend / Nodemailer) | 🔴 | Not set up at all |
| Video sessions (Daily.co / Jitsi) | 🔴 | meetingLink field in DB, no integration |
| Real-time chat (WebSocket / Pusher) | 🔴 | |
| Push notifications | 🔴 | |

---

## Quick Summary

| Category | Done | Partial (UI only) | Not Built |
|----------|------|--------------------|-----------|
| Landing + Auth | 14 | 0 | 5 |
| User platform pages | 11 | 0 | 0 |
| User platform — data wiring | 0 | 4 | 35 |
| Admin pages | 5 | 0 | 4 |
| Admin — data wiring | 2 | 3 | 18 |
| Counsellor pages | 2 | 0 | 6 |
| Counsellor — data wiring | 0 | 1 | 10 |
| API routes | 12 | 0 | 19 |
| Integrations | 1 | 0 | 7 |

**The UI is ~85% built. The backend wiring is ~25% complete.**

---

## Suggested Build Order

### Phase 2 — Connect the Data Layer
1. `GET /api/me` + sign-out → fix all dashboards showing real user
2. Wire user dashboard stats, appointments list, assessments list from DB
3. Wire booking wizard → POST appointment → Razorpay payment flow
4. Wire journal save / fetch
5. Wire assessments quiz → save results to DB
6. Wire profile edit + health metrics save
7. Wire events registration
8. Wire notifications fetch + mark as read
9. Wire admin dashboard stats from DB
10. Wire admin users / counsellors / payments tables from DB

### Phase 3 — Counsellor Workflow
11. Counsellor appointments page
12. Counsellor clients page
13. Counsellor session reports page
14. Counsellor profile edit (expertise, availability, bio)
15. Counsellor earnings from real DB data

### Phase 4 — Admin Tools
16. Admin appointments overview
17. Admin analytics / charts
18. Admin counsellor verify workflow
19. Admin payment verify / CSV export
20. Admin content CMS (create/edit/delete + Cloudinary)
21. Admin settings

### Phase 5 — Integrations
22. Razorpay full flow (order → modal → verify)
23. Email notifications (Resend) — confirmations, reminders
24. Cloudinary file uploads (avatars, content)
25. Video sessions (Daily.co embed)
26. Supervisor role & pages
27. OTP verification flow
