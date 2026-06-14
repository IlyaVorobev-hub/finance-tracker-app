import asyncio
import uuid
from collections.abc import AsyncGenerator
from datetime import date, time, timedelta
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app
from app.models.base import Base
from app.models.finance import FinanceCategory
from app.models.homework import Homework
from app.models.lesson import Lesson
from app.models.student import Student
from app.models.user import User, UserProfile
from app.security.jwt import create_access_token
from app.security.password import hash_password


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides.clear()
    from app.api.deps import get_db_session

    app.dependency_overrides[get_db_session] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid.uuid4(),
        email="tutor@test.com",
        password_hash=hash_password("TestPass123!"),
        role="tutor",
        is_active=True,
    )
    db_session.add(user)
    profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        first_name="Test",
        last_name="Tutor",
        phone="+1234567890",
    )
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_admin(db_session: AsyncSession) -> User:
    user = User(
        id=uuid.uuid4(),
        email="admin@test.com",
        password_hash=hash_password("AdminPass123!"),
        role="admin",
        is_active=True,
    )
    db_session.add(user)
    profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        first_name="Test",
        last_name="Admin",
    )
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_student_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid.uuid4(),
        email="student@test.com",
        password_hash=hash_password("StudentPass123!"),
        role="student",
        is_active=True,
    )
    db_session.add(user)
    profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user.id,
        first_name="Test",
        last_name="Student",
    )
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin: User) -> dict:
    token = create_access_token({"sub": str(test_admin.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def student_headers(test_student_user: User) -> dict:
    token = create_access_token({"sub": str(test_student_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_student(db_session: AsyncSession, test_user: User) -> Student:
    student = Student(
        id=uuid.uuid4(),
        tutor_id=test_user.id,
        first_name="John",
        last_name="Doe",
        email="johndoe@email.com",
        phone="+1234567891",
        subject="Mathematics",
        lesson_price=Decimal("50.00"),
        status="active",
    )
    db_session.add(student)
    await db_session.commit()
    await db_session.refresh(student)
    return student


@pytest.fixture
async def test_portal_student(db_session: AsyncSession, test_user: User, test_student_user: User) -> Student:
    student = Student(
        id=uuid.uuid4(),
        tutor_id=test_user.id,
        first_name="Portal",
        last_name="Student",
        email="student@test.com",
        phone="+1234567892",
        subject="General",
        lesson_price=Decimal("40.00"),
        status="active",
    )
    db_session.add(student)
    await db_session.commit()
    await db_session.refresh(student)
    return student


@pytest.fixture
async def test_category(db_session: AsyncSession, test_user: User) -> FinanceCategory:
    category = FinanceCategory(
        id=uuid.uuid4(),
        user_id=test_user.id,
        name="Custom Category",
        type="income",
        is_system=False,
        is_active=True,
        sort_order=0,
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category


@pytest.fixture
async def test_lesson(db_session: AsyncSession, test_user: User, test_student: Student) -> Lesson:
    lesson = Lesson(
        id=uuid.uuid4(),
        student_id=test_student.id,
        tutor_id=test_user.id,
        date=date.today() + timedelta(days=1),
        start_time=time(10, 0),
        end_time=time(11, 0),
        price=Decimal("50.00"),
        status="scheduled",
        payment_status="unpaid",
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    return lesson


@pytest.fixture
async def test_homework(db_session: AsyncSession, test_user: User, test_student: Student) -> Homework:
    homework = Homework(
        id=uuid.uuid4(),
        tutor_id=test_user.id,
        student_id=test_student.id,
        title="Test Homework",
        description="Complete exercises 1-10",
        type="text",
        due_date=date.today() + timedelta(days=7),
        status="pending",
    )
    db_session.add(homework)
    await db_session.commit()
    await db_session.refresh(homework)
    return homework
