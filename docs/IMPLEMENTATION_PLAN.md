# Finance & Tutor Management Platform — Implementation Plan

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Development Phases](#2-development-phases)
3. [API Endpoints Design](#3-api-endpoints-design)
4. [Component List](#4-component-list)
5. [Testing Strategy](#5-testing-strategy)
6. [Deployment Strategy](#6-deployment-strategy)
7. [Docker Configuration](#7-docker-configuration)

---

## 1. Project Structure

### Backend Folder Structure (FastAPI)

```
backend/
├── alembic/                          # Database migrations
│   ├── versions/                     # Migration scripts
│   └── env.py
├── alembic.ini                       # Alembic configuration
├── app/
│   ├── __init__.py
│   ├── main.py                       # FastAPI application entry point
│   ├── config.py                     # Configuration settings
│   ├── database.py                   # Database connection & session
│   ├── models/                       # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── finance.py
│   │   ├── student.py
│   │   ├── lesson.py
│   │   ├── homework.py
│   │   └── audit_log.py
│   ├── schemas/                      # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── finance.py
│   │   ├── student.py
│   │   ├── lesson.py
│   │   ├── homework.py
│   │   └── common.py
│   ├── api/                          # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── finance.py
│   │   │   ├── students.py
│   │   │   ├── lessons.py
│   │   │   ├── homework.py
│   │   │   ├── files.py
│   │   │   └── analytics.py
│   │   └── deps.py                   # Dependency injection
│   ├── services/                     # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── finance_service.py
│   │   ├── student_service.py
│   │   ├── lesson_service.py
│   │   ├── homework_service.py
│   │   └── file_service.py
│   ├── security/                     # Security utilities
│   │   ├── __init__.py
│   │   ├── jwt.py
│   │   ├── password.py
│   │   ├── permissions.py
│   │   └── rate_limiter.py
│   ├── core/                         # Core utilities
│   │   ├── __init__.py
│   │   ├── exceptions.py
│   │   ├── logging.py
│   │   └── pagination.py
│   └── utils/                        # Helper functions
│       ├── __init__.py
│       └── date_utils.py
├── tests/                            # Test suite
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_auth_service.py
│   │   ├── test_finance_service.py
│   │   ├── test_student_service.py
│   │   ├── test_lesson_service.py
│   │   └── test_homework_service.py
│   ├── integration/
│   │   ├── test_auth_api.py
│   │   ├── test_finance_api.py
│   │   ├── test_student_api.py
│   │   ├── test_lesson_api.py
│   │   └── test_homework_api.py
│   └── e2e/
│       └── playwright/
├── requirements.txt
├── pyproject.toml
├── .env.example
├── Dockerfile
└── README.md
```

### Frontend Folder Structure (Next.js)

```
frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing/redirect page
│   ├── (auth)/                       # Auth routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/                  # Dashboard routes
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── finance/
│   │   │   ├── page.tsx
│   │   │   ├── income/
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   ├── tutoring/
│   │   │   ├── page.tsx
│   │   │   ├── students/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── lessons/
│   │   │   │   └── page.tsx
│   │   │   └── calendar/
│   │   │       └── page.tsx
│   │   ├── homework/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── students/                 # Student portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx
│   │   │   ├── homework/
│   │   │   │   └── page.tsx
│   │   │   └── payments/
│   │   │       └── page.tsx
│   │   └── admin/                    # Admin routes
│   │       ├── users/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           └── page.tsx
│   └── api/                          # API routes (if needed)
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── calendar.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── form.tsx
│   │   ├── skeleton.tsx
│   │   └── avatar.tsx
│   ├── shared/                       # Shared components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── DataTable.tsx
│   │   ├── SearchInput.tsx
│   │   ├── DateRangePicker.tsx
│   │   └── ConfirmDialog.tsx
│   ├── finance/                      # Finance components
│   │   ├── IncomeForm.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── TransactionCard.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── FinanceChart.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── MonthlySummary.tsx
│   │   └── AnalyticsChart.tsx
│   ├── tutor/                        # Tutor components
│   │   ├── StudentForm.tsx
│   │   ├── StudentCard.tsx
│   │   ├── StudentList.tsx
│   │   ├── LessonForm.tsx
│   │   ├── LessonCard.tsx
│   │   ├── LessonList.tsx
│   │   └── PaymentStatus.tsx
│   ├── calendar/                     # Calendar components
│   │   ├── CalendarView.tsx
│   │   ├── DayView.tsx
│   │   ├── WeekView.tsx
│   │   ├── MonthView.tsx
│   │   ├── CalendarEvent.tsx
│   │   ├── EventModal.tsx
│   │   └── DragDropContext.tsx
│   └── homework/                     # Homework components
│       ├── HomeworkForm.tsx
│       ├── HomeworkCard.tsx
│       ├── HomeworkList.tsx
│       ├── FileUpload.tsx
│       ├── FilePreview.tsx
│       └── HomeworkStatus.tsx
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts
│   ├── useFinance.ts
│   ├── useStudents.ts
│   ├── useLessons.ts
│   ├── useHomework.ts
│   ├── useCalendar.ts
│   └── useTheme.ts
├── lib/                              # Utility functions
│   ├── api.ts                        # API client
│   ├── auth.ts                       # Auth utilities
│   ├── utils.ts                      # General utilities
│   ├── constants.ts                  # App constants
│   └── validations.ts                # Zod schemas
├── stores/                           # State management
│   ├── authStore.ts
│   ├── financeStore.ts
│   └── uiStore.ts
├── types/                            # TypeScript types
│   ├── user.ts
│   ├── finance.ts
│   ├── student.ts
│   ├── lesson.ts
│   └── homework.ts
├── styles/
│   └── globals.css                   # Global styles + Tailwind
├── public/
│   ├── favicon.ico
│   └── images/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.local.example
├── docker-compose.yml
└── README.md
```

### Configuration Files

```
finance-tutor-app/
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Makefile
├── README.md
└── docs/
    ├── IMPLEMENTATION_PLAN.md
    ├── ARCHITECTURE.md
    ├── ER_DIAGRAM.md
    ├── DEPLOYMENT.md
    └── API.md
```

---

## 2. Development Phases

### Phase 1: Foundation (Week 1)

**Goal**: Core infrastructure ready for development.

#### Day 1-2: Project Setup

| Task | Details |
|------|---------|
| Initialize backend project | FastAPI, Poetry/uv, Python 3.13 |
| Initialize frontend project | Next.js 15, TypeScript, TailwindCSS |
| Configure shadcn/ui | Install and configure components |
| Setup ESLint + Prettier | Code formatting rules |
| Setup ruff + black | Python formatting rules |
| Create .gitignore | Ignore build artifacts, env files |
| Create docker-compose.yml | PostgreSQL + pgAdmin |

#### Day 3-4: Database Setup

| Task | Details |
|------|---------|
| Create Supabase project | Free tier PostgreSQL |
| Configure SQLAlchemy 2 | Async engine, session management |
| Setup Alembic | Migration configuration |
| Create base models | User, Role, AuditLog |
| Generate initial migration | alembic revision --autogenerate |

#### Day 5: Authentication System

| Task | Details |
|------|---------|
| Implement JWT auth | Access + Refresh tokens |
| Password hashing | bcrypt via passlib |
| Auth endpoints | Register, Login, Refresh, Logout |
| Auth middleware | Token validation, dependency injection |
| Rate limiting | SlowAPI or custom implementation |

#### Day 6-7: User Management + RBAC

| Task | Details |
|------|---------|
| User CRUD endpoints | Create, Read, Update, Delete |
| Role management | SuperAdmin, Admin, Tutor, Student |
| Permission guards | Role-based endpoint protection |
| Frontend auth pages | Login, Register forms |
| Auth state management | Zustand store |
| Protected routes | Middleware for route guards |

---

### Phase 2: Finance Module (Week 2)

**Goal**: Full finance tracking capabilities.

#### Day 8-9: Finance Categories

| Task | Details |
|------|---------|
| Category CRUD endpoints | Create, Read, Update, Delete |
| System categories | Pre-defined categories |
| User categories | Custom user categories |
| Category management UI | List, create, edit, delete |

#### Day 10-11: Income/Expenses

| Task | Details |
|------|---------|
| Transaction CRUD endpoints | Create, Read, Update, Delete |
| Transaction filters | By date, category, amount |
| Transaction list UI | Table with sorting/filtering |
| Transaction forms | Create/edit dialogs |
| Pagination | Backend + frontend pagination |

#### Day 12-13: Analytics & Dashboard

| Task | Details |
|------|---------|
| Analytics endpoints | Daily, Weekly, Monthly, Yearly |
| Dashboard aggregates | Balance, income, expenses |
| Chart components | Line, Bar, Pie charts |
| Dashboard UI | Cards, charts, recent transactions |
| Date range filtering | Custom date ranges |

---

### Phase 3: Tutor Module (Week 3)

**Goal**: Student and lesson management with calendar.

#### Day 15-16: Students CRUD

| Task | Details |
|------|---------|
| Student endpoints | Create, Read, Update, Delete |
| Student status management | Active, Paused, Finished |
| Student list UI | Table with filters |
| Student detail view | Profile, lessons, payments |
| Student search | By name, email, subject |

#### Day 17-18: Lessons CRUD

| Task | Details |
|------|---------|
| Lesson endpoints | Create, Read, Update, Delete |
| Lesson scheduling | Date, time, duration |
| Lesson status | Scheduled, Completed, Cancelled |
| Payment tracking | Paid/Unpaid status |
| Recurring lessons | Weekly repeating lessons |

#### Day 19-21: Calendar

| Task | Details |
|------|---------|
| Day view | Single day schedule |
| Week view | 7-day overview |
| Month view | Monthly grid |
| Drag & drop | Reschedule lessons |
| Event creation | Click to create lesson |
| Event editing | Click to edit lesson |

---

### Phase 4: Homework Module (Week 4)

**Goal**: Homework system with file uploads.

#### Day 22-23: Homework CRUD

| Task | Details |
|------|---------|
| Homework endpoints | Create, Read, Update, Delete |
| Text homework | Description-based assignments |
| File homework | PDF, DOCX, JPG, PNG uploads |
| Mixed homework | Text + files combined |
| Archive functionality | Soft delete/archive |

#### Day 24-25: File Upload

| Task | Details |
|------|---------|
| Supabase Storage setup | Configure storage buckets |
| File upload service | Backend file handling |
| File upload component | Drag & drop UI |
| File preview | PDF, image preview |
| File validation | Size, type restrictions |

#### Day 26-28: Student Portal

| Task | Details |
|------|---------|
| Student dashboard | Personal overview |
| Schedule view | Upcoming lessons |
| Homework list | Assigned homework |
| Payment history | Past payments |
| Data isolation | Students see only their data |

---

### Phase 5: Polish & Deploy (Week 5)

**Goal**: Production-ready application.

#### Day 29-30: UI/UX Refinement

| Task | Details |
|------|---------|
| Responsive design | Mobile, tablet, desktop |
| Dark mode | Theme toggle implementation |
| Loading states | Skeletons, spinners |
| Error handling | Error boundaries, toast messages |
| Form validation | Client-side validation |

#### Day 31-32: Testing

| Task | Details |
|------|---------|
| Unit tests | Service layer (80%+ coverage) |
| Integration tests | API endpoint tests |
| E2E tests | Critical user flows |
| Test coverage report | Generate coverage report |

#### Day 33-35: Deployment

| Task | Details |
|------|---------|
| Backend deployment | Render free tier |
| Frontend deployment | Vercel free tier |
| Supabase setup | Database + Storage |
| Environment variables | Production config |
| Domain setup | Custom domain (optional) |
| Monitoring | Basic health checks |

---

## 3. API Endpoints Design

### Base URL

```
Production: https://api.finance-tutor.app/api/v1
Development: http://localhost:8000/api/v1
```

### Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| GET | `/auth/me` | Get current user | Yes |

### User Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | List all users | SuperAdmin, Admin |
| GET | `/users/{id}` | Get user by ID | SuperAdmin, Admin |
| POST | `/users` | Create user | SuperAdmin |
| PUT | `/users/{id}` | Update user | SuperAdmin, Admin |
| DELETE | `/users/{id}` | Delete user | SuperAdmin |
| PUT | `/users/{id}/role` | Change user role | SuperAdmin |
| PUT | `/users/{id}/status` | Enable/disable user | SuperAdmin |

### Finance Endpoints

#### Categories

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/finance/categories` | List categories | All authenticated |
| POST | `/finance/categories` | Create category | Tutor, Admin |
| PUT | `/finance/categories/{id}` | Update category | Tutor, Admin |
| DELETE | `/finance/categories/{id}` | Delete category | Tutor, Admin |

#### Transactions (Income/Expenses)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/finance/transactions` | List transactions | Tutor, Admin |
| GET | `/finance/transactions/{id}` | Get transaction | Tutor, Admin |
| POST | `/finance/transactions` | Create transaction | Tutor, Admin |
| PUT | `/finance/transactions/{id}` | Update transaction | Tutor, Admin |
| DELETE | `/finance/transactions/{id}` | Delete transaction | Tutor, Admin |

#### Analytics

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/finance/analytics/summary` | Get financial summary | Tutor, Admin |
| GET | `/finance/analytics/daily` | Daily analytics | Tutor, Admin |
| GET | `/finance/analytics/weekly` | Weekly analytics | Tutor, Admin |
| GET | `/finance/analytics/monthly` | Monthly analytics | Tutor, Admin |
| GET | `/finance/analytics/yearly` | Yearly analytics | Tutor, Admin |

### Student Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/students` | List students | Tutor, Admin |
| GET | `/students/{id}` | Get student | Tutor (own), Admin |
| POST | `/students` | Create student | Tutor, Admin |
| PUT | `/students/{id}` | Update student | Tutor (own), Admin |
| DELETE | `/students/{id}` | Delete student | Admin only |
| PUT | `/students/{id}/status` | Change student status | Tutor (own), Admin |
| GET | `/students/{id}/lessons` | Get student lessons | Tutor (own), Student |
| GET | `/students/{id}/payments` | Get student payments | Tutor (own), Student |

### Lesson Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/lessons` | List lessons | Tutor, Admin |
| GET | `/lessons/{id}` | Get lesson | Tutor (own), Student |
| POST | `/lessons` | Create lesson | Tutor, Admin |
| PUT | `/lessons/{id}` | Update lesson | Tutor (own), Admin |
| DELETE | `/lessons/{id}` | Delete lesson | Tutor (own), Admin |
| PUT | `/lessons/{id}/status` | Update lesson status | Tutor (own) |
| PUT | `/lessons/{id}/payment` | Mark payment status | Tutor (own), Admin |
| POST | `/lessons/{id}/recurring` | Create recurring lesson | Tutor, Admin |
| GET | `/lessons/calendar` | Get calendar data | Tutor, Student |

### Homework Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/homework` | List homework | Tutor, Student |
| GET | `/homework/{id}` | Get homework | Tutor, Student |
| POST | `/homework` | Create homework | Tutor |
| PUT | `/homework/{id}` | Update homework | Tutor |
| DELETE | `/homework/{id}` | Delete homework | Tutor |
| PUT | `/homework/{id}/archive` | Archive homework | Tutor |
| GET | `/homework/student/{id}` | Get student homework | Tutor, Student |

### File Upload Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/files/upload` | Upload file | Tutor |
| GET | `/files/{id}` | Get file info | Tutor, Student |
| DELETE | `/files/{id}` | Delete file | Tutor |
| GET | `/files/{id}/download` | Download file | Tutor, Student |

---

## 4. Component List

### Shared Components

| Component | File | Description |
|-----------|------|-------------|
| Header | `components/shared/Header.tsx` | Top navigation bar |
| Sidebar | `components/shared/Sidebar.tsx` | Side navigation |
| Footer | `components/shared/Footer.tsx` | Page footer |
| ThemeToggle | `components/shared/ThemeToggle.tsx` | Dark/light mode toggle |
| LoadingSpinner | `components/shared/LoadingSpinner.tsx` | Loading indicator |
| ErrorBoundary | `components/shared/ErrorBoundary.tsx` | Error handling wrapper |
| DataTable | `components/shared/DataTable.tsx` | Reusable table component |
| SearchInput | `components/shared/SearchInput.tsx` | Search with debounce |
| DateRangePicker | `components/shared/DateRangePicker.tsx` | Date range selection |
| ConfirmDialog | `components/shared/ConfirmDialog.tsx` | Confirmation modal |

### Finance Components

| Component | File | Description |
|-----------|------|-------------|
| IncomeForm | `components/finance/IncomeForm.tsx` | Income entry form |
| ExpenseForm | `components/finance/ExpenseForm.tsx` | Expense entry form |
| TransactionList | `components/finance/TransactionList.tsx` | Transactions table |
| TransactionCard | `components/finance/TransactionCard.tsx` | Single transaction display |
| CategoryManager | `components/finance/CategoryManager.tsx` | Category CRUD interface |
| FinanceChart | `components/finance/FinanceChart.tsx` | Income/expense chart |
| BalanceCard | `components/finance/BalanceCard.tsx` | Current balance display |
| MonthlySummary | `components/finance/MonthlySummary.tsx` | Monthly overview |
| AnalyticsChart | `components/finance/AnalyticsChart.tsx` | Analytics visualization |

### Tutor Components

| Component | File | Description |
|-----------|------|-------------|
| StudentForm | `components/tutor/StudentForm.tsx` | Student create/edit form |
| StudentCard | `components/tutor/StudentCard.tsx` | Student info card |
| StudentList | `components/tutor/StudentList.tsx` | Students table/list |
| LessonForm | `components/tutor/LessonForm.tsx` | Lesson create/edit form |
| LessonCard | `components/tutor/LessonCard.tsx` | Lesson info card |
| LessonList | `components/tutor/LessonList.tsx` | Lessons table/list |
| PaymentStatus | `components/tutor/PaymentStatus.tsx` | Payment indicator |

### Calendar Components

| Component | File | Description |
|-----------|------|-------------|
| CalendarView | `components/calendar/CalendarView.tsx` | Main calendar container |
| DayView | `components/calendar/DayView.tsx` | Single day schedule |
| WeekView | `components/calendar/WeekView.tsx` | Weekly schedule |
| MonthView | `components/calendar/MonthView.tsx` | Monthly grid |
| CalendarEvent | `components/calendar/CalendarEvent.tsx` | Event display |
| EventModal | `components/calendar/EventModal.tsx` | Event create/edit modal |
| DragDropContext | `components/calendar/DragDropContext.tsx` | DnD provider |

### Homework Components

| Component | File | Description |
|-----------|------|-------------|
| HomeworkForm | `components/homework/HomeworkForm.tsx` | Homework create/edit form |
| HomeworkCard | `components/homework/HomeworkCard.tsx` | Homework display card |
| HomeworkList | `components/homework/HomeworkList.tsx` | Homework list/table |
| FileUpload | `components/homework/FileUpload.tsx` | File upload component |
| FilePreview | `components/homework/FilePreview.tsx` | File preview modal |
| HomeworkStatus | `components/homework/HomeworkStatus.tsx` | Status indicator |

### UI Components (shadcn/ui)

| Component | Usage |
|-----------|-------|
| Button | All interactive elements |
| Input | Form inputs |
| Card | Content containers |
| Dialog | Modals and popups |
| DropdownMenu | Menus and actions |
| Table | Data display |
| Badge | Status indicators |
| Calendar | Date selection |
| Select | Dropdown selection |
| Tabs | Content switching |
| Toast | Notifications |
| Form | Form handling |
| Skeleton | Loading states |
| Avatar | User avatars |

---

## 5. Testing Strategy

### Testing Pyramid

```
            E2E Tests (10%)
           /           \
    Integration Tests (30%)
         /               \
      Unit Tests (60%)
```

### Unit Tests (Pytest)

**Coverage Target**: 80%+

| Module | Test File | Coverage Target |
|--------|-----------|-----------------|
| Auth Service | `tests/unit/test_auth_service.py` | 90% |
| User Service | `tests/unit/test_user_service.py` | 85% |
| Finance Service | `tests/unit/test_finance_service.py` | 85% |
| Student Service | `tests/unit/test_student_service.py` | 85% |
| Lesson Service | `tests/unit/test_lesson_service.py` | 80% |
| Homework Service | `tests/unit/test_homework_service.py` | 80% |
| File Service | `tests/unit/test_file_service.py` | 75% |
| Security | `tests/unit/test_security.py` | 90% |

**Test Categories**:

```python
# Example test structure
@pytest.mark.unit
class TestAuthService:
    def test_register_user(self):
        """Test user registration"""
        pass

    def test_login_success(self):
        """Test successful login"""
        pass

    def test_login_invalid_credentials(self):
        """Test login with wrong credentials"""
        pass

    def test_token_refresh(self):
        """Test token refresh"""
        pass

    def test_password_hashing(self):
        """Test password hashing"""
        pass
```

### Integration Tests

| Test File | Description |
|-----------|-------------|
| `tests/integration/test_auth_api.py` | Auth endpoint tests |
| `tests/integration/test_finance_api.py` | Finance endpoint tests |
| `tests/integration/test_student_api.py` | Student endpoint tests |
| `tests/integration/test_lesson_api.py` | Lesson endpoint tests |
| `tests/integration/test_homework_api.py` | Homework endpoint tests |

**Test Scenarios**:

```python
@pytest.mark.integration
class TestFinanceAPI:
    def test_create_income(self, client, auth_headers):
        """Test income creation endpoint"""
        pass

    def test_get_transactions_list(self, client, auth_headers):
        """Test transaction listing with filters"""
        pass

    def test_analytics_endpoint(self, client, auth_headers):
        """Test analytics data retrieval"""
        pass

    def test_unauthorized_access(self, client):
        """Test unauthorized access prevention"""
        pass
```

### E2E Tests (Playwright)

| Test Suite | Description |
|------------|-------------|
| `tests/e2e/auth.spec.ts` | Login, registration flows |
| `tests/e2e/finance.spec.ts` | Finance management flows |
| `tests/e2e/tutoring.spec.ts` | Student/lesson management |
| `tests/e2e/calendar.spec.ts` | Calendar interactions |
| `tests/e2e/homework.spec.ts` | Homework management |
| `tests/e2e/student-portal.spec.ts` | Student portal flows |

**Critical User Flows**:

1. **Authentication Flow**
   - Register new account
   - Login with credentials
   - Refresh token handling
   - Logout

2. **Finance Flow**
   - Add income
   - Add expense
   - View analytics
   - Filter transactions

3. **Tutoring Flow**
   - Create student
   - Schedule lesson
   - Mark payment
   - View calendar

4. **Homework Flow**
   - Create homework
   - Upload file
   - View in student portal

### Test Configuration

```python
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
markers = [
    "unit: Unit tests",
    "integration: Integration tests",
    "e2e: End-to-end tests",
]
asyncio_mode = "auto"

[tool.coverage.run]
source = ["app"]
omit = ["tests/*", "alembic/*"]

[tool.coverage.report]
fail_under = 80
show_missing = true
```

### CI/CD Testing

```yaml
# GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests
        run: pytest -m unit --cov=app --cov-report=xml
      - name: Run integration tests
        run: pytest -m integration
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 6. Deployment Strategy

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                         │
│              https://finance-tutor.app                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Render (Backend API)                        │
│            https://api.finance-tutor.app                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ PostgreSQL  │  │   Storage   │  │     Auth    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Vercel Setup (Frontend)

1. **Repository Setup**
   ```bash
   # Connect GitHub repository to Vercel
   # Import project in Vercel dashboard
   ```

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://api.finance-tutor.app/api/v1
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install"
   }
   ```

4. **Domain Configuration**
   - Add custom domain in Vercel settings
   - Configure DNS records

### Render Setup (Backend)

1. **Create Web Service**
   - Connect GitHub repository
   - Select Python environment
   - Set root directory: `backend`

2. **Build Configuration**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   SECRET_KEY=your-secret-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-service-role-key
   CORS_ORIGINS=https://finance-tutor.app
   ENVIRONMENT=production
   ```

4. **Free Tier Considerations**
   - 750 hours/month (enough for one service)
   - Spins down after 15 minutes of inactivity
   - Consider upgrading if needed

### Supabase Setup

1. **Create Project**
   - Go to supabase.com
   - Create new project
   - Note project URL and keys

2. **Database Setup**
   ```sql
   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";

   -- Create tables via migrations or SQL editor
   ```

3. **Storage Setup**
   ```sql
   -- Create storage bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('homework-files', 'homework-files', false);

   -- Set up storage policies
   CREATE POLICY "Tutors can upload files"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'homework-files');

   CREATE POLICY "Users can view own files"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'homework-files');
   ```

4. **Authentication Setup**
   - Enable Email/Password auth
   - Configure JWT settings
   - Set up RLS policies

### Cost Analysis

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | 100GB bandwidth, 1000 build minutes | $0 |
| Render | 750 hours, 512MB RAM | $0 |
| Supabase | 500MB database, 1GB storage | $0 |
| **Total** | | **$0/month** |

**Limits to Monitor**:
- Render: Service spins down after inactivity
- Supabase: Storage limits for file uploads
- Vercel: Bandwidth for large apps

---

## 7. Docker Configuration

### Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/finance_tutor
      - SECRET_KEY=your-secret-key-change-in-production
      - SUPABASE_URL=http://supabase:54321
      - SUPABASE_KEY=your-supabase-key
      - ENVIRONMENT=development
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=finance_tutor
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@admin.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      - db
    restart: unless-stopped

volumes:
  postgres_data:
  pgadmin_data:
```

### .env.example

```bash
# Backend Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_tutor
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://finance-tutor.app

# Environment
ENVIRONMENT=development
DEBUG=true

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

### Makefile

```makefile
# Makefile

.PHONY: help install dev test lint docker-up docker-down

help:  ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install dependencies
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev:  ## Start development servers
	docker-compose up -d
	cd backend && uvicorn app.main:app --reload --port 8000 &
	cd frontend && npm run dev

test:  ## Run tests
	cd backend && pytest -v --cov=app --cov-report=html

test-unit:  ## Run unit tests only
	cd backend && pytest -m unit -v

test-integration:  ## Run integration tests only
	cd backend && pytest -m integration -v

lint:  ## Run linters
	cd backend && ruff check . && black --check .
	cd frontend && npm run lint

format:  ## Format code
	cd backend && ruff check --fix . && black .
	cd frontend && npm run format

docker-up:  ## Start Docker containers
	docker-compose up -d

docker-down:  ## Stop Docker containers
	docker-compose down

docker-build:  ## Build Docker images
	docker-compose build

migrate:  ## Run database migrations
	cd backend && alembic upgrade head

makemigrations:  ## Generate migrations
	cd backend && alembic revision --autogenerate -m "$(msg)"

seed:  ## Seed database
	cd backend && python -m app.utils.seed_data
```

### requirements.txt

```txt
# Backend dependencies
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy[asyncio]==2.0.35
asyncpg==0.29.0
alembic==1.13.0
pydantic==2.9.0
pydantic-settings==2.5.0

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9

# Supabase
supabase==2.7.0

# HTTP client
httpx==0.27.0

# Utilities
python-dotenv==1.0.1
slowapi==0.1.9

# Testing
pytest==8.3.0
pytest-asyncio==0.24.0
pytest-cov==5.0.0
httpx==0.27.0

# Code quality
ruff==0.6.0
black==24.8.0

# Development
ipython==8.26.0
```

### package.json (Frontend Scripts)

```json
{
  "name": "finance-tutor-frontend",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "playwright test",
    "test:e2e": "playwright test --project=chromium"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.400.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "zustand": "^4.5.0",
    "axios": "^1.7.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.14.0",
    "prettier": "^3.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^15.0.0",
    "@playwright/test": "^1.45.0"
  }
}
```

---

## Summary

This implementation plan provides a comprehensive roadmap for building the Finance & Tutor Management Platform. The 5-week timeline is achievable with focused development and proper task prioritization.

### Key Success Factors

1. **Start with Supabase** — Reduces backend complexity significantly
2. **Use Vercel + Render** — Free tier covers initial deployment needs
3. **Focus on MVP** — Finance + Tutoring first, then Homework
4. **Test continuously** — 80% coverage from the start
5. **Deploy early** — Get feedback as soon as possible

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Render cold starts | Implement keep-alive pings |
| Supabase storage limits | Optimize file compression |
| Complex calendar DnD | Use proven library (@dnd-kit) |
| Mobile responsiveness | Mobile-first development approach |

### Next Steps

1. Review and approve this implementation plan
2. Create ER diagram (separate document)
3. Set up project repositories
4. Begin Phase 1 development
