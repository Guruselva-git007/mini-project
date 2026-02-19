# Crowdsourced Civic Issue Reporting System

Production-ready full-stack implementation with React, Express, PostgreSQL, JWT auth, geolocation, duplicate detection, prioritization, and WebSocket updates.

## Tech Stack
- Frontend: React + Vite + React Router + React Leaflet
- Backend: Node.js + Express + Socket.IO
- Database: PostgreSQL
- Auth: JWT (role-based)
- Uploads: Local mock storage (`backend/uploads`) with cloud adapter-ready service
- Maps: OpenStreetMap (Leaflet)

## Folder Structure
```text
Crowdsourced Civic Issue Reporting System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── issues/
│   │   │   ├── comments/
│   │   │   ├── dashboard/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── sql/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── uploads/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── issues/
│   │   │   ├── map/
│   │   │   ├── dashboard/
│   │   │   └── layout/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Database Schema
Implemented in `backend/sql/schema.sql`:
- `users`
- `issues`
- `comments`
- `status_logs`

Supporting tables for scalability:
- `departments`
- `issue_reports`

## API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/guest`
- `GET /api/auth/me`

### Issues
- `POST /api/issues` (multipart upload + GPS + duplicate detection)
- `GET /api/issues` (filters: status/category/location/radius/search)
- `GET /api/issues/me`
- `GET /api/issues/:issueId`
- `PATCH /api/issues/:issueId/status` (Authority/Admin)

### Comments
- `GET /api/issues/:issueId/comments`
- `POST /api/issues/:issueId/comments`

### Dashboard
- `GET /api/dashboard/citizen`
- `GET /api/dashboard/authority`
- `GET /api/dashboard/admin`

### Admin
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId`
- `GET /api/admin/departments`
- `POST /api/admin/departments`

## Real-time Events (Socket.IO)
- `issue:created`
- `issue:updated`
- `issue:merged`
- `comment:added`

## Local Run Instructions

### 1. Start PostgreSQL
```bash
docker compose up -d
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## One-Command Local Orchestration

```bash
./scripts/start-all.sh
```

This script will:
- start PostgreSQL (Homebrew service) if needed
- create `civic_issues` database if missing
- apply schema + seed
- ensure local `.env` values for backend/frontend
- start backend and frontend in background

Useful commands:

```bash
./scripts/status.sh
./scripts/stop-all.sh
```

## Seed Accounts
- Admin: `admin@civic.local` / `Admin@123`
- Authority: `authority@civic.local` / `Authority@123`
- Citizen: `citizen@civic.local` / `Citizen@123`

Guest mode is available from the login screen via **Continue as Guest** (Citizen role).

## Key Implemented Features
- JWT authentication with role-based access (`Citizen`, `Authority`, `Admin`)
- Issue reporting with image upload + GPS capture + timestamp
- Duplicate issue detection via geo-radius and title similarity
- Priority scoring based on report count + severity + age
- Role dashboards for citizens, authorities, and admins
- Filtering by location/category/status
- Real-time updates with WebSockets
