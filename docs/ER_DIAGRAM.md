# ER Diagram — Finance & Tutor Management Platform

## 1. Mermaid ER Diagram

```mermaid
erDiagram
    User ||--o| UserProfile : "has"
    User ||--o{ FinanceCategory : "creates"
    User ||--o{ FinanceTransaction : "records"
    User ||--o{ Student : "teaches"
    User ||--o{ Lesson : "conducts"
    User ||--o{ Homework : "assigns"
    User ||--o{ AuditLog : "generates"

    Student ||--o{ Lesson : "attends"
    Student ||--o{ Homework : "receives"

    FinanceCategory ||--o{ FinanceTransaction : "categorizes"
    Lesson ||--o| LessonRecurrence : "may repeat"
    Homework ||--o{ HomeworkFile : "includes"

    User {
        UUID id PK
        VARCHAR(255) email UK
        VARCHAR(255) password_hash
        ENUM role "super_admin|admin|tutor|student"
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    UserProfile {
        UUID id PK
        UUID user_id FK
        VARCHAR(100) first_name
        VARCHAR(100) last_name
        VARCHAR(20) phone
        VARCHAR(500) avatar_url
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    FinanceCategory {
        UUID id PK
        UUID user_id FK
        VARCHAR(100) name
        ENUM type "income|expense"
        BOOLEAN is_system
        BOOLEAN is_active
        INT sort_order
        TIMESTAMP created_at
    }

    FinanceTransaction {
        UUID id PK
        UUID user_id FK
        UUID category_id FK
        DECIMAL(12,2) amount
        ENUM type "income|expense"
        TEXT description
        DATE date
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    Student {
        UUID id PK
        UUID tutor_id FK
        VARCHAR(100) first_name
        VARCHAR(100) last_name
        VARCHAR(255) email
        VARCHAR(20) phone
        VARCHAR(100) subject
        DECIMAL(10,2) lesson_price
        TEXT notes
        ENUM status "active|paused|finished"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    Lesson {
        UUID id PK
        UUID student_id FK
        UUID tutor_id FK
        DATE date
        TIME start_time
        TIME end_time
        DECIMAL(10,2) price
        TEXT comment
        ENUM status "scheduled|completed|cancelled"
        ENUM payment_status "paid|unpaid"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    LessonRecurrence {
        UUID id PK
        UUID lesson_id FK
        ENUM recurrence_type "daily|weekly|biweekly|monthly"
        DATE end_date
        INT total_occurrences
        INT current_occurrence
        TIMESTAMP created_at
    }

    Homework {
        UUID id PK
        UUID student_id FK
        UUID tutor_id FK
        VARCHAR(255) title
        TEXT description
        ENUM type "text|file|mixed"
        DATE due_date
        ENUM status "pending|submitted|graded|archived"
        TEXT grade
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    HomeworkFile {
        UUID id PK
        UUID homework_id FK
        VARCHAR(500) file_url
        VARCHAR(255) file_name
        VARCHAR(50) file_type
        BIGINT file_size
        TIMESTAMP uploaded_at
    }

    AuditLog {
        UUID id PK
        UUID user_id FK
        VARCHAR(100) action
        VARCHAR(50) entity_type
        UUID entity_id
        JSONB details
        VARCHAR(45) ip_address
        TIMESTAMP created_at
    }
```

---

## 2. Table Descriptions

### 2.1 User

Central authentication and authorization entity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | ENUM('super_admin','admin','tutor','student') | NOT NULL, DEFAULT 'tutor' | User role |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account active flag |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_user_email` — UNIQUE on email (login lookup)
- `idx_user_role` — on role (admin filtering)

---

### 2.2 UserProfile

Extended user information, separated for security (password_hash isolation).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → User(id), UNIQUE, NOT NULL | Owner user |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| phone | VARCHAR(20) | | Phone number |
| avatar_url | VARCHAR(500) | | Profile image URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_userprofile_user_id` — UNIQUE on user_id (1:1 lookup)

---

### 2.3 FinanceCategory

Income/expense categories. System categories are shared; user categories are private.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → User(id), NULLABLE | NULL for system categories |
| name | VARCHAR(100) | NOT NULL | Category name |
| type | ENUM('income','expense') | NOT NULL | Category type |
| is_system | BOOLEAN | NOT NULL, DEFAULT false | System-wide category flag |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| sort_order | INT | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Constraints:**
- CHECK: is_system = true → user_id IS NULL
- CHECK: is_system = false → user_id IS NOT NULL

**Indexes:**
- `idx_financecategory_user_type` — on (user_id, type) for filtered queries
- `idx_financecategory_system` — on (is_system) for system category lookup

---

### 2.4 FinanceTransaction

Income and expense records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → User(id), NOT NULL | Owner user |
| category_id | UUID | FK → FinanceCategory(id), NOT NULL | Category reference |
| amount | DECIMAL(12,2) | NOT NULL, CHECK (amount > 0) | Transaction amount |
| type | ENUM('income','expense') | NOT NULL | Transaction type |
| description | TEXT | | Optional description |
| date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Transaction date |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Constraints:**
- CHECK: amount > 0

**Indexes:**
- `idx_financetransaction_user_date` — on (user_id, date DESC) for date-range queries
- `idx_financetransaction_user_type` — on (user_id, type) for income/expense filtering
- `idx_financetransaction_category` — on (category_id) for category joins

---

### 2.5 Student

Tutor's students (CRM entity).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| tutor_id | UUID | FK → User(id), NOT NULL | Assigned tutor |
| first_name | VARCHAR(100) | NOT NULL | Student first name |
| last_name | VARCHAR(100) | NOT NULL | Student last name |
| email | VARCHAR(255) | | Student email |
| phone | VARCHAR(20) | | Student phone |
| subject | VARCHAR(100) | NOT NULL | Tutoring subject |
| lesson_price | DECIMAL(10,2) | NOT NULL, CHECK (lesson_price >= 0) | Price per lesson |
| notes | TEXT | | Tutor's notes |
| status | ENUM('active','paused','finished') | NOT NULL, DEFAULT 'active' | Student status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_student_tutor` — on (tutor_id) for tutor's student list
- `idx_student_tutor_status` — on (tutor_id, status) for filtered queries

---

### 2.6 Lesson

Scheduled/completed tutoring sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| student_id | UUID | FK → Student(id), NOT NULL | Student reference |
| tutor_id | UUID | FK → User(id), NOT NULL | Tutor reference |
| date | DATE | NOT NULL | Lesson date |
| start_time | TIME | NOT NULL | Start time |
| end_time | TIME | NOT NULL, CHECK (end_time > start_time) | End time |
| price | DECIMAL(10,2) | NOT NULL, CHECK (price >= 0) | Lesson price |
| comment | TEXT | | Lesson notes |
| status | ENUM('scheduled','completed','cancelled') | NOT NULL, DEFAULT 'scheduled' | Lesson status |
| payment_status | ENUM('paid','unpaid') | NOT NULL, DEFAULT 'unpaid' | Payment status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Constraints:**
- CHECK: end_time > start_time

**Indexes:**
- `idx_lesson_tutor_date` — on (tutor_id, date) for calendar view
- `idx_lesson_student` — on (student_id) for student history
- `idx_lesson_status` — on (status) for filtering scheduled/completed
- `idx_lesson_payment` — on (payment_status) for unpaid lesson reports

---

### 2.7 LessonRecurrence

Recurring lesson patterns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| lesson_id | UUID | FK → Lesson(id), UNIQUE, NOT NULL | Source lesson |
| recurrence_type | ENUM('daily','weekly','biweekly','monthly') | NOT NULL | Repeat pattern |
| end_date | DATE | NOT NULL, CHECK (end_date > lesson.date) | Recurrence end |
| total_occurrences | INT | NOT NULL, CHECK (total_occurrences > 0) | Max occurrences |
| current_occurrence | INT | NOT NULL, DEFAULT 1 | Current occurrence # |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_lessonrecurrence_lesson` — UNIQUE on lesson_id

---

### 2.8 Homework

Assignments given to students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| student_id | UUID | FK → Student(id), NOT NULL | Assigned student |
| tutor_id | UUID | FK → User(id), NOT NULL | Assigning tutor |
| title | VARCHAR(255) | NOT NULL | Homework title |
| description | TEXT | | Detailed description |
| type | ENUM('text','file','mixed') | NOT NULL, DEFAULT 'text' | Homework type |
| due_date | DATE | NOT NULL | Due date |
| status | ENUM('pending','submitted','graded','archived') | NOT NULL, DEFAULT 'pending' | Status |
| grade | TEXT | | Grade/feedback |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_homework_student` — on (student_id) for student's homework list
- `idx_homework_tutor` — on (tutor_id) for tutor's assignments
- `idx_homework_status` — on (status) for filtering pending/submitted
- `idx_homework_due` — on (due_date) for due-date queries

---

### 2.9 HomeworkFile

Uploaded files attached to homework.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| homework_id | UUID | FK → Homework(id), NOT NULL | Parent homework |
| file_url | VARCHAR(500) | NOT NULL | Storage URL (Supabase) |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_type | VARCHAR(50) | NOT NULL | MIME type |
| file_size | BIGINT | NOT NULL, CHECK (file_size > 0) | File size in bytes |
| uploaded_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload timestamp |

**Indexes:**
- `idx_homeworkfile_homework` — on (homework_id) for file listing

---

### 2.10 AuditLog

Security and activity tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → User(id), NOT NULL | Actor user |
| action | VARCHAR(100) | NOT NULL | Action performed |
| entity_type | VARCHAR(50) | NOT NULL | Entity type affected |
| entity_id | UUID | | Specific entity ID |
| details | JSONB | | Additional context |
| ip_address | VARCHAR(45) | | IPv4/IPv6 address |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp |

**Indexes:**
- `idx_auditlog_user` — on (user_id) for user activity history
- `idx_auditlog_entity` — on (entity_type, entity_id) for entity audit
- `idx_auditlog_created` — on (created_at DESC) for time-range queries
- `idx_auditlog_action` — on (action) for action-type filtering

---

## 3. Relationship Descriptions

| # | Relationship | Type | Cardinality | Description |
|---|--------------|------|-------------|-------------|
| 1 | User → UserProfile | 1:1 | One user has zero or one profile | Profile created after registration |
| 2 | User → FinanceCategory | 1:N | One user creates many categories | User categories; system categories have NULL user_id |
| 3 | User → FinanceTransaction | 1:N | One user records many transactions | Each transaction belongs to one user |
| 4 | FinanceCategory → FinanceTransaction | 1:N | One category has many transactions | FK: transaction.category_id → category.id |
| 5 | User → Student | 1:N | One tutor has many students | FK: student.tutor_id → user.id |
| 6 | User → Lesson | 1:N | One tutor conducts many lessons | FK: lesson.tutor_id → user.id |
| 7 | Student → Lesson | 1:N | One student attends many lessons | FK: lesson.student_id → student.id |
| 8 | Lesson → LessonRecurrence | 1:1 | One lesson may have one recurrence | Optional; recurring lessons only |
| 9 | User → Homework | 1:N | One tutor assigns many homeworks | FK: homework.tutor_id → user.id |
| 10 | Student → Homework | 1:N | One student receives many homeworks | FK: homework.student_id → student.id |
| 11 | Homework → HomeworkFile | 1:N | One homework has many files | FK: file.homework_id → homework.id |
| 12 | User → AuditLog | 1:N | One user generates many log entries | FK: log.user_id → user.id |

---

## 4. Indexes Summary

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| User | idx_user_email | email (UNIQUE) | Login lookup |
| User | idx_user_role | role | Admin filtering |
| UserProfile | idx_userprofile_user_id | user_id (UNIQUE) | 1:1 join |
| FinanceCategory | idx_financecategory_user_type | user_id, type | Filtered queries |
| FinanceCategory | idx_financecategory_system | is_system | System categories |
| FinanceTransaction | idx_financetransaction_user_date | user_id, date DESC | Date-range analytics |
| FinanceTransaction | idx_financetransaction_user_type | user_id, type | Income/expense filter |
| FinanceTransaction | idx_financetransaction_category | category_id | Category joins |
| Student | idx_student_tutor | tutor_id | Tutor's students |
| Student | idx_student_tutor_status | tutor_id, status | Filtered by status |
| Lesson | idx_lesson_tutor_date | tutor_id, date | Calendar view |
| Lesson | idx_lesson_student | student_id | Student history |
| Lesson | idx_lesson_status | status | Status filtering |
| Lesson | idx_lesson_payment | payment_status | Unpaid reports |
| LessonRecurrence | idx_lessonrecurrence_lesson | lesson_id (UNIQUE) | Recurrence lookup |
| Homework | idx_homework_student | student_id | Student homework list |
| Homework | idx_homework_tutor | tutor_id | Tutor assignments |
| Homework | idx_homework_status | status | Status filtering |
| Homework | idx_homework_due | due_date | Due-date queries |
| HomeworkFile | idx_homeworkfile_homework | homework_id | File listing |
| AuditLog | idx_auditlog_user | user_id | User activity |
| AuditLog | idx_auditlog_entity | entity_type, entity_id | Entity audit |
| AuditLog | idx_auditlog_created | created_at DESC | Time-range queries |
| AuditLog | idx_auditlog_action | action | Action filtering |

---

## 5. Constraints & Validations

### 5.1 Primary Keys
All tables use UUID primary keys with `DEFAULT gen_random_uuid()`.

### 5.2 Foreign Keys
| Table | Column | References | ON DELETE |
|-------|--------|------------|-----------|
| UserProfile | user_id | User.id | CASCADE |
| FinanceCategory | user_id | User.id | SET NULL |
| FinanceTransaction | user_id | User.id | CASCADE |
| FinanceTransaction | category_id | FinanceCategory.id | RESTRICT |
| Student | tutor_id | User.id | CASCADE |
| Lesson | student_id | Student.id | CASCADE |
| Lesson | tutor_id | User.id | CASCADE |
| LessonRecurrence | lesson_id | Lesson.id | CASCADE |
| Homework | student_id | Student.id | CASCADE |
| Homework | tutor_id | User.id | CASCADE |
| HomeworkFile | homework_id | Homework.id | CASCADE |
| AuditLog | user_id | User.id | CASCADE |

### 5.3 CHECK Constraints
- `FinanceTransaction.amount > 0`
- `Lesson.end_time > Lesson.start_time`
- `Lesson.price >= 0`
- `Student.lesson_price >= 0`
- `LessonRecurrence.total_occurrences > 0`
- `LessonRecurrence.end_date > Lesson.date` (via trigger)
- `HomeworkFile.file_size > 0`

### 5.4 UNIQUE Constraints
- `User.email`
- `UserProfile.user_id`
- `LessonRecurrence.lesson_id`

### 5.5 ENUM Types
```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'tutor', 'student');
CREATE TYPE finance_type AS ENUM ('income', 'expense');
CREATE TYPE student_status AS ENUM ('active', 'paused', 'finished');
CREATE TYPE lesson_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid');
CREATE TYPE recurrence_type AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');
CREATE TYPE homework_type AS ENUM ('text', 'file', 'mixed');
CREATE TYPE homework_status AS ENUM ('pending', 'submitted', 'graded', 'archived');
```

### 5.6 Business Rules
1. A **tutor** can only see/manage their own students, lessons, and homeworks (RLS enforced at app layer).
2. A **student** can only view their own lessons, homeworks, and payments.
3. **System categories** (is_system=true) have `user_id = NULL` and cannot be deleted by users.
4. **Student portal** must not expose other users' data (row-level security or app-level checks).
5. **File uploads** are limited to: PDF, DOCX, JPG, PNG (validated at upload).
6. **Audit logs** are append-only; no UPDATE or DELETE permitted.

---

## 6. Diagram Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FINANCE & TUTOR PLATFORM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐  1:1  ┌──────────────┐                                     │
│   │   User   │───────│ UserProfile  │                                     │
│   └────┬─────┘       └──────────────┘                                     │
│        │                                                                    │
│        ├───── 1:N ──────► FinanceCategory ──── 1:N ──────► FinanceTransaction
│        │                                                                    │
│        ├───── 1:N ──────► Student ─────┬──── 1:N ──────► Lesson            │
│        │                               │                  │                 │
│        ├───── 1:N ──────► Lesson ◄─────┘                  │                 │
│        │                               │                  │                 │
│        ├───── 1:N ──────► Homework ────┼──── 1:N ──────► LessonRecurrence  │
│        │                    │          │                                   │
│        │                    └── 1:N ──►HomeworkFile                        │
│        │                                                                    │
│        └───── 1:N ──────► AuditLog                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Generated: 2026-06-13*
*Project: Finance & Tutor Management Platform*
*Tech Stack: FastAPI + SQLAlchemy 2 + Alembic + PostgreSQL*
