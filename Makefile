.PHONY: help install dev test lint format docker-up docker-down migrate seed

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev:
	docker-compose up -d
	cd backend && uvicorn app.main:app --reload --port 8000 &
	cd frontend && npm run dev

test:
	cd backend && pytest -v --cov=app --cov-report=html

test-unit:
	cd backend && pytest -m unit -v

test-integration:
	cd backend && pytest -m integration -v

lint:
	cd backend && ruff check .
	cd frontend && npm run lint

format:
	cd backend && ruff check --fix .
	cd frontend && npm run format

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

migrate:
	cd backend && alembic upgrade head

makemigrations:
	cd backend && alembic revision --autogenerate -m "$(msg)"
