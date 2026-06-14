# Deployment Guide

## Overview

This application deploys to three free-tier services:

| Component | Service | URL Pattern |
|-----------|---------|-------------|
| Frontend | Vercel | `https://your-app.vercel.app` |
| Backend | Render | `https://api-your-app.onrender.com` |
| Database | Supabase | `https://your-project.supabase.co` |

## Cost Analysis

| Service | Free Tier Limit | Monthly Cost |
|---------|-----------------|--------------|
| Vercel | 100GB bandwidth, 1000 build minutes | $0 |
| Render | 750 hours, 512MB RAM | $0 |
| Supabase | 500MB database, 1GB storage, 50K MAU | $0 |
| **Total** | | **$0** |

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Enter project name (e.g., `finance-tutor`)
4. Set a strong database password (save it securely)
5. Choose region closest to your users
6. Click "Create new project"

### 1.2 Get Connection Strings

1. Go to Settings → Database
2. Copy the connection string:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
3. For direct connection (for migrations):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

### 1.3 Create Storage Buckets

1. Go to Storage in the Supabase dashboard
2. Create a bucket named `homework` (public: false)
3. Create a bucket named `general` (public: false)

### 1.4 Create Storage Policies

Run these in the SQL Editor:

```sql
-- Allow authenticated users to upload homework files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'homework');

-- Allow authenticated users to read homework files
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'homework');
```

## Step 2: Backend Deployment (Render)

### 2.1 Connect Repository

1. Go to [render.com](https://render.com) and sign up/sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 2.2 Configure Service

| Setting | Value |
|---------|-------|
| Name | `finance-tutor-api` |
| Region | `Oregon` (or closest to you) |
| Runtime | `Python` |
| Build Command | `cd backend && pip install -r requirements.txt` |
| Start Command | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

### 2.3 Set Environment Variables

In the "Environment" section, add these variables:

```
DATABASE_URL=<your-supabase-connection-string>
JWT_SECRET_KEY=<generate-32-char-random-string>
JWT_REFRESH_SECRET_KEY=<generate-32-char-random-string>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_DAYS=7
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=["https://your-app.vercel.app"]
ENVIRONMENT=production
DEBUG=false
RATE_LIMIT_PER_MINUTE=60
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
```

### 2.4 Generate Secret Keys

Run this to generate secure random keys:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.5 Deploy

1. Click "Create Web Service"
2. Wait for the build to complete
3. Note your service URL (e.g., `https://finance-tutor-api.onrender.com`)

## Step 3: Frontend Deployment (Vercel)

### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign up/sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Project

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

### 3.3 Set Environment Variables

Add these environment variables:

```
NEXT_PUBLIC_API_URL=https://finance-tutor-api.onrender.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_NAME=Finance Tutor
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Note your deployment URL (e.g., `https://your-app.vercel.app`)

### 3.5 Update CORS

Update your backend CORS_ORIGINS to include your Vercel URL:

```
CORS_ORIGINS=["https://your-app.vercel.app"]
```

## Step 4: Post-Deployment

### 4.1 Run Migrations

After first deploy, run migrations:

```bash
# SSH into Render shell (if available) or use Render console
cd backend && alembic upgrade head
```

Or create a migration script in Render as a one-off job.

### 4.2 Create Initial Admin User

Use the API to register the first user, then manually update the role in the database:

```bash
# Register user
curl -X POST https://your-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secure-password","first_name":"Admin","last_name":"User"}'
```

Then in Supabase SQL Editor:

```sql
UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';
```

### 4.3 Verify Deployment

1. Open your Vercel URL
2. Login with the admin credentials
3. Test creating a student, lesson, and transaction
4. Verify the student portal works

## Troubleshooting

### Backend Issues

**Build fails on Render**
- Check that `cd backend` is in the build command
- Verify Python version compatibility (3.13+)
- Check build logs for missing dependencies

**Database connection fails**
- Ensure Supabase is running and connection string is correct
- Check that the IP is whitelisted in Supabase (add `0.0.0.0/0` for Render)
- Verify the connection string format uses `postgresql://` (not `postgresql+asyncpg://`)

**CORS errors**
- Ensure `CORS_ORIGINS` includes your Vercel URL
- Format: `["https://your-app.vercel.app"]`
- Deploy changes after updating environment variables

### Frontend Issues

**API calls fail**
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure it ends with `/api/v1`
- Verify the backend is running and healthy

**Build fails on Vercel**
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Run `npm run build` locally to test

### Database Issues

**Migrations fail**
- Check the migration files in `backend/alembic/versions/`
- Verify database user has CREATE TABLE permissions
- For Supabase, use the connection pooler for migrations

**Storage upload fails**
- Verify storage buckets exist in Supabase
- Check storage policies are set correctly
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)

## Monitoring

### Health Check

Backend exposes a health endpoint:

```bash
curl https://your-api.onrender.com/api/v1/health
# Response: {"status": "ok", "version": "v1"}
```

### Logs

- **Render**: Service → Logs tab
- **Vercel**: Project → Logs tab
- **Supabase**: Dashboard → Logs

## Scaling Considerations

When you outgrow free tiers:

| Service | Paid Plan | Cost |
|---------|-----------|------|
| Render Starter | 2GB RAM, 1 CPU | $7/month |
| Vercel Pro | Unlimited bandwidth | $20/month |
| Supabase Pro | 8GB DB, 100GB storage | $25/month |
