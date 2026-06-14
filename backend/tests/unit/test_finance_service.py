from datetime import date, timedelta
from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.finance import CategoryCreate, TransactionCreate
from app.services import finance_service


@pytest.mark.asyncio
class TestFinanceService:
    async def test_create_category(self, db_session: AsyncSession, test_user: User):
        data = CategoryCreate(name="Custom Income", type="income")
        category = await finance_service.create_category(db_session, test_user.id, data)
        assert category.name == "Custom Income"
        assert category.type == "income"
        assert category.is_system is False
        assert category.user_id == test_user.id

    async def test_list_categories_includes_system(self, db_session: AsyncSession, test_user: User):
        categories = await finance_service.list_categories(db_session, test_user.id)
        system_categories = [c for c in categories if c.is_system]
        assert len(system_categories) > 0

    async def test_delete_custom_category(self, db_session: AsyncSession, test_user: User):
        data = CategoryCreate(name="To Delete", type="expense")
        category = await finance_service.create_category(db_session, test_user.id, data)
        await finance_service.delete_category(db_session, category.id, test_user.id)
        updated = await finance_service.list_categories(db_session, test_user.id)
        active_custom = [c for c in updated if c.name == "To Delete" and c.is_active]
        assert len(active_custom) == 0

    async def test_cannot_delete_system_category(self, db_session: AsyncSession, test_user: User):
        categories = await finance_service.list_categories(db_session, test_user.id)
        system_cat = next(c for c in categories if c.is_system)
        with pytest.raises(ValueError, match="Category not found or is a system category"):
            await finance_service.delete_category(db_session, system_cat.id, test_user.id)

    async def test_create_transaction(self, db_session: AsyncSession, test_user: User):
        categories = await finance_service.list_categories(db_session, test_user.id)
        income_cat = next(c for c in categories if c.type == "income" and c.is_system)
        data = TransactionCreate(
            amount=100.00,
            date=date.today(),
            category_id=income_cat.id,
            type="income",
            description="Test income",
        )
        transaction = await finance_service.create_transaction(db_session, test_user.id, data)
        assert transaction.amount == Decimal("100.00")
        assert transaction.type == "income"
        assert transaction.description == "Test income"

    async def test_list_transactions_with_filters(self, db_session: AsyncSession, test_user: User):
        categories = await finance_service.list_categories(db_session, test_user.id)
        income_cat = next(c for c in categories if c.type == "income" and c.is_system)
        expense_cat = next(c for c in categories if c.type == "expense" and c.is_system)

        for i in range(3):
            await finance_service.create_transaction(
                db_session,
                test_user.id,
                TransactionCreate(
                    amount=100.0 * (i + 1),
                    date=date.today(),
                    category_id=income_cat.id,
                    type="income",
                ),
            )
        await finance_service.create_transaction(
            db_session,
            test_user.id,
            TransactionCreate(
                amount=50.00,
                date=date.today(),
                category_id=expense_cat.id,
                type="expense",
            ),
        )
        await db_session.commit()

        transactions, total = await finance_service.list_transactions(db_session, test_user.id, type="income")
        assert total == 3
        assert all(t.type == "income" for t in transactions)

        transactions, total = await finance_service.list_transactions(db_session, test_user.id, type="expense")
        assert total == 1

    async def test_get_analytics(self, db_session: AsyncSession, test_user: User):
        categories = await finance_service.list_categories(db_session, test_user.id)
        income_cat = next(c for c in categories if c.type == "income" and c.is_system)
        expense_cat = next(c for c in categories if c.type == "expense" and c.is_system)

        await finance_service.create_transaction(
            db_session,
            test_user.id,
            TransactionCreate(amount=1000.0, date=date.today(), category_id=income_cat.id, type="income"),
        )
        await finance_service.create_transaction(
            db_session,
            test_user.id,
            TransactionCreate(amount=300.0, date=date.today(), category_id=expense_cat.id, type="expense"),
        )
        await db_session.commit()

        analytics = await finance_service.get_analytics(
            db_session, test_user.id, date.today() - timedelta(days=1), date.today() + timedelta(days=1)
        )
        assert analytics.total_income == 1000.0
        assert analytics.total_expenses == 300.0
        assert analytics.net_profit == 700.0

    async def test_get_dashboard(self, db_session: AsyncSession, test_user: User):
        categories = await finance_service.list_categories(db_session, test_user.id)
        income_cat = next(c for c in categories if c.type == "income" and c.is_system)

        await finance_service.create_transaction(
            db_session,
            test_user.id,
            TransactionCreate(amount=500.0, date=date.today(), category_id=income_cat.id, type="income"),
        )
        await db_session.commit()

        dashboard = await finance_service.get_dashboard(db_session, test_user.id)
        assert dashboard.current_balance == 500.0
        assert dashboard.month_income == 500.0
        assert len(dashboard.recent_transactions) == 1
