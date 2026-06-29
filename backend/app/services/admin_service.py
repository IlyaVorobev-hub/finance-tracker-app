import uuid
from datetime import date, datetime

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.models.finance import FinanceTransaction
from app.models.homework import Homework
from app.models.lesson import Lesson
from app.models.student import Student
from app.models.user import User
from app.schemas.admin import SystemStats, UserStats


async def get_system_stats(db: AsyncSession) -> SystemStats:
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    total_tutors = (
        await db.execute(select(func.count()).select_from(User).where(User.role == "tutor"))
    ).scalar_one()
    total_students = (await db.execute(select(func.count()).select_from(Student))).scalar_one()
    total_lessons = (await db.execute(select(func.count()).select_from(Lesson))).scalar_one()
    total_homework = (
        await db.execute(select(func.count()).select_from(Homework))
    ).scalar_one()

    income_result = await db.execute(
        select(func.coalesce(func.sum(FinanceTransaction.amount), 0)).where(
            FinanceTransaction.type == "income"
        )
    )
    total_income = float(income_result.scalar_one())

    expense_result = await db.execute(
        select(func.coalesce(func.sum(FinanceTransaction.amount), 0)).where(
            FinanceTransaction.type == "expense"
        )
    )
    total_expenses = float(expense_result.scalar_one())

    today = date.today()
    active_lessons_today = (
        await db.execute(
            select(func.count())
            .select_from(Lesson)
            .where(and_(Lesson.date == today, Lesson.status == "scheduled"))
        )
    ).scalar_one()

    pending_homework = (
        await db.execute(
            select(func.count())
            .select_from(Homework)
            .where(Homework.status == "pending")
        )
    ).scalar_one()

    return SystemStats(
        total_users=total_users,
        total_tutors=total_tutors,
        total_students=total_students,
        total_lessons=total_lessons,
        total_homework=total_homework,
        total_income=total_income,
        total_expenses=total_expenses,
        active_lessons_today=active_lessons_today,
        pending_homework=pending_homework,
    )


async def get_audit_logs(
    db: AsyncSession,
    user_id: uuid.UUID | None = None,
    action: str | None = None,
    entity_type: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[AuditLog], int]:
    query = select(AuditLog)
    count_query = select(func.count()).select_from(AuditLog)

    filters = []
    if user_id is not None:
        filters.append(AuditLog.user_id == user_id)
    if action is not None:
        filters.append(AuditLog.action == action)
    if entity_type is not None:
        filters.append(AuditLog.entity_type == entity_type)
    if start_date is not None:
        filters.append(AuditLog.created_at >= start_date)
    if end_date is not None:
        filters.append(AuditLog.created_at <= end_date)

    if filters:
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))

    total = (await db.execute(count_query)).scalar_one()
    offset = (page - 1) * per_page
    result = await db.execute(
        query.order_by(AuditLog.created_at.desc()).offset(offset).limit(per_page)
    )
    logs = list(result.scalars().all())
    return logs, total


async def get_user_stats(db: AsyncSession, user_id: uuid.UUID) -> UserStats:
    lessons_count = (
        await db.execute(
            select(func.count())
            .select_from(Lesson)
            .where(Lesson.tutor_id == user_id)
        )
    ).scalar_one()

    students_count = (
        await db.execute(
            select(func.count())
            .select_from(Student)
            .where(Student.tutor_id == user_id)
        )
    ).scalar_one()

    income_result = await db.execute(
        select(func.coalesce(func.sum(FinanceTransaction.amount), 0)).where(
            and_(FinanceTransaction.user_id == user_id, FinanceTransaction.type == "income")
        )
    )
    income = float(income_result.scalar_one())

    return UserStats(
        user_id=user_id,
        lessons_count=lessons_count,
        students_count=students_count,
        income=income,
    )


async def get_all_users_stats(db: AsyncSession) -> list[UserStats]:
    lessons_subq = (
        select(
            Lesson.tutor_id.label("user_id"),
            func.count().label("lessons_count"),
        )
        .group_by(Lesson.tutor_id)
        .subquery()
    )
    students_subq = (
        select(
            Student.tutor_id.label("user_id"),
            func.count().label("students_count"),
        )
        .group_by(Student.tutor_id)
        .subquery()
    )
    income_subq = (
        select(
            FinanceTransaction.user_id.label("user_id"),
            func.coalesce(func.sum(FinanceTransaction.amount), 0).label("income"),
        )
        .where(FinanceTransaction.type == "income")
        .group_by(FinanceTransaction.user_id)
        .subquery()
    )

    result = await db.execute(
        select(
            User.id.label("user_id"),
            func.coalesce(lessons_subq.c.lessons_count, 0).label("lessons_count"),
            func.coalesce(students_subq.c.students_count, 0).label("students_count"),
            func.coalesce(income_subq.c.income, 0).label("income"),
        )
        .outerjoin(lessons_subq, User.id == lessons_subq.c.user_id)
        .outerjoin(students_subq, User.id == students_subq.c.user_id)
        .outerjoin(income_subq, User.id == income_subq.c.user_id)
    )

    return [
        UserStats(
            user_id=row.user_id,
            lessons_count=row.lessons_count,
            students_count=row.students_count,
            income=float(row.income),
        )
        for row in result.all()
    ]
