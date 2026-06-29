#!/bin/bash
set -e

echo "=== Finance Tutor Deployment Script ==="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo ""
echo "1. Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo ""
echo "2. Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "3. Running database migrations..."
sleep 5
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

echo ""
echo "4. Deployment complete!"
echo ""
echo "Backend: http://localhost:8000"
echo "Health: http://localhost:8000/health"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To stop: docker-compose -f docker-compose.prod.yml down"
