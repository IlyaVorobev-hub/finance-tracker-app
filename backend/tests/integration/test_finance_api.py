from datetime import date

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class TestFinanceAPI:
    async def test_create_category(self, client: AsyncClient, auth_headers):
        response = await client.post(
            "/api/v1/finance/categories",
            json={"name": "Tutoring Income", "type": "income"},
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Tutoring Income"
        assert data["type"] == "income"
        assert data["is_system"] is False

    async def test_list_categories(self, client: AsyncClient, auth_headers):
        await client.post(
            "/api/v1/finance/categories",
            json={"name": "Test Income", "type": "income"},
            headers=auth_headers,
        )
        response = await client.get("/api/v1/finance/categories", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert data["total"] >= 1

    async def test_delete_custom_category(self, client: AsyncClient, auth_headers):
        create_response = await client.post(
            "/api/v1/finance/categories",
            json={"name": "To Delete", "type": "expense"},
            headers=auth_headers,
        )
        category_id = create_response.json()["id"]

        response = await client.delete(
            f"/api/v1/finance/categories/{category_id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

    async def test_create_income(self, client: AsyncClient, auth_headers):
        categories_response = await client.get("/api/v1/finance/categories", headers=auth_headers)
        income_cat = next(c for c in categories_response.json()["categories"] if c["type"] == "income" and c["is_system"])

        response = await client.post(
            "/api/v1/finance/transactions",
            json={
                "amount": 1000.0,
                "date": str(date.today()),
                "category_id": income_cat["id"],
                "type": "income",
                "description": "Monthly salary",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 1000.0
        assert data["type"] == "income"

    async def test_create_expense(self, client: AsyncClient, auth_headers):
        categories_response = await client.get("/api/v1/finance/categories", headers=auth_headers)
        expense_cat = next(c for c in categories_response.json()["categories"] if c["type"] == "expense" and c["is_system"])

        response = await client.post(
            "/api/v1/finance/transactions",
            json={
                "amount": 50.0,
                "date": str(date.today()),
                "category_id": expense_cat["id"],
                "type": "expense",
                "description": "Office supplies",
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 50.0
        assert data["type"] == "expense"

    async def test_list_transactions(self, client: AsyncClient, auth_headers):
        response = await client.get("/api/v1/finance/transactions", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "transactions" in data
        assert "total" in data

    async def test_list_transactions_with_type_filter(self, client: AsyncClient, auth_headers):
        categories_response = await client.get("/api/v1/finance/categories", headers=auth_headers)
        income_cat = next(c for c in categories_response.json()["categories"] if c["type"] == "income" and c["is_system"])

        await client.post(
            "/api/v1/finance/transactions",
            json={
                "amount": 200.0,
                "date": str(date.today()),
                "category_id": income_cat["id"],
                "type": "income",
            },
            headers=auth_headers,
        )

        response = await client.get(
            "/api/v1/finance/transactions",
            params={"type": "income"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert all(t["type"] == "income" for t in data["transactions"])

    async def test_update_transaction(self, client: AsyncClient, auth_headers):
        categories_response = await client.get("/api/v1/finance/categories", headers=auth_headers)
        income_cat = next(c for c in categories_response.json()["categories"] if c["type"] == "income" and c["is_system"])

        create_response = await client.post(
            "/api/v1/finance/transactions",
            json={
                "amount": 100.0,
                "date": str(date.today()),
                "category_id": income_cat["id"],
                "type": "income",
            },
            headers=auth_headers,
        )
        transaction_id = create_response.json()["id"]

        response = await client.put(
            f"/api/v1/finance/transactions/{transaction_id}",
            json={"amount": 150.0, "description": "Updated"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["amount"] == 150.0

    async def test_delete_transaction(self, client: AsyncClient, auth_headers):
        categories_response = await client.get("/api/v1/finance/categories", headers=auth_headers)
        income_cat = next(c for c in categories_response.json()["categories"] if c["type"] == "income" and c["is_system"])

        create_response = await client.post(
            "/api/v1/finance/transactions",
            json={
                "amount": 100.0,
                "date": str(date.today()),
                "category_id": income_cat["id"],
                "type": "income",
            },
            headers=auth_headers,
        )
        transaction_id = create_response.json()["id"]

        response = await client.delete(
            f"/api/v1/finance/transactions/{transaction_id}",
            headers=auth_headers,
        )
        assert response.status_code == 204

    async def test_get_dashboard(self, client: AsyncClient, auth_headers):
        response = await client.get("/api/v1/finance/dashboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "current_balance" in data
        assert "month_income" in data
        assert "month_expenses" in data
        assert "recent_transactions" in data

    async def test_get_analytics(self, client: AsyncClient, auth_headers):
        response = await client.get(
            "/api/v1/finance/analytics/summary",
            params={
                "start_date": str(date.today().replace(day=1)),
                "end_date": str(date.today()),
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_income" in data
        assert "total_expenses" in data
        assert "net_profit" in data

    async def test_unauthorized_access(self, client: AsyncClient):
        response = await client.get("/api/v1/finance/categories")
        assert response.status_code == 401
