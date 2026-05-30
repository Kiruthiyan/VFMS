# FleetPro — Vehicle Fleet Management System (VFMS)

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)

Enterprise fleet platform: vehicles, maintenance, rentals, drivers, trips, fuel, and role-based administration.

## Repository layout

| Path | Purpose |
|------|---------|
| [`backend/`](backend/) | Spring Boot REST API |
| [`frontend/`](frontend/) | Next.js web app |
| [`docs/`](docs/) | Structure, security, history notes |

See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for the full tree and module map.

## Quick start

**Backend** (requires Java 21, Supabase PostgreSQL via `backend/.env`):

```bash
cd backend
cp .env.example .env
./mvnw spring-boot:run
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000` — login at `/auth/login`.

Configure `backend/.env` for database, JWT, SMTP, CORS, and optional admin seed (`ADMIN_SEED_*`).

## Security

- JWT auth with refresh tokens
- Staff self-registration only via employee registry (`SYSTEM_USER`)
- Admin / driver / approver accounts created by administrators
- Protected dashboards under `/dashboards/*` and admin UI under `/admin/*`

Details: [docs/SECURITY_REMEDIATION.md](docs/SECURITY_REMEDIATION.md)

## Roles & dashboards

| Role | Dashboard |
|------|-----------|
| ADMIN | `/dashboards/admin` |
| APPROVER | `/dashboards/approver` |
| SYSTEM_USER (staff) | `/dashboards/staff` |
| DRIVER | `/dashboards/driver` |

## License

Academic / team project — see course or team guidelines.
