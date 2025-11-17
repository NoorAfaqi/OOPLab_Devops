#!/bin/bash
# Deployment script for AWS EC2
# This script handles zero-downtime deployment

set -e

ENV=${1:-prod}
DEPLOY_PATH=${DEPLOY_PATH:-/opt/ooplab}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Starting deployment to $ENV environment..."

cd $DEPLOY_PATH || exit 1

# Backup current deployment
echo "📦 Creating backup..."
mkdir -p backup
if [ -f "$COMPOSE_FILE" ]; then
  docker-compose ps > backup/containers-$(date +%Y%m%d-%H%M%S).txt 2>/dev/null || true
fi

# Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
if [ "$ENV" = "prod" ]; then
  git reset --hard origin/main
else
  git reset --hard origin/develop
fi

# Login to GitLab Container Registry
echo "🔐 Logging into container registry..."
echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin $CI_REGISTRY

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker pull $CI_REGISTRY_IMAGE/backend:latest
docker pull $CI_REGISTRY_IMAGE/frontend:latest

# Stop existing containers gracefully
echo "🛑 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans || true

# Start new containers
echo "▶️  Starting new containers..."
ENV=$ENV docker-compose -f $COMPOSE_FILE up -d --build

# Wait for health checks
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Health check
echo "🏥 Performing health check..."
for i in {1..10}; do
  if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ Health check failed after 10 attempts"
    exit 1
  fi
  echo "⏳ Health check attempt $i failed, retrying..."
  sleep 5
done

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -af --filter "until=24h"

echo "✅ Deployment completed successfully!"

