# API Documentation

## Base URL

- **Development**: `http://localhost:8000/api/v1`
- **Production**: `https://api.your-domain.com/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Lifecycle

1. Register or login to receive `access_token` and `refresh_token`
2. Use `access_token` for API requests (expires in 15 minutes)
3. When expired, use `refresh_token` to get a new pair
4. Logout to invalidate tokens

---

## Endpoints

### Health

#### `GET /health`

Check API health status.

**Response**: `200 OK`
```json
{
  "status": "ok",
  "version": "v1"
}
```

---

### Auth

#### `POST /auth/register`

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "tutor",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

---

#### `POST /auth/login`

Login and receive access/refresh tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

---

#### `POST /auth/refresh`

Refresh access token using refresh token.

**Request Body**:
```json
{
  "refresh_token": "eyJ..."
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

---

#### `POST /auth/logout`

Logout and invalidate tokens.

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

---

#### `GET /auth/me`

Get current user profile.

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "tutor",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00"
}
```

---

#### `GET /auth/me/profile`

Get current user's extended profile.

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "bio": "Tutor bio",
  "phone": "+1234567890"
}
```

---

#### `PUT /auth/password`

Change current user's password.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "old_password": "current-password",
  "new_password": "new-secure-password"
}
```

**Response**: `204 No Content`

---

### Users

> All user endpoints require `super_admin` or `admin` role.

#### `GET /users`

List all users with pagination.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| skip | int | 0 | Offset |
| limit | int | 20 | Max results (1-100) |

**Response**: `200 OK`
```json
{
  "users": [...],
  "total": 50
}
```

---

#### `GET /users/{user_id}`

Get user by ID.

**Response**: `200 OK` - User object

---

#### `POST /users`

Create a new user. **SuperAdmin only**.

**Request Body**:
```json
{
  "email": "new@example.com",
  "password": "securepassword",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "tutor"
}
```

**Response**: `201 Created` - User object

---

#### `PUT /users/{user_id}`

Update user information.

**Response**: `200 OK` - Updated user object

---

#### `DELETE /users/{user_id}`

Delete a user. **SuperAdmin only**.

**Response**: `204 No Content`

---

#### `PUT /users/{user_id}/role`

Update user role. **SuperAdmin only**.

**Request Body**:
```json
{
  "role": "admin"
}
```

**Response**: `200 OK` - Updated user object

---

#### `PUT /users/{user_id}/status`

Enable/disable user. **SuperAdmin only**.

**Request Body**:
```json
{
  "is_active": false
}
```

**Response**: `200 OK` - Updated user object

---

### Finance

#### Categories

##### `GET /finance/categories`

List all categories for current user.

**Response**: `200 OK`
```json
{
  "categories": [...],
  "total": 10
}
```

---

##### `POST /finance/categories`

Create a new category.

**Request Body**:
```json
{
  "name": "Tutoring Income",
  "type": "income",
  "color": "#22c55e"
}
```

**Response**: `201 Created` - Category object

---

##### `PUT /finance/categories/{category_id}`

Update a category.

**Response**: `200 OK` - Updated category object

---

##### `DELETE /finance/categories/{category_id}`

Delete a category.

**Response**: `204 No Content`

---

#### Transactions

##### `GET /finance/transactions`

List transactions with filtering and pagination.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter: `income` or `expense` |
| category_id | uuid | Filter by category |
| start_date | string | Filter from date (ISO format) |
| end_date | string | Filter to date (ISO format) |
| page | int | Page number (default: 1) |
| per_page | int | Results per page (1-100, default: 20) |

**Response**: `200 OK`
```json
{
  "transactions": [...],
  "total": 100,
  "page": 1,
  "per_page": 20
}
```

---

##### `GET /finance/transactions/{transaction_id}`

Get transaction by ID.

**Response**: `200 OK` - Transaction object

---

##### `POST /finance/transactions`

Create a new transaction.

**Request Body**:
```json
{
  "type": "income",
  "amount": 50.00,
  "description": "Math tutoring session",
  "category_id": "uuid",
  "date": "2024-01-15"
}
```

**Response**: `201 Created` - Transaction object

---

##### `PUT /finance/transactions/{transaction_id}`

Update a transaction.

**Response**: `200 OK` - Updated transaction object

---

##### `DELETE /finance/transactions/{transaction_id}`

Delete a transaction.

**Response**: `204 No Content`

---

#### Analytics

##### `GET /finance/analytics/summary`

Get analytics for a date range.

**Query Parameters**:
| Parameter | Type | Required |
|-----------|------|----------|
| start_date | string | Yes (ISO format) |
| end_date | string | Yes (ISO format) |

**Response**: `200 OK`
```json
{
  "total_income": 5000.00,
  "total_expenses": 2000.00,
  "net_profit": 3000.00,
  "income_by_category": [...],
  "expense_by_category": [...]
}
```

---

##### `GET /finance/dashboard`

Get dashboard summary data.

**Response**: `200 OK`
```json
{
  "total_income": 5000.00,
  "total_expenses": 2000.00,
  "recent_transactions": [...],
  "monthly_trend": [...]
}
```

---

### Students

#### `GET /students`

List students with filtering and search.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter: `active`, `paused`, `finished` |
| search | string | Search by name, email, subject |
| page | int | Page number (default: 1) |
| per_page | int | Results per page (1-100, default: 20) |

**Response**: `200 OK`
```json
{
  "students": [...],
  "total": 25,
  "page": 1,
  "per_page": 20
}
```

---

#### `GET /students/{student_id}`

Get student by ID.

**Response**: `200 OK` - Student object

---

#### `POST /students`

Create a new student. **Tutor/Admin required**.

**Request Body**:
```json
{
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "subject": "Mathematics",
  "grade_level": "10th",
  "notes": "Struggles with algebra"
}
```

**Response**: `201 Created` - Student object

---

#### `PUT /students/{student_id}`

Update student information. **Tutor/Admin required**.

**Response**: `200 OK` - Updated student object

---

#### `DELETE /students/{student_id}`

Delete a student. **Admin only**.

**Response**: `204 No Content`

---

#### `PATCH /students/{student_id}/status`

Update student status. **Tutor/Admin required**.

**Request Body**:
```json
{
  "status": "active"
}
```

**Response**: `200 OK` - Updated student object

---

#### `GET /students/{student_id}/lessons`

Get lessons for a student.

**Query Parameters**:
| Parameter | Type | Default |
|-----------|------|---------|
| page | int | 1 |
| per_page | int | 20 |

**Response**: `200 OK`
```json
{
  "lessons": [...],
  "total": 10,
  "page": 1,
  "per_page": 20
}
```

---

#### `GET /students/{student_id}/payments`

Get payment history for a student.

**Response**: `200 OK`
```json
{
  "payments": [
    {
      "lesson_id": "uuid",
      "date": "2024-01-15",
      "amount": 50.00,
      "status": "paid"
    }
  ]
}
```

---

### Lessons

#### `GET /lessons/calendar`

Get lessons for calendar view.

**Query Parameters**:
| Parameter | Type | Required |
|-----------|------|----------|
| start_date | date | Yes |
| end_date | date | Yes |

**Response**: `200 OK`
```json
{
  "lessons": [...],
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}
```

---

#### `GET /lessons`

List lessons with filtering.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| start_date | date | Filter from date |
| end_date | date | Filter to date |
| student_id | uuid | Filter by student |
| status | string | Filter: `scheduled`, `completed`, `cancelled` |
| page | int | Page number (default: 1) |
| per_page | int | Results per page (1-100, default: 20) |

**Response**: `200 OK`
```json
{
  "lessons": [...],
  "total": 30,
  "page": 1,
  "per_page": 20
}
```

---

#### `GET /lessons/{lesson_id}`

Get lesson by ID.

**Response**: `200 OK` - Lesson object

---

#### `POST /lessons`

Create a new lesson. **Tutor/Admin required**.

**Request Body**:
```json
{
  "student_id": "uuid",
  "date": "2024-01-15",
  "start_time": "14:00",
  "end_time": "15:00",
  "price": 50.00,
  "comment": "Algebra review"
}
```

**Response**: `201 Created` - Lesson object

---

#### `PUT /lessons/{lesson_id}`

Update a lesson. **Tutor/Admin required**.

**Response**: `200 OK` - Updated lesson object

---

#### `DELETE /lessons/{lesson_id}`

Cancel a lesson. **Tutor/Admin required**.

**Response**: `200 OK` - Cancelled lesson object

---

#### `PATCH /lessons/{lesson_id}/reschedule`

Reschedule a lesson. **Tutor/Admin required**.

**Request Body**:
```json
{
  "date": "2024-01-20",
  "start_time": "16:00",
  "end_time": "17:00"
}
```

**Response**: `200 OK` - Rescheduled lesson object

---

#### `PATCH /lessons/{lesson_id}/payment`

Update payment status. **Tutor/Admin required**.

**Request Body**:
```json
{
  "payment_status": "paid"
}
```

**Response**: `200 OK` - Updated lesson object

---

#### `POST /lessons/{lesson_id}/recurring`

Create recurring lessons. **Tutor/Admin required**.

**Request Body**:
```json
{
  "frequency": "weekly",
  "count": 10,
  "end_date": "2024-04-15"
}
```

**Response**: `200 OK`
```json
{
  "lessons": [...],
  "total_created": 10
}
```

---

### Homework

#### `GET /homework`

List homework assignments.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| student_id | uuid | Filter by student |
| status | string | Filter by status |
| page | int | Page number (default: 1) |
| per_page | int | Results per page (1-100, default: 20) |

**Response**: `200 OK`
```json
{
  "homework": [...],
  "total": 20,
  "page": 1,
  "per_page": 20
}
```

---

#### `GET /homework/{homework_id}`

Get homework by ID.

**Response**: `200 OK` - Homework object

---

#### `POST /homework`

Create homework assignment. **Tutor/Admin required**.

**Request Body**:
```json
{
  "student_id": "uuid",
  "title": "Chapter 5 Practice Problems",
  "description": "Complete problems 1-20",
  "type": "assignment",
  "due_date": "2024-01-20"
}
```

**Response**: `201 Created` - Homework object

---

#### `PUT /homework/{homework_id}`

Update homework. **Tutor/Admin required**.

**Response**: `200 OK` - Updated homework object

---

#### `DELETE /homework/{homework_id}`

Delete homework. **Tutor/Admin required**.

**Response**: `204 No Content`

---

#### `PATCH /homework/{homework_id}/archive`

Archive homework. **Tutor/Admin required**.

**Response**: `200 OK` - Archived homework object

---

#### `POST /homework/{homework_id}/files`

Upload file to homework. **Tutor/Admin required**.

**Request**: `multipart/form-data`
- `file`: File to upload

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "file_url": "/uploads/homework/file.pdf",
  "file_name": "worksheet.pdf",
  "file_type": "application/pdf",
  "file_size": 1024000
}
```

---

#### `DELETE /homework/{homework_id}/files/{file_id}`

Delete homework file. **Tutor/Admin required**.

**Response**: `204 No Content`

---

#### `GET /homework/student/{student_id}`

Get all homework for a student.

**Response**: `200 OK` - List of homework objects

---

### Files

#### `POST /files/upload`

Upload a file. **Tutor/Admin required**.

**Request**: `multipart/form-data`
- `file`: File to upload
- `bucket` (query): Storage bucket (default: `general`)

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "file_url": "/uploads/general/document.pdf",
  "file_name": "document.pdf",
  "file_type": "application/pdf",
  "file_size": 1024000
}
```

---

#### `GET /files/{file_id}`

Get file metadata.

**Response**: `200 OK` - File object

---

#### `DELETE /files/{file_id}`

Delete a file. **Tutor/Admin required**.

**Response**: `204 No Content`

---

#### `GET /files/{file_id}/download`

Download a file.

**Response**: `200 OK` - File content with appropriate Content-Type

---

### Student Portal

> All portal endpoints require `student` role.

#### `GET /portal/schedule`

Get student's upcoming schedule.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | int | 30 | Number of days ahead (1-90) |

**Response**: `200 OK`
```json
{
  "lessons": [
    {
      "id": "uuid",
      "date": "2024-01-15",
      "start_time": "14:00",
      "end_time": "15:00",
      "status": "scheduled"
    }
  ]
}
```

---

#### `GET /portal/homework`

Get student's homework assignments.

**Response**: `200 OK` - List of homework objects

---

#### `GET /portal/history`

Get student's lesson history.

**Query Parameters**:
| Parameter | Type | Default |
|-----------|------|---------|
| page | int | 1 |
| per_page | int | 20 |

**Response**: `200 OK`
```json
{
  "lessons": [...],
  "total": 50,
  "page": 1,
  "per_page": 20
}
```

---

#### `GET /portal/payments`

Get student's payment history.

**Response**: `200 OK`
```json
{
  "payments": [
    {
      "lesson_id": "uuid",
      "date": "2024-01-15",
      "price": 50.00,
      "payment_status": "paid"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., time slot conflict) |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## Rate Limiting

API requests are rate-limited to 60 requests per minute per IP address. Returns `429 Too Many Requests` when exceeded.
