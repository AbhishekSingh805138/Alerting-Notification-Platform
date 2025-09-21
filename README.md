# Alerting & Notification Platform

A lightweight alerting system that gives admins rich visibility controls while allowing end users to manage recurring reminders. The platform is split into a Node.js/Express backend (TypeScript + TypeORM) and an Angular frontend.

## Features
- Admins can create, update, archive, and list alerts with org, team, or user visibility.
- Recurring reminders every 2 hours (configurable per alert) until snoozed for the day or the alert expires.
- User preferences track read/unread state, snoozes, and last delivery timestamps.
- In-app delivery channel with extensible strategy-friendly architecture for future channels.
- Analytics summary for total alerts, deliveries, reads, snoozes, and severity breakdowns.
- Seed script provisioning example teams, users, and sample alerts.

## Backend (Node.js + Express)
### Prerequisites
- Node.js 18+
- PostgreSQL 13+

### Setup
```bash
cd backend
cp .env.example .env # adjust credentials as needed
npm install
npm run seed
npm run dev
```
The server listens on `http://localhost:3000` by default.

### Key scripts
- `npm run dev` — start with ts-node-dev (watches for changes)
- `npm run build` — compile TypeScript to `dist`
- `npm start` — start compiled server
- `npm run seed` — initialize teams, users, and sample alerts
- `npm run lint` — lint TypeScript sources

### Environment variables
| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `DB_HOST` | Postgres host | `localhost` |
| `DB_PORT` | Postgres port | `5432` |
| `DB_NAME` | Database name | `Notification` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |

### API overview
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/admin/alerts` | Create alert |
| `PUT` | `/admin/alerts/:id` | Update alert |
| `GET` | `/admin/alerts` | List alerts with stats and filters |
| `GET` | `/admin/teams` | List teams |
| `GET` | `/admin/users` | List users |
| `POST` | `/admin/reminders/trigger` | Manually fire reminder job |
| `GET` | `/admin/analytics` | Aggregated analytics |
| `GET` | `/users/:userId/alerts` | Fetch alerts for a user (`?includeSnoozed=true`) |
| `PATCH` | `/users/:userId/alerts/:alertId/read-state` | Toggle read/unread |
| `POST` | `/users/:userId/alerts/:alertId/snooze` | Snooze for the current day |

Reminders can be triggered via the endpoint above. In production you can wire this to a scheduler/cron.

## Frontend (Angular)
### Setup
```bash
cd frontend
npm install
npm start
```
The development server runs at `http://localhost:4200` and expects the backend at `http://localhost:3000` (configure via `src/environments/environment.*.ts`).

### Highlights
- Admin console for creating alerts, toggling reminders, and viewing analytics.
- Team & user targeting via simple checklist selectors.
- End-user dashboard for snoozing or acknowledging alerts with optional snoozed history.

## Project Structure
```
backend/
  src/
    entities/              # TypeORM entities
    services/              # Alert, analytics, reminder orchestration
    controllers/           # Express controllers
    routes/                # Admin & user routers
    middleware/            # Error handler
    utils/                 # Date helpers
    seed.ts                # Database seed script
frontend/
  src/app/
    components/            # Admin & user dashboards
    services/              # API client
    models/                # Shared frontend types
```

## Testing & Validation
- Backend: `npm run lint` and targeted manual testing via the provided Angular UI or HTTP clients.
- Frontend: Run `npm run build` to ensure the Angular project compiles (unit tests not included in MVP scope).

## Next steps (future scope)
- Add email/SMS notification strategies.
- Configurable reminder cadences per alert or per user profile.
- Scheduled alerts & escalation policies.
- Authentication and role-based access for admin tooling.
