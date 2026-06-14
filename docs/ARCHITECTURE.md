# Finance & Tutor Management Platform — Architecture Document

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Backend Architecture](#2-backend-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Database Architecture](#4-database-architecture)
5. [File Storage Architecture](#5-file-storage-architecture)
6. [Security Architecture](#6-security-architecture)
7. [Deployment Architecture](#7-deployment-architecture)

---

## 1. High-Level Architecture

### 1.1 System Diagram Description

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Desktop  │  │ Tablet   │  │ Mobile   │  │ Student  │        │
│  │ Browser  │  │ Browser  │  │ Browser  │  │ Portal   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼──────────────┼──────────────┼──────────────┼────────────┘
        │              │              │              │
        └──────────────┴──────┬───────┴──────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (CDN + Edge)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js 15 Frontend                         │    │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │ App     │  │ Static   │  │ API      │  │ SSR     │ │    │
│  │  │ Router  │  │ Assets   │  │ Routes   │  │ Pages   │ │    │
│  │  └─────────┘  └──────────┘  └──────────┘  └─────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (API calls)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER (Backend)                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              FastAPI Application                         │    │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │ Auth    │  │ Finance  │  │ Tutor    │  │ Admin   │ │    │
│  │  │ Module  │  │ Module   │  │ Module   │  │ Module  │ │    │
│  │  └─────────┘  └──────────┘  └──────────┘  └─────────┘ │    │
│  └───────────────────────┬─────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
┌──────────────────────┐    ┌──────────────────────┐
│  SUPABASE            │    │  SUPABASE            │
│  PostgreSQL Database  │    │  File Storage        │
│  ┌──────────────┐    │    │  ┌──────────────┐    │
│  │ Users        │    │    │  │ Homework     │    │
│  │ Students     │    │    │  │ Files        │    │
│  │ Lessons      │    │    │  │ Avatars      │    │
│  │ Finance      │    │    │  └──────────────┘    │
│  │ Homework     │    │    └──────────────────────┘
│  └──────────────┘    │
└──────────────────────┘
```

### 1.2 Component Breakdown

| Component | Technology | Purpose | Hosting |
|-----------|-----------|---------|---------|
| Frontend | Next.js 15, React, TypeScript | SPA/SSR UI | Vercel |
| Backend | FastAPI, Python 3.13 | REST API | Render |
| Database | PostgreSQL 15 | Data persistence | Supabase |
| File Storage | Supabase Storage | Homework files, avatars | Supabase |
| Authentication | JWT + Refresh Tokens | Identity management | Backend |
| CDN | Vercel Edge | Static assets, caching | Vercel |

### 1.3 Data Flow Between Components

**Authentication Flow:**
```
Client → Vercel → Render (FastAPI) → Validate credentials
                                   → Generate JWT + Refresh Token
                                   → Return tokens to client
Client stores tokens → Attaches JWT to subsequent requests
```

**Data Read Flow:**
```
Client → Vercel → Render (FastAPI) → Validate JWT
                                   → Check RBAC permissions
                                   → Query Supabase PostgreSQL
                                   → Return JSON response
```

**File Upload Flow:**
```
Client → Vercel → Render (FastAPI) → Validate JWT + permissions
                                   → Validate file type/size
                                   → Request signed URL from Supabase
                                   → Return signed URL to client
Client → Supabase Storage (direct upload via signed URL)
Client → Render (FastAPI) → Save file metadata to PostgreSQL
```

---

## 2. Backend Architecture

### 2.1 FastAPI Application Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # Application entry point
│   ├── config.py                   # Settings and environment variables
│   ├── database.py                 # Database connection and session
│   │
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py                 # Base model with common fields
│   │   ├── user.py                 # User model
│   │   ├── student.py              # Student model
│   │   ├── lesson.py               # Lesson model
│   │   ├── homework.py             # Homework model
│   │   ├── finance.py              # Income/Expense/Category models
│   │   └── audit.py                # Audit log model
│   │
│   ├── schemas/                    # Pydantic v2 schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── student.py
│   │   ├── lesson.py
│   │   ├── homework.py
│   │   ├── finance.py
│   │   ├── auth.py
│   │   └── common.py               # Shared schemas (pagination, etc.)
│   │
│   ├── api/                        # API routes
│   │   ├── __init__.py
│   │   ├── deps.py                 # Dependency injection
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py           # v1 router aggregation
│   │   │   ├── auth.py             # /api/v1/auth
│   │   │   ├── users.py            # /api/v1/users
│   │   │   ├── students.py         # /api/v1/students
│   │   │   ├── lessons.py          # /api/v1/lessons
│   │   │   ├── homework.py         # /api/v1/homework
│   │   │   ├── finance.py          # /api/v1/finance
│   │   │   ├── calendar.py         # /api/v1/calendar
│   │   │   └── admin.py            # /api/v1/admin
│   │   └── v2/                     # Future API version
│   │
│   ├── services/                   # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── student_service.py
│   │   ├── lesson_service.py
│   │   ├── homework_service.py
│   │   ├── finance_service.py
│   │   ├── calendar_service.py
│   │   ├── storage_service.py      # Supabase Storage
│   │   └── audit_service.py
│   │
│   ├── core/                       # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py             # JWT, password hashing
│   │   ├── permissions.py          # RBAC checks
│   │   ├── exceptions.py           # Custom exceptions
│   │   └── events.py               # Event handlers
│   │
│   └── middleware/                  # Middleware
│       ├── __init__.py
│       ├── cors.py
│       ├── rate_limit.py
│       ├── logging.py
│       └── audit.py
│
├── alembic/                        # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_finance.py
│   ├── test_tutor.py
│   ├── test_homework.py
│   └── test_calendar.py
│
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

### 2.2 Module Organization

**Domain-Driven Modules:**

| Module | Models | Services | API Routes |
|--------|--------|----------|------------|
| Auth | User | AuthService | `/api/v1/auth/*` |
| Finance | Income, Expense, Category | FinanceService | `/api/v1/finance/*` |
| Tutor | Student, Lesson | LessonService | `/api/v1/students/*`, `/api/v1/lessons/*` |
| Homework | Homework, HomeworkFile | HomeworkService | `/api/v1/homework/*` |
| Admin | User (role management) | UserService | `/api/v1/admin/*` |

### 2.3 API Endpoint Design

**Versioned REST API (`/api/v1/`)**

```
Authentication:
  POST   /auth/register              # Register new user
  POST   /auth/login                 # Login → JWT + Refresh
  POST   /auth/refresh               # Refresh access token
  POST   /auth/logout                # Invalidate refresh token
  POST   /auth/password/reset        # Request password reset

Users (Admin):
  GET    /users                      # List users (Admin+)
  GET    /users/{id}                 # Get user details
  PUT    /users/{id}                 # Update user
  DELETE /users/{id}                 # Delete user (SuperAdmin)
  PATCH  /users/{id}/role            # Change user role (SuperAdmin)

Finance:
  GET    /finance/income             # List income entries
  POST   /finance/income             # Create income entry
  PUT    /finance/income/{id}        # Update income entry
  DELETE /finance/income/{id}        # Delete income entry
  GET    /finance/expenses           # List expense entries
  POST   /finance/expenses           # Create expense entry
  PUT    /finance/expenses/{id}      # Update expense entry
  DELETE /finance/expenses/{id}      # Delete expense entry
  GET    /finance/categories         # List categories
  POST   /finance/categories         # Create custom category
  DELETE /finance/categories/{id}    # Delete custom category
  GET    /finance/analytics          # Get analytics data
  GET    /finance/dashboard          # Dashboard summary

Students:
  GET    /students                   # List students (Admin/Tutor)
  POST   /students                   # Create student (Admin)
  GET    /students/{id}              # Get student details
  PUT    /students/{id}              # Update student
  DELETE /students/{id}              # Delete student (Admin)
  PATCH  /students/{id}/status       # Change student status

Lessons:
  GET    /lessons                    # List lessons (filtered)
  POST   /lessons                    # Create lesson
  GET    /lessons/{id}               # Get lesson details
  PUT    /lessons/{id}               # Update lesson
  DELETE /lessons/{id}               # Cancel lesson
  PATCH  /lessons/{id}/reschedule    # Reschedule lesson
  PATCH  /lessons/{id}/payment       # Mark payment status

Calendar:
  GET    /calendar/lessons           # Get lessons for date range
  GET    /calendar/overview          # Calendar overview data

Homework:
  GET    /homework                   # List homework assignments
  POST   /homework                   # Create homework (Tutor)
  GET    /homework/{id}              # Get homework details
  PUT    /homework/{id}              # Update homework
  DELETE /homework/{id}              # Delete homework
  PATCH  /homework/{id}/archive      # Archive homework
  POST   /homework/{id}/files        # Upload homework files
  DELETE /homework/{id}/files/{file_id}  # Remove file

Student Portal:
  GET    /portal/schedule            # Student's schedule
  GET    /portal/homework            # Student's homework
  GET    /portal/history             # Student's lesson history
  GET    /portal/payments            # Student's payment history

Admin:
  GET    /admin/audit-logs           # View audit logs
  GET    /admin/stats                # System statistics
```

### 2.4 Middleware Stack

```python
# Request processing pipeline (order matters):

1. CORS Middleware          # Handle cross-origin requests
2. Rate Limiting Middleware # Throttle requests (per user/IP)
3. Request Logging Middleware # Log all incoming requests
4. Audit Middleware         # Record state-changing operations
5. Authentication Middleware # Extract and validate JWT
```

### 2.5 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client   │────▶│  Login   │────▶│ Validate │────▶│ Generate │
│  Request  │     │  Endpoint │     │ Password │     │ JWT pair │
└──────────┘     └──────────┘     └──────────┘     └─────┬────┘
                                                         │
                    ┌────────────────────────────────────┘
                    ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Return   │     │  Client  │     │ Attach   │
│ Tokens   │◀────│  Stores  │────▶│ JWT to   │
│ (access+ │     │  Tokens  │     │ requests │
│ refresh) │     └──────────┘     └──────────┘
└──────────┘

Access Token: 15 minutes expiry
Refresh Token: 7 days expiry, stored in HttpOnly cookie
```

**Token Structure:**
```json
// Access Token Payload
{
  "sub": "user_id",
  "role": "tutor",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### 2.6 RBAC Implementation

```python
# Role hierarchy:
# SuperAdmin > Admin > Tutor > Student

# Permission matrix:
PERMISSIONS = {
    "super_admin": ["*"],  # All permissions
    "admin": [
        "users:create", "users:read", "users:update", "users:delete",
        "students:create", "students:read", "students:update", "students:delete",
        "lessons:create", "lessons:read", "lessons:update", "lessons:delete",
        "finance:read", "finance:create", "finance:update", "finance:delete",
        "homework:create", "homework:read", "homework:update", "homework:delete",
        "admin:read"
    ],
    "tutor": [
        "students:read",  # Only own students
        "lessons:create", "lessons:read", "lessons:update",  # Only own lessons
        "finance:read",   # Only own data
        "homework:create", "homework:read", "homework:update",  # Own students only
    ],
    "student": [
        "portal:read",  # Own data only
    ]
}
```

**Dependency Injection Pattern:**
```python
# FastAPI dependencies for RBAC
def require_role(*roles: Role):
    async def check_role(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return check_role

def require_permission(permission: str):
    async def check_permission(current_user: User = Depends(get_current_user)):
        if not has_permission(current_user.role, permission):
            raise HTTPException(status_code=403, detail="Permission denied")
        return current_user
    return check_permission
```

---

## 3. Frontend Architecture

### 3.1 Next.js App Router Structure

```
frontend/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page → redirect to /dashboard
│   │
│   ├── (auth)/                       # Auth pages (no sidebar)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/                  # Protected dashboard pages
│   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   │
│   │   ├── dashboard/page.tsx        # Main dashboard
│   │   │
│   │   ├── finance/                  # Finance module
│   │   │   ├── page.tsx              # Finance dashboard
│   │   │   ├── income/page.tsx
│   │   │   ├── expenses/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── analytics/page.tsx
│   │   │
│   │   ├── tutoring/                 # Tutor module
│   │   │   ├── page.tsx              # Tutoring overview
│   │   │   ├── students/
│   │   │   │   ├── page.tsx          # Student list
│   │   │   │   └── [id]/page.tsx     # Student detail
│   │   │   ├── lessons/
│   │   │   │   ├── page.tsx          # Lessons list
│   │   │   │   └── [id]/page.tsx     # Lesson detail
│   │   │   └── calendar/page.tsx     # Calendar view
│   │   │
│   │   ├── homework/                 # Homework module
│   │   │   ├── page.tsx              # Homework list
│   │   │   ├── [id]/page.tsx         # Homework detail
│   │   │   └── create/page.tsx       # Create homework
│   │   │
│   │   ├── portal/                   # Student portal
│   │   │   ├── page.tsx              # Portal home
│   │   │   ├── schedule/page.tsx
│   │   │   ├── homework/page.tsx
│   │   │   └── payments/page.tsx
│   │   │
│   │   └── admin/                    # Admin panel
│   │       ├── page.tsx              # Admin dashboard
│   │       ├── users/page.tsx
│   │       ├── audit/page.tsx
│   │       └── settings/page.tsx
│   │
│   └── api/                          # Next.js API routes (if needed)
│
├── components/
│   ├── ui/                           # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/                       # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── finance/                      # Finance components
│   │   ├── IncomeForm.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── TransactionTable.tsx
│   │   ├── FinanceChart.tsx
│   │   └── BalanceCard.tsx
│   │
│   ├── tutoring/                     # Tutor components
│   │   ├── StudentCard.tsx
│   │   ├── StudentForm.tsx
│   │   ├── LessonForm.tsx
│   │   ├── Calendar.tsx
│   │   └── LessonDragItem.tsx
│   │
│   ├── homework/                     # Homework components
│   │   ├── HomeworkCard.tsx
│   │   ├── HomeworkForm.tsx
│   │   ├── FileUpload.tsx
│   │   └── FilePreview.tsx
│   │
│   └── common/                       # Shared components
│       ├── DataTable.tsx
│       ├── Pagination.tsx
│       ├── SearchInput.tsx
│       ├── ConfirmDialog.tsx
│       └── LoadingSpinner.tsx
│
├── lib/                              # Utilities and services
│   ├── api.ts                        # API client (fetch wrapper)
│   ├── auth.ts                       # Auth utilities
│   ├── utils.ts                      # General utilities
│   └── constants.ts                  # App constants
│
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts
│   ├── useStudents.ts
│   ├── useLessons.ts
│   ├── useFinance.ts
│   └── useHomework.ts
│
├── stores/                           # State management (Zustand)
│   ├── authStore.ts
│   ├── financeStore.ts
│   └── calendarStore.ts
│
├── types/                            # TypeScript type definitions
│   ├── user.ts
│   ├── student.ts
│   ├── lesson.ts
│   ├── homework.ts
│   └── finance.ts
│
├── styles/
│   └── globals.css                   # TailwindCSS globals
│
├── public/                           # Static assets
│   ├── favicon.ico
│   └── images/
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

### 3.2 Component Hierarchy

```
RootLayout
├── ThemeProvider (dark/light mode)
├── AuthProvider
│   └── QueryClientProvider (React Query)
│
├── (auth) Layout
│   └── LoginPage / RegisterPage
│
└── (dashboard) Layout
    ├── Sidebar (role-based navigation)
    │   ├── Logo
    │   ├── NavigationMenu
    │   │   ├── Dashboard
    │   │   ├── Finance (Admin+)
    │   │   ├── Tutoring (Admin/Tutor)
    │   │   ├── Homework (Admin/Tutor)
    │   │   ├── Portal (Student)
    │   │   └── Admin (SuperAdmin/Admin)
    │   └── UserMenu
    │
    ├── Header
    │   ├── SearchInput
    │   ├── ThemeToggle
    │   ├── Notifications
    │   └── UserAvatar
    │
    └── MainContent
        └── {children} (Page components)
```

### 3.3 State Management Approach

**Strategy: Minimal global state + Server State**

| State Type | Solution | Purpose |
|------------|----------|---------|
| Authentication | Zustand | Auth tokens, user info |
| Server Data | React Query (TanStack Query) | API data caching, mutations |
| Form State | React Hook Form + Zod | Form validation |
| UI State | React Context | Theme, sidebar state |
| Calendar State | Zustand | Calendar view, selected date |

**React Query Usage:**
```typescript
// Example: Fetching students
const { data: students, isLoading } = useQuery({
  queryKey: ['students', filters],
  queryFn: () => api.get('/students', { params: filters }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Example: Creating a lesson
const createLesson = useMutation({
  mutationFn: (data: CreateLessonInput) => api.post('/lessons', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['lessons'] });
    toast.success('Lesson created');
  },
});
```

### 3.4 API Integration Layer

```typescript
// lib/api.ts - Centralized API client
class ApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL!;
  }
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = useAuthStore.getState().accessToken;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });
    
    if (response.status === 401) {
      // Attempt token refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request<T>(endpoint, options);
      }
      useAuthStore.getState().logout();
      throw new Error('Session expired');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.detail, response.status);
    }
    
    return response.json();
  }
  
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<T>(`${endpoint}${query}`);
  }
  
  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // put, patch, delete methods...
}
```

---

## 4. Database Architecture

### 4.1 PostgreSQL Schema Design Approach

**Strategy: Single schema with role-based access**

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
│                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   users     │     │  students   │     │   lessons   │   │
│  ├─────────────┤     ├─────────────┤     ├─────────────┤   │
│  │ id (PK)     │◀──┐ │ id (PK)     │◀──┐ │ id (PK)     │   │
│  │ email       │   │ │ user_id(FK) │──┘ │ student_id  │───┘
│  │ password    │   │ │ first_name  │     │ tutor_id    │───┐
│  │ first_name  │   │ │ last_name   │     │ subject     │   │
│  │ last_name   │   │ │ phone       │     │ date        │   │
│  │ role        │   │ │ subject     │     │ start_time  │   │
│  │ is_active   │   │ │ lesson_cost │     │ end_time    │   │
│  │ created_at  │   │ │ notes       │     │ status      │   │
│  │ updated_at  │   │ │ status      │     │ payment     │   │
│  └─────────────┘   │ │ created_at  │     │ notes       │   │
│                     │ │ updated_at  │     │ created_at  │   │
│                     │ └─────────────┘     │ updated_at  │   │
│                     │                     └─────────────┘   │
│                     │                                       │
│  ┌─────────────┐   │  ┌─────────────┐  ┌─────────────┐     │
│  │  homework   │   │  │  income     │  │  expense    │     │
│  ├─────────────┤   │  ├─────────────┤  ├─────────────┤     │
│  │ id (PK)     │   │  │ id (PK)     │  │ id (PK)     │     │
│  │ student_id  │◀──┘  │ user_id(FK) │◀─┘│ user_id(FK) │◀────
│  │ tutor_id    │──────│ amount      │   │ amount      │     │
│  │ title       │      │ date        │   │ date        │     │
│  │ description │      │ category_id │   │ category_id │     │
│  │ type        │      │ description │   │ description │     │
│  │ status      │      │ created_at  │   │ created_at  │     │
│  │ due_date    │      └─────────────┘   └─────────────┘     │
│  │ is_archived │                                             │
│  │ created_at  │      ┌─────────────┐                       │
│  │ updated_at  │      │ categories  │                       │
│  └─────────────┘      ├─────────────┤                       │
│                       │ id (PK)     │                       │
│  ┌─────────────┐      │ user_id(FK) │◀──────────────────────┘
│  │hw_files     │      │ name        │
│  ├─────────────┤      │ type        │
│  │ id (PK)     │      │ icon        │
│  │ homework_id │      │ is_system   │
│  │ file_name   │      └─────────────┘
│  │ file_path   │
│  │ file_size   │      ┌─────────────┐
│  │ file_type   │      │ audit_logs  │
│  │ created_at  │      ├─────────────┤
│  └─────────────┘      │ id (PK)     │
│                       │ user_id(FK) │
│                       │ action      │
│                       │ entity_type │
│                       │ entity_id   │
│                       │ details     │
│                       │ ip_address  │
│                       │ created_at  │
│                       └─────────────┘
```

### 4.2 Connection Pooling

```python
# Supabase PostgreSQL connection with pooling
# Using Supabase's built-in connection pooler (PgBouncer)

DATABASE_URL = "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Connection pool configuration
engine = create_async_engine(
    DATABASE_URL,
    pool_size=5,          # Supabase free tier limit
    max_overflow=2,
    pool_timeout=30,
    pool_recycle=1800,    # Recycle connections every 30 min
    pool_pre_ping=True,   # Verify connections before use
)
```

### 4.3 Migration Strategy with Alembic

```
Migration Workflow:
1. Modify SQLAlchemy models
2. Run: alembic revision --autogenerate -m "description"
3. Review generated migration
4. Run: alembic upgrade head
5. Test with: alembic downgrade -1 && alembic upgrade head

Supabase Connection:
- Use connection string from Supabase dashboard
- Disable Supabase auto-migrations (managed by Alembic)
- Store alembic versions in database
```

---

## 5. File Storage Architecture

### 5.1 Supabase Storage Integration

```
Storage Buckets:
├── homework-files/          # Homework submissions
│   ├── {user_id}/
│   │   ├── {homework_id}/
│   │   │   ├── file1.pdf
│   │   │   └── file2.docx
│
└── avatars/                 # User avatars
    └── {user_id}.jpg
```

### 5.2 File Upload Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client   │────▶│ Request  │────▶│ Validate │────▶│ Generate │
│  Selects  │     │ Upload   │     │ JWT +    │     │ Signed   │
│  File     │     │ Endpoint │     │ File     │     │ URL      │
└──────────┘     └──────────┘     └──────────┘     └─────┬────┘
                                                         │
                    ┌────────────────────────────────────┘
                    ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Upload   │     │ Confirm  │     │ Save     │
│ Direct   │────▶│ Upload   │────▶│ Metadata │
│ to Supa- │     │ Success  │     │ to DB    │
│ base     │     └──────────┘     └──────────┘
└──────────┘

File Constraints:
- Max size: 10MB per file
- Allowed types: PDF, DOCX, JPG, PNG
- Max files per homework: 5
```

### 5.3 Homework File Handling

```python
# File validation
ALLOWED_TYPES = {
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def validate_file(file: UploadFile) -> bool:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "File type not allowed")
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(400, "File size exceeds limit")
    return True
```

---

## 6. Security Architecture

### 6.1 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐         ┌─────────┐         ┌─────────┐           │
│  │ Client   │────────▶│ FastAPI │────────▶│  Supa-  │           │
│  │ Browser  │         │ Backend │         │  base   │           │
│  └────┬────┘         └────┬────┘         └────┬────┘           │
│       │                    │                    │                 │
│  1. POST /auth/login      │                    │                 │
│  {email, password} ───────▶                    │                 │
│                          │                    │                 │
│                          │ 2. Query user      │                 │
│                          │    by email        │                 │
│                          │───────────────────▶│                 │
│                          │                    │                 │
│                          │ 3. Return user     │                 │
│                          │    + password_hash │                 │
│                          │◀───────────────────│                 │
│                          │                    │                 │
│                          │ 4. Verify password │                 │
│                          │    with bcrypt     │                 │
│                          │                    │                 │
│                          │ 5. Generate JWT    │                 │
│                          │    access_token    │                 │
│                          │    refresh_token   │                 │
│                          │                    │                 │
│  6. Return tokens        │                    │                 │
│  {access, refresh} ◀─────│                    │                 │
│                          │                    │                 │
│  7. Store tokens         │                    │                 │
│  in memory               │                    │                 │
│                          │                    │                 │
│  8. Attach JWT to        │                    │                 │
│     subsequent requests  │                    │                 │
│                          │                    │                 │
│  9. Validate JWT on      │                    │                 │
│     protected routes     │                    │                 │
│                          │                    │                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Authorization Checks

```python
# Three-layer authorization:

# Layer 1: Route-level role check
@app.get("/admin/users", dependencies=[Depends(require_role(Role.ADMIN, Role.SUPER_ADMIN))])
async def list_users():
    pass

# Layer 2: Resource-level ownership check
@app.get("/students/{student_id}")
async def get_student(
    student_id: int,
    current_user: User = Depends(get_current_user)
):
    student = await get_student_or_404(student_id)
    
    # Tutor can only see own students
    if current_user.role == Role.TUTOR and student.tutor_id != current_user.id:
        raise HTTPException(403, "Access denied")
    
    # Student can only see own data
    if current_user.role == Role.STUDENT and student.user_id != current_user.id:
        raise HTTPException(403, "Access denied")
    
    return student

# Layer 3: Field-level filtering
@app.get("/students")
async def list_students(current_user: User = Depends(get_current_user)):
    if current_user.role == Role.SUPER_ADMIN:
        return await db.students.all()
    elif current_user.role == Role.ADMIN:
        return await db.students.all()
    elif current_user.role == Role.TUTOR:
        return await db.students.filter(tutor_id=current_user.id).all()
    else:  # Student
        return await db.students.filter(user_id=current_user.id).all()
```

### 6.3 Input Validation Strategy

```python
# Pydantic v2 schemas for all inputs
from pydantic import BaseModel, Field, EmailStr

class CreateIncome(BaseModel):
    amount: float = Field(..., gt=0, description="Income amount")
    date: date = Field(..., description="Income date")
    category_id: int = Field(..., description="Category ID")
    description: str = Field(None, max_length=500)

# Validation layers:
# 1. Pydantic schema validation (type, range, format)
# 2. Database constraints (NOT NULL, UNIQUE, FK)
# 3. Business logic validation (permissions, state)
```

### 6.4 Rate Limiting Approach

```python
# Rate limits (per IP/user):
RATE_LIMITS = {
    "auth/login": "5/minute",           # Prevent brute force
    "auth/register": "3/hour",          # Prevent spam
    "auth/refresh": "10/minute",        # Token refresh
    "default": "100/minute",            # General API
    "file_upload": "10/hour",           # File operations
}

# Implementation: Redis-backed sliding window
# Fallback: In-memory (for free tier without Redis)
```

### 6.5 Security Checklist

| Feature | Implementation |
|---------|----------------|
| JWT Authentication | Access (15min) + Refresh (7d) tokens |
| Password Hashing | bcrypt with salt rounds = 12 |
| Role Guards | Three-layer RBAC (route, resource, field) |
| Rate Limiting | Per-endpoint, sliding window |
| Audit Logs | All state-changing operations logged |
| Secure File Upload | Type/size validation, signed URLs |
| Input Validation | Pydantic v2 schemas + DB constraints |
| CORS | Configured for Vercel frontend only |
| HTTPS | Enforced on all services |
| Secrets | Environment variables only |

---

## 7. Deployment Architecture

### 7.1 Vercel (Frontend)

```
Vercel Configuration:
- Framework: Next.js 15
- Build Command: npm run build
- Output Directory: .next
- Node.js Version: 20.x
- Region: Frankfurt (closest to target users)

Environment Variables:
  NEXT_PUBLIC_API_URL=https://your-app.onrender.com
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

Features:
- Automatic deployments on push to main
- Preview deployments for PRs
- Edge Network for static assets
- Serverless functions for API routes (if used)
```

### 7.2 Render (Backend)

```
Render Configuration:
- Type: Web Service
- Runtime: Python 3.13
- Build Command: pip install -r requirements.txt
- Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
- Instance Type: Free tier (512MB RAM, shared CPU)

Environment Variables:
  DATABASE_URL=postgresql://...
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_KEY=eyJ...
  JWT_SECRET_KEY=<generate-random>
  JWT_REFRESH_SECRET_KEY=<generate-random>
  CORS_ORIGINS=https://your-app.vercel.app

Features:
- Auto-deploy from GitHub
- Health check endpoint: /health
- Free tier: spins down after 15min inactivity
```

### 7.3 Supabase (Database + Storage)

```
Supabase Configuration:
- PostgreSQL 15 (managed)
- Connection Pooler (PgBouncer) included
- Storage: 1GB free tier
- API: RESTful (PostgREST)
- Auth: Available but we use custom JWT

Project Setup:
1. Create project at supabase.com
2. Get connection string from Settings > Database
3. Get API keys from Settings > API
4. Create storage buckets (homework-files, avatars)
5. Set bucket policies for authenticated access

Free Tier Limits:
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 500MB bandwidth
```

### 7.4 Environment Variables Management

```bash
# Backend (.env)
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_STORAGE_BUCKET=homework-files
JWT_SECRET_KEY=<64-char-random-string>
JWT_REFRESH_SECRET_KEY=<64-char-random-string>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["https://your-app.vercel.app"]
RATE_LIMIT_DEFAULT=100/minute

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_NAME="Finance Tutor"
```

### 7.5 Cost Analysis

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Vercel | 100GB bandwidth, 1000 build min | $0 |
| Render | 750 hours, 512MB RAM | $0 |
| Supabase | 500MB DB, 1GB storage | $0 |
| **Total** | | **$0/month** |

**Notes:**
- Render free tier spins down after 15min inactivity (first request takes ~30s)
- Supabase free tier sufficient for MVP
- Upgrade paths available if scale requires

---

## Appendix: Implementation Priority

| Phase | Module | Estimated Time |
|-------|--------|----------------|
| 1 | Project setup + Auth | 2 days |
| 2 | Database models + Migrations | 1 day |
| 3 | Finance Module | 3 days |
| 4 | Tutor/Student Module | 3 days |
| 5 | Calendar + Lessons | 3 days |
| 6 | Homework System | 2 days |
| 7 | Student Portal | 2 days |
| 8 | Admin Panel | 2 days |
| 9 | Testing | 3 days |
| 10 | Deployment + Documentation | 2 days |
| **Total** | | **~23 days** |

---

*Document Version: 1.0*
*Last Updated: 2026-06-13*
