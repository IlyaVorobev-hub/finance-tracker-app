# Finance & Tutor Management Platform

A full-stack SaaS web application combining financial tracking, tutoring CRM, lesson scheduling, homework management, and a student portal.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, Python 3.13, SQLAlchemy 2, Alembic |
| Frontend | Next.js 15, React 18, TypeScript, TailwindCSS, shadcn/ui |
| Database | PostgreSQL 16 (Supabase) |
| Storage | Supabase Storage (or local filesystem) |
| Auth | JWT + Refresh Tokens |
| DevOps | Docker, Docker Compose |

## Features

- **Role-Based Access Control** - SuperAdmin, Admin, Tutor, Student roles with granular permissions
- **Finance Tracking** - Income/expenses management, categories, analytics dashboards
- **Student Management** - CRM for tutoring students with status tracking
- **Lesson Scheduling** - Calendar view, recurring lessons, conflict detection
- **Homework System** - Assignments with file uploads, grading, and archival
- **Student Portal** - Self-service portal for students (schedule, homework, payments)
- **Dark Mode** - Full dark mode support via next-themes
- **Responsive Design** - Mobile-first responsive UI

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 20+
- Docker & Docker Compose

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd finance-tutor-app

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Start database
docker-compose up -d db pgadmin

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Setup frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/v1 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| pgAdmin | http://localhost:5050 |

## Environment Variables

See [`.env.example`](.env.example) for all environment variables with descriptions.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret for JWT token generation (min 32 chars)
- `JWT_REFRESH_SECRET_KEY` - Secret for refresh tokens (min 32 chars)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (backend only)

## API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Endpoints Summary

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/v1/auth` | Registration, login, token refresh |
| Users | `/api/v1/users` | User management (admin only) |
| Finance | `/api/v1/finance` | Transactions, categories, analytics |
| Students | `/api/v1/students` | Student CRM |
| Lessons | `/api/v1/lessons` | Lesson scheduling and calendar |
| Homework | `/api/v1/homework` | Homework assignments and files |
| Files | `/api/v1/files` | File upload/download |
| Portal | `/api/v1/portal` | Student self-service portal |

See [API.md](API.md) for complete endpoint documentation.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

```bash
# Frontend (Vercel)
# Connect GitHub repo, set environment variables, deploy

# Backend (Render)
# Connect GitHub repo, set build/start commands, configure environment

# Database (Supabase)
# Create project, get connection string, create storage buckets
```

### Cost Analysis

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Vercel (Frontend) | 100GB bandwidth | $0 |
| Render (Backend) | 750 hours | $0 |
| Supabase (DB + Storage) | 500MB DB, 1GB storage | $0 |
| **Total** | | **$0** |

## Development

### Make Commands

```bash
make help           # Show all available commands
make install        # Install all dependencies
make dev            # Start development environment
make test           # Run tests with coverage
make test-unit      # Run unit tests only
make test-integration # Run integration tests only
make lint           # Run linters
make format         # Format code
make docker-up      # Start Docker services
make docker-down    # Stop Docker services
make migrate        # Run database migrations
```

### Testing

```bash
# Run all tests
cd backend && pytest

# Run with coverage report
cd backend && pytest --cov=app --cov-report=html

# Target: 80%+ code coverage
```

## Project Structure

```
finance-tutor-app/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # API route handlers
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── security/       # Auth & permissions
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities & API client
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript types
│   └── package.json
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml
├── Makefile
└── README.md
```

## License

MIT
