from datetime import date
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.finance import FinanceCategory, FinanceTransaction
from app.schemas.finance import (
    CategoryCreate,
    CategoryUpdate,
    DashboardResponse,
    PeriodAnalytics,
    TransactionCreate,
    TransactionUpdate,
)

SYSTEM_CATEGORIES = [
    {"name": "Salary", "type": "income", "sort_order": 1},
    {"name": "Freelance", "type": "income", "sort_order": 2},
    {"name": "Investments", "type": "income", "sort_order": 3},
    {"name": "Other Income", "type": "income", "sort_order": 4},
    {"name": "Rent", "type": "expense", "sort_order": 1},
    {"name": "Utilities", "type": "expense", "sort_order": 2},
    {"name": "Food", "type": "expense", "sort_order": 3},
    {"name": "Transport", "type": "expense", "sort_order": 4},
    {"name": "Education", "type": "expense", "sort_order": 5},
    {"name": "Other Expense", "type": "expense", "sort_order": 6},
]


async def ensure_system_categories(db: AsyncSession) -> None:
    result = await db.execute(
        select(FinanceCategory.id).where(FinanceCategory.is_system == True).limit(1)  # noqa: E712
    )
    if result.scalar_one_or_none() is not None:
        return
    for cat in SYSTEM_CATEGORIES:
        db.add(
            FinanceCategory(
                name=cat["name"],
                type=cat["type"],
                is_system=True,
                is_active=True,
                sort_order=cat["sort_order"],
            )
        )
    await db.flush()


async def create_category(db: AsyncSession, user_id: UUID, data: CategoryCreate) -> FinanceCategory:
    await ensure_system_categories(db)
    category = FinanceCategory(
        user_id=user_id,
        name=data.name,
        type=data.type,
        is_system=False,
        is_active=True,
        sort_order=0,
    )
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return category


async def list_categories(db: AsyncSession, user_id: UUID) -> list[FinanceCategory]:
    await ensure_system_categories(db)
    result = await db.execute(
        select(FinanceCategory)
        .where(
            (FinanceCategory.is_system == True) | (FinanceCategory.user_id == user_id)  # noqa: E712
        )
        .where(FinanceCategory.is_active == True)  # noqa: E712
        .order_by(FinanceCategory.type, FinanceCategory.sort_order)
    )
    return list(result.scalars().all())


async def update_category(
    db: AsyncSession, category_id: UUID, user_id: UUID, data: CategoryUpdate
) -> FinanceCategory:
    result = await db.execute(
        select(FinanceCategory).where(
            FinanceCategory.id == category_id,
            FinanceCategory.user_id == user_id,
            FinanceCategory.is_system == False,  # noqa: E712
        )
    )
    category = result.scalar_one_or_none()
    if category is None:
        raise ValueError("Category not found or is a system category")
    if data.name is not None:
        category.name = data.name
    if data.sort_order is not None:
        category.sort_order = data.sort_order
    await db.flush()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: UUID, user_id: UUID) -> None:
    result = await db.execute(
        select(FinanceCategory).where(
            FinanceCategory.id == category_id,
            FinanceCategory.user_id == user_id,
            FinanceCategory.is_system == False,  # noqa: E712
        )
    )
    category = result.scalar_one_or_none()
    if category is None:
        raise ValueError("Category not found or is a system category")
    category.is_active = False
    await db.flush()


async def create_transaction(db: AsyncSession, user_id: UUID, data: TransactionCreate) -> FinanceTransaction:
    await ensure_system_categories(db)
    cat_result = await db.execute(
        select(FinanceCategory).where(
            FinanceCategory.id == data.category_id,
            FinanceCategory.is_active == True,  # noqa: E712
        )
    )
    category = cat_result.scalar_one_or_none()
    if category is None:
        raise ValueError("Category not found")
    if category.is_system or category.user_id == user_id:
        pass
    else:
        raise ValueError("Category not accessible")

    transaction = FinanceTransaction(
        user_id=user_id,
        category_id=data.category_id,
        amount=data.amount,
        type=data.type,
        description=data.description,
        date=data.date,
    )
    db.add(transaction)
    await db.flush()
    await db.refresh(transaction, attribute_names=["category"])
    return transaction


async def list_transactions(
    db: AsyncSession,
    user_id: UUID,
    type: str | None = None,
    category_id: UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[FinanceTransaction], int]:
    query = select(FinanceTransaction).where(FinanceTransaction.user_id == user_id)
    count_query = select(func.count(FinanceTransaction.id)).where(FinanceTransaction.user_id == user_id)

    if type:
        query = query.where(FinanceTransaction.type == type)
        count_query = count_query.where(FinanceTransaction.type == type)
    if category_id:
        query = query.where(FinanceTransaction.category_id == category_id)
        count_query = count_query.where(FinanceTransaction.category_id == category_id)
    if start_date:
        query = query.where(FinanceTransaction.date >= start_date)
        count_query = count_query.where(FinanceTransaction.date >= start_date)
    if end_date:
        query = query.where(FinanceTransaction.date <= end_date)
        count_query = count_query.where(FinanceTransaction.date <= end_date)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.options(selectinload(FinanceTransaction.category))
    query = query.order_by(FinanceTransaction.date.desc()).offset(offset).limit(per_page)
    result = await db.execute(query)
    transactions = list(result.scalars().all())
    return transactions, total


async def get_transaction(
    db: AsyncSession, transaction_id: UUID, user_id: UUID
) -> FinanceTransaction:
    result = await db.execute(
        select(FinanceTransaction).where(
            FinanceTransaction.id == transaction_id,
            FinanceTransaction.user_id == user_id,
        )
    )
    transaction = result.scalar_one_or_none()
    if transaction is None:
        raise ValueError("Transaction not found")
    return transaction


async def update_transaction(
    db: AsyncSession, transaction_id: UUID, user_id: UUID, data: TransactionUpdate
) -> FinanceTransaction:
    transaction = await get_transaction(db, transaction_id, user_id)
    if data.amount is not None:
        transaction.amount = data.amount
    if data.date is not None:
        transaction.date = data.date
    if data.category_id is not None:
        transaction.category_id = data.category_id
    if data.description is not None:
        transaction.description = data.description
    await db.flush()
    await db.refresh(transaction, attribute_names=["category"])
    return transaction


async def delete_transaction(db: AsyncSession, transaction_id: UUID, user_id: UUID) -> None:
    transaction = await get_transaction(db, transaction_id, user_id)
    await db.delete(transaction)
    await db.flush()


async def get_analytics(
    db: AsyncSession, user_id: UUID, start_date: date, end_date: date
) -> PeriodAnalytics:
    income_agg = await db.execute(
        select(
            func.coalesce(func.sum(FinanceTransaction.amount), 0),
            func.count(FinanceTransaction.id),
        ).where(
            FinanceTransaction.user_id == user_id,
            FinanceTransaction.type == "income",
            FinanceTransaction.date >= start_date,
            FinanceTransaction.date <= end_date,
        )
    )
    income_row = income_agg.one()
    total_income = float(income_row[0])
    income_count = income_row[1]

    expense_agg = await db.execute(
        select(
            func.coalesce(func.sum(FinanceTransaction.amount), 0),
            func.count(FinanceTransaction.id),
        ).where(
            FinanceTransaction.user_id == user_id,
            FinanceTransaction.type == "expense",
            FinanceTransaction.date >= start_date,
            FinanceTransaction.date <= end_date,
        )
    )
    expense_row = expense_agg.one()
    total_expenses = float(expense_row[0])
    expense_count = expense_row[1]

    return PeriodAnalytics(
        total_income=total_income,
        total_expenses=total_expenses,
        net_profit=total_income - total_expenses,
        avg_income=total_income / income_count if income_count > 0 else 0.0,
        avg_expenses=total_expenses / expense_count if expense_count > 0 else 0.0,
    )


async def get_dashboard(db: AsyncSession, user_id: UUID) -> DashboardResponse:
    balance_agg = await db.execute(
        select(
            func.sum(
                case(
                    (FinanceTransaction.type == "income", FinanceTransaction.amount),
                    else_=-FinanceTransaction.amount,
                )
            )
        ).where(FinanceTransaction.user_id == user_id)
    )
    current_balance = float(balance_agg.scalar_one() or 0)

    today = date.today()
    month_start = today.replace(day=1)

    month_income_agg = await db.execute(
        select(func.coalesce(func.sum(FinanceTransaction.amount), 0)).where(
            FinanceTransaction.user_id == user_id,
            FinanceTransaction.type == "income",
            FinanceTransaction.date >= month_start,
            FinanceTransaction.date <= today,
        )
    )
    month_income = float(month_income_agg.scalar_one())

    month_expense_agg = await db.execute(
        select(func.coalesce(func.sum(FinanceTransaction.amount), 0)).where(
            FinanceTransaction.user_id == user_id,
            FinanceTransaction.type == "expense",
            FinanceTransaction.date >= month_start,
            FinanceTransaction.date <= today,
        )
    )
    month_expenses = float(month_expense_agg.scalar_one())

    recent_result = await db.execute(
        select(FinanceTransaction)
        .where(FinanceTransaction.user_id == user_id)
        .order_by(FinanceTransaction.date.desc(), FinanceTransaction.created_at.desc())
        .limit(10)
    )
    recent_transactions = list(recent_result.scalars().all())

    return DashboardResponse(
        current_balance=current_balance,
        month_income=month_income,
        month_expenses=month_expenses,
        recent_transactions=recent_transactions,
    )
