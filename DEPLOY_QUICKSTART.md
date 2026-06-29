# Quick Deployment Guide

## Option 1: Docker (Local/VPS)

```bash
# 1. Generate secrets
bash scripts/generate-secrets.sh

# 2. Create .env file
cp .env.example .env
# Edit .env with your values

# 3. Deploy
bash scripts/deploy.sh
```

## Option 2: Render + Vercel (Free Tier)

### Backend (Render)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo
4. Settings:
   - Build: `cd backend && pip install -r requirements.txt`
   - Start: `cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`
6. Deploy

### Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → Import Project
2. Connect GitHub repo
3. Settings:
   - Root Directory: `frontend`
4. Add `NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1`
5. Deploy

## Option 3: Supabase (Database)

1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `cd backend && alembic upgrade head`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql+asyncpg://...` |
| `JWT_SECRET_KEY` | JWT signing key | 64-char hex string |
| `JWT_REFRESH_SECRET_KEY` | Refresh token key | 64-char hex string |
| `PASSWORD_RESET_SECRET` | Reset token key | 64-char hex string |
| `CORS_ORIGINS` | Allowed origins | `["https://app.vercel.app"]` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | `eyJ...` |

## Post-Deployment

1. Create first admin user:
```bash
curl -X POST https://your-api.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123!","first_name":"Admin","last_name":"User"}'
```

2. Promote to super_admin in database:
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';
```

3. Verify: `curl https://your-api.com/health`
