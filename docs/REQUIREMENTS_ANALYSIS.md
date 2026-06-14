# Requirements Analysis
## Finance & Tutor Management Platform

**Version**: 1.0  
**Date**: 2026-06-13  
**Status**: Complete

---

## 1. Functional Requirements

### Module 1: Finance Tracker

#### 1.1 Income Management
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| FIN-001 | Create Income | P0 | User can add income with amount, date, category, description |
| FIN-002 | Edit Income | P0 | User can modify existing income entries |
| FIN-003 | Delete Income | P0 | User can remove income entries with confirmation |
| FIN-004 | View Income List | P0 | User can view all income entries with filtering/sorting |
| FIN-005 | Income Search | P1 | User can search income by description/category/date |

#### 1.2 Expenses Management
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| EXP-001 | Create Expense | P0 | User can add expenses with amount, date, category, description |
| EXP-002 | Edit Expense | P0 | User can modify existing expense entries |
| EXP-003 | Delete Expense | P0 | User can remove expense entries with confirmation |
| EXP-004 | View Expenses List | P0 | User can view all expense entries with filtering/sorting |
| EXP-005 | Expense Search | P1 | User can search expenses by description/category/date |

#### 1.3 Categories System
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| CAT-001 | System Categories | P0 | Pre-defined income/expense categories |
| CAT-002 | Custom Categories | P0 | Users can create personal custom categories |
| CAT-003 | Category Colors | P1 | Each category has an associated color for charts |
| CAT-004 | Category Management | P0 | CRUD operations for custom categories |

#### 1.4 Analytics
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| ANA-001 | Daily Analytics | P0 | Show income/expenses for current day |
| ANA-002 | Weekly Analytics | P0 | Show income/expenses for current week |
| ANA-003 | Monthly Analytics | P0 | Show income/expenses for current month |
| ANA-004 | Yearly Analytics | P0 | Show income/expenses for current year |
| ANA-005 | Net Profit | P0 | Calculate and display net profit (income - expenses) |
| ANA-006 | Average Income | P1 | Calculate average income per period |
| ANA-007 | Average Expense | P1 | Calculate average expense per period |
| ANA-008 | Trend Analysis | P1 | Show income/expense trends over time |

#### 1.5 Dashboard
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| DAS-001 | Current Balance | P0 | Display current financial balance |
| DAS-002 | Monthly Summary | P0 | Show current month income vs expenses |
| DAS-003 | Recent Transactions | P0 | Display last 10 transactions |
| DAS-004 | Charts | P0 | Visual representation of financial data |
| DAS-005 | Quick Actions | P1 | Quick add income/expense buttons |

---

### Module 2: Tutor Management

#### 2.1 Students Management
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| STU-001 | Create Student | P0 | Add student with name, email, phone, subject, rate, notes, status |
| STU-002 | Edit Student | P0 | Modify student information |
| STU-003 | Delete Student | P0 | Remove student (soft delete with confirmation) |
| STU-004 | Student Status | P0 | Track status: active, paused, finished |
| STU-005 | Student List | P0 | View all students with filtering by status |
| STU-006 | Student Search | P1 | Search students by name/email/subject |
| STU-007 | Student Profile | P1 | Detailed student view with history |

#### 2.2 Lessons Management
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| LES-001 | Create Lesson | P0 | Schedule lesson with student, tutor, date, time, cost |
| LES-002 | Edit Lesson | P0 | Modify lesson details |
| LES-003 | Cancel Lesson | P0 | Cancel lesson with reason |
| LES-004 | Reschedule Lesson | P0 | Move lesson to different date/time |
| LES-005 | Recurring Lessons | P1 | Create repeating lesson patterns |
| LES-006 | Payment Marking | P0 | Mark lesson as paid/unpaid |
| LES-007 | Lesson Comment | P1 | Add comments to lessons |

#### 2.3 Calendar System
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| CAL-001 | Day View | P0 | Display lessons for selected day |
| CAL-002 | Week View | P0 | Display lessons for selected week |
| CAL-003 | Month View | P0 | Display lessons for selected month |
| CAL-004 | Drag & Drop | P1 | Reschedule lessons via drag & drop |
| CAL-005 | Quick Create | P1 | Create lesson directly from calendar |
| CAL-006 | Color Coding | P1 | Different colors for different students/status |

#### 2.4 Homework System
| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| HW-001 | Text Homework | P0 | Create homework with text description |
| HW-002 | File Homework | P0 | Upload files: PDF, DOCX, JPG, PNG |
| HW-003 | Mixed Homework | P0 | Combine text + file attachments |
| HW-004 | Edit Homework | P0 | Modify homework content |
| HW-005 | Delete Homework | P0 | Remove homework |
| HW-006 | Archive Homework | P1 | Archive completed homework |
| HW-007 | File Upload Limit | P0 | Maximum file size: 10MB per file |
| HW-008 | Multiple Files | P1 | Attach multiple files to homework |

---

### Module 3: Student Portal

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| SPT-001 | View Schedule | P0 | Student can view upcoming lessons |
| SPT-002 | View Homework | P0 | Student can view assigned homework |
| SPT-003 | View History | P0 | Student can view past lessons |
| SPT-004 | View Payments | P0 | Student can view payment history |
| SPT-005 | Data Isolation | P0 | Student cannot access other users' data |
| SPT-006 | Download Files | P1 | Student can download homework files |
| SPT-007 | Lesson Details | P1 | View detailed lesson information |

---

### Module 4: Role System (RBAC)

| ID | Requirement | Priority | Description |
|----|-------------|----------|-------------|
| ROL-001 | Super Admin Role | P0 | Full system control, create admins, assign roles |
| ROL-002 | Admin Role | P0 | Manage tutors and students, manage schedules |
| ROL-003 | Tutor Role | P0 | Manage own students, create lessons, assign homework |
| ROL-004 | Student Role | P0 | View own data only |
| ROL-005 | Role Guards | P0 | Enforce permissions on all API endpoints |
| ROL-006 | Role Assignment | P0 | Super Admin can assign/change roles |
| ROL-007 | User Management | P0 | CRUD operations for users |

---

## 2. Non-Functional Requirements

### 2.1 Security Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| SEC-001 | JWT Authentication | Stateless token-based auth with access/refresh tokens |
| SEC-002 | Refresh Tokens | Secure token refresh mechanism with rotation |
| SEC-003 | Password Hashing | bcrypt/argon2 with salt, minimum 12 rounds |
| SEC-004 | Role Guards | Middleware validation for all protected routes |
| SEC-005 | Rate Limiting | API rate limiting: 100 requests/min per user |
| SEC-006 | Audit Logs | Log all critical operations (create, update, delete) |
| SEC-007 | Secure File Upload | Validate file types, scan for malware, store securely |
| SEC-008 | Input Validation | Validate and sanitize all inputs (Pydantic) |
| SEC-009 | CORS Policy | Restrict CORS to allowed origins only |
| SEC-010 | HTTPS Enforcement | All communications over HTTPS |

### 2.2 Performance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| PRF-001 | API Response Time | < 200ms for 95th percentile |
| PRF-002 | Page Load Time | < 2 seconds initial load |
| PRF-003 | Time to Interactive | < 3 seconds |
| PRF-004 | Database Queries | < 50ms for simple queries |
| PRF-005 | Concurrent Users | Support 100+ concurrent users |
| PRF-006 | File Upload | Support up to 10MB files |
| PRF-007 | Image Optimization | Lazy loading, WebP format |

### 2.3 Scalability Considerations

| ID | Requirement | Description |
|----|-------------|-------------|
| SCA-001 | Horizontal Scaling | Stateless backend allows multiple instances |
| SCA-002 | Database Scaling | Use connection pooling, optimize queries |
| SCA-003 | CDN Integration | Use CDN for static assets |
| SCA-004 | Caching Strategy | Redis/memory cache for frequent queries |
| SCA-005 | Async Operations | Background tasks for heavy operations |

### 2.4 Deployment Simplicity

| ID | Requirement | Description |
|----|-------------|-------------|
| DEP-001 | One-Click Deploy | Support single command deployment |
| DEP-002 | Environment Config | All config via environment variables |
| DEP-003 | Docker Support | Dockerfile and docker-compose provided |
| DEP-004 | Minimal Dependencies | Reduce external service dependencies |
| DEP-005 | Free Hosting | Target $0/month hosting costs |

### 2.5 Usability Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| USR-001 | Responsive Design | Desktop, tablet, mobile support |
| USR-002 | Dark Mode | Mandatory dark/light theme toggle |
| USR-003 | Intuitive UI | Clean, modern SaaS-style interface |
| USR-004 | Keyboard Navigation | Full keyboard accessibility |
| USR-005 | Error Messages | Clear, actionable error feedback |

---

## 3. Constraints

### 3.1 Budget Constraints
| Constraint | Target | Fallback |
|------------|--------|----------|
| Monthly Cost | $0 | Minimum possible |
| Hosting | Free tier | Low-cost ($5-10/month) |
| Database | Free tier | Low-cost |
| Storage | Free tier | Low-cost |
| Domain | Optional | Use free subdomain |

### 3.2 Technology Constraints
| Component | Required Stack |
|-----------|---------------|
| Backend | FastAPI, Python 3.13, SQLAlchemy 2, Alembic, Pydantic v2 |
| Frontend | Next.js 15, React, TypeScript, TailwindCSS, shadcn/ui |
| Testing | Pytest, Playwright |
| Database | PostgreSQL (Neon/Supabase free tier) |

### 3.3 Hosting Options Analysis
| Service | Free Tier | Pros | Cons |
|---------|-----------|------|------|
| Vercel | 100GB bandwidth | Frontend hosting, great DX | No backend |
| Supabase | 500MB DB, 1GB storage | Auth, DB, Storage bundle | Limited free tier |
| Neon | 512MB DB | PostgreSQL, branching | Storage limits |
| Render | 750 hours | Backend hosting | Cold starts |
| Railway | $5 credit | Easy deployment | Limited free |
| Fly.io | 3 shared-cpu-1x | Global edge | Complex setup |

**Recommended Stack:**
- Frontend: Vercel (free, fast)
- Backend: Render (free tier) or Railway
- Database: Supabase (PostgreSQL + Auth + Storage)

---

## 4. User Stories

### Super Admin Stories
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| SA-001 | As a Super Admin, I want to create admin accounts | Can create users with admin role |
| SA-002 | As a Super Admin, I want to delete any user | Can soft-delete users with confirmation |
| SA-003 | As a Super Admin, I want to assign roles | Can change user roles |
| SA-004 | As a Super Admin, I want to view all system data | Can see all tutors, students, lessons |
| SA-005 | As a Super Admin, I want to see audit logs | Can view system activity logs |

### Admin Stories
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| ADM-001 | As an Admin, I want to create tutor accounts | Can create users with tutor role |
| ADM-002 | As an Admin, I want to manage students | Can create/edit/delete students |
| ADM-003 | As an Admin, I want to manage schedules | Can create/edit lessons for any tutor |
| ADM-004 | As an Admin, I want to view reports | Can see tutor performance metrics |

### Tutor Stories
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| TUT-001 | As a Tutor, I want to view my students | See only my assigned students |
| TUT-002 | As a Tutor, I want to schedule lessons | Create lessons for my students |
| TUT-003 | As a Tutor, I want to assign homework | Create and assign homework to students |
| TUT-004 | As a Tutor, I want to track payments | Mark lessons as paid/unpaid |
| TUT-005 | As a Tutor, I want to view my calendar | See my schedule in calendar view |
| TUT-006 | As a Tutor, I want to track income | See earnings from lessons |

### Student Stories
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| STU-001 | As a Student, I want to view my schedule | See upcoming lessons |
| STU-002 | As a Student, I want to view homework | See assigned homework with files |
| STU-003 | As a Student, I want to view history | See past lessons and payments |
| STU-004 | As a Student, I want to download files | Download homework attachments |
| STU-005 | As a Student, I want to see payment status | View paid/unpaid lessons |

---

## 5. Use Cases

### Module 1: Finance Tracker Use Cases

#### UC-FIN-001: Add Income
**Actor**: Tutor, Admin, Super Admin  
**Precondition**: User is authenticated  
**Flow**:
1. User navigates to Finance section
2. User clicks "Add Income"
3. System displays income form
4. User enters amount, date, category, description
5. System validates input
6. System saves income entry
7. System updates dashboard balance
8. System displays success message

**Postcondition**: Income entry created, balance updated

#### UC-FIN-002: View Analytics
**Actor**: Tutor, Admin, Super Admin  
**Precondition**: User is authenticated, has income/expense data  
**Flow**:
1. User navigates to Analytics section
2. User selects time period (day/week/month/year)
3. System calculates and displays:
   - Income summary
   - Expense summary
   - Net profit
   - Averages
   - Trend charts

**Postcondition**: Analytics displayed

#### UC-FIN-003: Manage Categories
**Actor**: Any authenticated user  
**Precondition**: User is authenticated  
**Flow**:
1. User navigates to Categories
2. System displays system + custom categories
3. User can:
   - View categories
   - Create custom category
   - Edit custom category
   - Delete custom category

**Postcondition**: Categories updated

---

### Module 2: Tutor Management Use Cases

#### UC-TUT-001: Add Student
**Actor**: Tutor, Admin  
**Precondition**: User is authenticated with appropriate role  
**Flow**:
1. User navigates to Students section
2. User clicks "Add Student"
3. System displays student form
4. User enters: name, email, phone, subject, rate, notes
5. System validates input
6. System saves student
7. System displays success message

**Postcondition**: Student created

#### UC-TUT-002: Schedule Lesson
**Actor**: Tutor, Admin  
**Precondition**: Student exists  
**Flow**:
1. User navigates to Calendar
2. User clicks on date/time slot
3. System displays lesson form
4. User selects student, enters time, cost
5. System validates no conflicts
6. System saves lesson
7. Calendar updates

**Postcondition**: Lesson scheduled

#### UC-TUT-003: Assign Homework
**Actor**: Tutor  
**Precondition**: Student has active status  
**Flow**:
1. User navigates to student profile or homework section
2. User clicks "Assign Homework"
3. System displays homework form
4. User enters:
   - Title
   - Description (text)
   - Optional: Upload files (PDF, DOCX, JPG, PNG)
5. System validates and uploads files
6. System saves homework
7. Student notified (future enhancement)

**Postcondition**: Homework assigned

#### UC-TUT-004: Mark Payment
**Actor**: Tutor, Admin  
**Precondition**: Lesson exists  
**Flow**:
1. User views lesson (list or calendar)
2. User clicks "Mark as Paid"
3. System updates lesson payment status
4. System updates financial records
5. System displays confirmation

**Postcondition**: Payment recorded

---

### Module 3: Student Portal Use Cases

#### UC-SPT-001: View Schedule
**Actor**: Student  
**Precondition**: Student is authenticated  
**Flow**:
1. Student logs in
2. System displays upcoming lessons
3. Student sees: date, time, subject, tutor
4. Student can click for details

**Postcondition**: Schedule viewed

#### UC-SPT-002: View Homework
**Actor**: Student  
**Precondition**: Homework assigned  
**Flow**:
1. Student navigates to Homework section
2. System displays assigned homework
3. Student sees: title, description, files
4. Student can download attachments

**Postcondition**: Homework viewed

---

### Module 4: Role Management Use Cases

#### UC-ROL-001: Assign Role
**Actor**: Super Admin  
**Precondition**: User exists  
**Flow**:
1. Super Admin navigates to User Management
2. Super Admin selects user
3. Super Admin clicks "Change Role"
4. Super Admin selects new role
5. System validates permission
6. System updates user role
7. System logs the change

**Postcondition**: Role updated, audit logged

---

## 6. Acceptance Criteria

### Finance Tracker
| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AC-FIN-001 | Income CRUD | User can create, read, update, delete income entries |
| AC-FIN-002 | Expense CRUD | User can create, read, update, delete expense entries |
| AC-FIN-003 | Categories | System has predefined categories, users can create custom |
| AC-FIN-004 | Dashboard | Shows balance, monthly summary, recent transactions |
| AC-FIN-005 | Analytics | Shows data for day/week/month/year periods |
| AC-FIN-006 | Charts | Visual representation of financial data |

### Tutor Management
| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AC-TUT-001 | Student CRUD | Create, edit, delete students with all fields |
| AC-TUT-002 | Student Status | Track active/paused/finished status |
| AC-TUT-003 | Lesson CRUD | Create, edit, cancel, reschedule lessons |
| AC-TUT-004 | Calendar Views | Day, week, month views with navigation |
| AC-TUT-005 | Drag & Drop | Reschedule lessons via drag & drop |
| AC-TUT-006 | Recurring Lessons | Create repeating lesson patterns |
| AC-TUT-007 | Payment Tracking | Mark lessons as paid/unpaid |

### Homework System
| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AC-HW-001 | Text Homework | Create homework with text description |
| AC-HW-002 | File Upload | Upload PDF, DOCX, JPG, PNG files |
| AC-HW-003 | Mixed Content | Combine text + multiple file attachments |
| AC-HW-004 | File Management | Download and view uploaded files |
| AC-HW-005 | Archive | Archive completed homework |

### Student Portal
| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AC-SPT-001 | Schedule View | View upcoming lessons |
| AC-SPT-002 | Homework View | View assigned homework with files |
| AC-SPT-003 | History View | View past lessons and payments |
| AC-SPT-004 | Data Isolation | Cannot access other users' data |

### Security
| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AC-SEC-001 | Authentication | JWT-based login/logout |
| AC-SEC-002 | Token Refresh | Seamless token refresh |
| AC-SEC-003 | Password Security | Bcrypt hashing with salt |
| AC-SEC-004 | RBAC | Role-based access on all endpoints |
| AC-SEC-005 | Rate Limiting | 100 requests/min per user |
| AC-SEC-006 | Audit Logs | All critical operations logged |
| AC-SEC-007 | Input Validation | All inputs validated via Pydantic |

### Deployment
| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AC-DEP-001 | Docker | Working Dockerfile and docker-compose |
| AC-DEP-002 | Environment | All config via .env file |
| AC-DEP-003 | Free Hosting | Deployed on free tier services |
| AC-DEP-004 | Documentation | README with setup instructions |

### Testing
| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AC-TST-001 | Backend Coverage | Minimum 80% test coverage |
| AC-TST-002 | Auth Tests | Authentication flow tested |
| AC-TST-003 | Role Tests | RBAC permissions tested |
| AC-TUT-004 | Finance Tests | Income/expense CRUD tested |
| AC-TST-005 | Calendar Tests | Lesson scheduling tested |
| AC-TST-006 | Homework Tests | File upload tested |

---

## 7. Data Requirements

### 7.1 Core Entities
- **User**: id, email, password_hash, role, first_name, last_name, created_at
- **Student**: id, user_id, name, email, phone, subject, rate, notes, status, tutor_id
- **Lesson**: id, student_id, tutor_id, date, start_time, end_time, cost, comment, status, payment_status
- **Homework**: id, student_id, tutor_id, title, description, files, status, created_at
- **Income**: id, user_id, amount, date, category_id, description, created_at
- **Expense**: id, user_id, amount, date, category_id, description, created_at
- **Category**: id, name, type (income/expense), is_system, user_id, color

### 7.2 Relationships
- User 1:N Student (tutor manages many students)
- User 1:N Lesson (tutor has many lessons)
- Student 1:N Lesson (student has many lessons)
- Student 1:N Homework (student has many homework)
- User 1:N Income/Expense (user has many transactions)
- Category 1:N Income/Expense

---

## 8. API Requirements

### 8.1 Authentication Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### 8.2 User Endpoints
- GET /api/users
- GET /api/users/{id}
- PUT /api/users/{id}
- DELETE /api/users/{id}
- PUT /api/users/{id}/role

### 8.3 Student Endpoints
- GET /api/students
- POST /api/students
- GET /api/students/{id}
- PUT /api/students/{id}
- DELETE /api/students/{id}

### 8.4 Lesson Endpoints
- GET /api/lessons
- POST /api/lessons
- GET /api/lessons/{id}
- PUT /api/lessons/{id}
- DELETE /api/lessons/{id}
- PUT /api/lessons/{id}/payment

### 8.5 Homework Endpoints
- GET /api/homework
- POST /api/homework
- GET /api/homework/{id}
- PUT /api/homework/{id}
- DELETE /api/homework/{id}
- POST /api/homework/{id}/files

### 8.6 Finance Endpoints
- GET /api/finance/income
- POST /api/finance/income
- PUT /api/finance/income/{id}
- DELETE /api/finance/income/{id}
- GET /api/finance/expenses
- POST /api/finance/expenses
- PUT /api/finance/expenses/{id}
- DELETE /api/finance/expenses/{id}
- GET /api/finance/analytics
- GET /api/finance/dashboard
- GET /api/finance/categories
- POST /api/finance/categories

---

## 9. Database Schema Summary

### Tables
1. users
2. students
3. lessons
4. homework
5. homework_files
6. income
7. expenses
8. categories
9. audit_logs

### Indexes
- users: email (unique)
- students: tutor_id, status
- lessons: tutor_id, student_id, date
- homework: student_id, tutor_id
- income/expenses: user_id, date, category_id

---

## 10. Testing Strategy

### 10.1 Backend Testing
- **Unit Tests**: Pytest for business logic
- **Integration Tests**: API endpoint testing
- **Coverage Target**: 80% minimum

### 10.2 Frontend Testing
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright

### 10.3 Test Categories
- Authentication tests
- RBAC permission tests
- CRUD operation tests
- File upload tests
- Calendar/scheduling tests
- Financial calculation tests

---

## 11. Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Tests passing (80%+ coverage)
- [ ] Security review completed

### Deployment
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render/Railway
- [ ] Database on Supabase/Neon
- [ ] File storage configured

### Post-Deployment
- [ ] Smoke tests passing
- [ ] SSL certificates active
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

*End of Requirements Analysis*
