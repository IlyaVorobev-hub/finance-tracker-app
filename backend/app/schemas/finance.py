from datetime import date, datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: Literal["income", "expense"]


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    sort_order: int | None = None


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    type: str
    is_system: bool
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryListResponse(BaseModel):
    categories: list[CategoryResponse]
    total: int


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    date: date
    category_id: UUID
    type: Literal["income", "expense"]
    description: str | None = None


class TransactionUpdate(BaseModel):
    amount: float | None = Field(None, gt=0)
    date: Optional[date] = None
    category_id: UUID | None = None
    description: str | None = None


class TransactionResponse(BaseModel):
    id: UUID
    amount: float
    date: date
    category_id: UUID
    type: str
    description: str | None
    category: CategoryResponse
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    transactions: list[TransactionResponse]
    total: int
    page: int
    per_page: int


class AnalyticsQuery(BaseModel):
    start_date: date
    end_date: date


class PeriodAnalytics(BaseModel):
    total_income: float
    total_expenses: float
    net_profit: float
    avg_income: float
    avg_expenses: float


class DashboardResponse(BaseModel):
    current_balance: float
    month_income: float
    month_expenses: float
    recent_transactions: list[TransactionResponse]
