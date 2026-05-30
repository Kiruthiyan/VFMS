# VFMS project structure

Canonical layout for active development.

```
VFMS/
├── README.md                 # Project overview
├── docs/                     # Structure, security notes
├── backend/                  # Spring Boot API (Java 21)
│   ├── src/main/java/com/vfms/
│   │   ├── auth/             # Login, signup, JWT, password flows
│   │   ├── admin/            # Admin user management
│   │   ├── fuel/             # Fuel records API
│   │   ├── user/             # User profile
│   │   ├── security/         # JWT filter, SecurityConfig
│   │   ├── config/           # DataSeeder, app config
│   │   ├── dsm/              # Driver/staff module
│   │   ├── vehicle/          # Vehicles
│   │   ├── maintenance/      # Maintenance requests
│   │   ├── rental/           # Rentals & vendors
│   │   └── trip/             # Trip requests
│   ├── src/main/resources/
│   │   ├── application-dev.properties
│   │   ├── application.properties.example
│   │   ├── db/migration/     # SQL migrations
│   │   └── data/             # employee-registry.csv template
│   ├── scripts/              # Supabase reset helpers
│   ├── .env.example
│   └── pom.xml
├── frontend/                 # Next.js app (App Router)
│   ├── src/app/
│   │   ├── auth/             # Public auth pages
│   │   ├── admin/            # Admin UI (users, fuel)
│   │   ├── dashboards/       # Role dashboards (guarded)
│   │   ├── settings/         # Change password
│   │   └── dashboard/        # Legacy URL redirect only
│   ├── src/components/
│   ├── src/lib/              # API clients, validators, rbac
│   └── src/store/            # auth-store (Zustand)
└── .gitignore
```

## Run locally

```bash
# Backend (Supabase PostgreSQL via backend/.env)
cd backend
cp .env.example .env
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000/auth/login`

## Module ownership (high level)

| Area | Backend package | Frontend routes |
|------|-----------------|-----------------|
| Auth & users | `auth`, `admin`, `user` | `/auth/*`, `/admin/users/*`, `/settings/*` |
| Fuel | `fuel` | `/admin/fuel/*` |
| Drivers | `dsm` | `/drivers/*` |
| Vehicles / maintenance / rental | `vehicle`, `maintenance`, `rental` | various |
| Trips | `trip` | `/trips/*` |

## Legacy URLs

Old `/dashboard/**` routes redirect via `frontend/src/app/dashboard/[[...path]]/page.tsx` to login or the correct `/dashboards/{role}` path.
