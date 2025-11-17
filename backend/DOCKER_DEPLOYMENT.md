# Docker Deployment Guide

This guide explains how to containerize and deploy the OOPLab Backend API using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd OOPLab-Backend-EXPRRESS/ooplab-backend-express

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f api
```

### 2. Build and Run with Docker

```bash
# Build the image
docker build -t ooplab-backend-api .

# Run the container
docker run -d \
  --name ooplab-backend-api \
  -p 5000:5000 \
  --env-file .env \
  ooplab-backend-api

# View logs
docker logs -f ooplab-backend-api
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=srv659.hstgr.io
DB_NAME=u647222294_OOPLab
DB_USER=u647222294_AnyUser
DB_PASSWORD=LafdPbtA2s[6
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# MySQL Root Password (for local MySQL)
MYSQL_ROOT_PASSWORD=rootpassword
```

## Docker Files

### Dockerfile
- **Purpose**: Development and basic production
- **Base Image**: Node.js 18 Alpine
- **Security**: Non-root user
- **Features**: Health check, proper signal handling

### Dockerfile.prod
- **Purpose**: Production-optimized
- **Features**: Multi-stage build, dumb-init for signal handling
- **Optimization**: Smaller image size, better security

### docker-compose.yml
- **Services**: API, MySQL (optional), Nginx (optional)
- **Networking**: Custom bridge network
- **Volumes**: Persistent MySQL data
- **Restart Policy**: unless-stopped

## Available Commands

### Docker Commands

```bash
# Build image
docker build -t ooplab-backend-api .

# Build production image
docker build -f Dockerfile.prod -t ooplab-backend-api:prod .

# Run container
docker run -d --name ooplab-backend-api -p 5000:5000 --env-file .env ooplab-backend-api

# Stop container
docker stop ooplab-backend-api

# Remove container
docker rm ooplab-backend-api

# View logs
docker logs -f ooplab-backend-api

# Execute shell in container
docker exec -it ooplab-backend-api sh

# Remove image
docker rmi ooplab-backend-api
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build -d

# Scale API service
docker-compose up --scale api=3 -d

# Remove everything (including volumes)
docker-compose down -v
```

## Health Checks

The container includes health checks that verify the API is responding:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:5000/api/health
```

## Production Deployment

### 1. Using Docker Compose (Recommended)

```bash
# Use production Dockerfile
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml ooplab-stack

# View services
docker service ls

# Scale service
docker service scale ooplab-stack_api=3
```

### 3. Using Kubernetes

```bash
# Create deployment
kubectl apply -f k8s-deployment.yaml

# Create service
kubectl apply -f k8s-service.yaml

# Check status
kubectl get pods
kubectl get services
```

## Monitoring and Logging

### View Logs

```bash
# Container logs
docker logs -f ooplab-backend-api

# Compose logs
docker-compose logs -f api

# All services logs
docker-compose logs -f
```

### Log Files

Logs are stored in the `logs/` directory inside the container:
- `combined.log` - All logs
- `error.log` - Error logs only

## Security Considerations

1. **Non-root User**: Container runs as `nodejs` user (UID 1001)
2. **Minimal Base Image**: Uses Alpine Linux for smaller attack surface
3. **No Dev Dependencies**: Production image excludes dev dependencies
4. **Health Checks**: Automatic health monitoring
5. **Resource Limits**: Set appropriate CPU and memory limits
6. **Network Security**: Use custom networks and proper firewall rules

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Check database connectivity
   docker exec -it ooplab-backend-api node -e "require('./src/config/database').testConnection()"
   ```

3. **Permission Issues**
   ```bash
   # Fix log directory permissions
   docker exec -it ooplab-backend-api chown -R nodejs:nodejs /app/logs
   ```

4. **Container Won't Start**
   ```bash
   # Check logs
   docker logs ooplab-backend-api
   
   # Check environment variables
   docker exec -it ooplab-backend-api env
   ```

### Debug Mode

```bash
# Run in debug mode
docker run -it --rm \
  --name ooplab-backend-debug \
  -p 5000:5000 \
  --env-file .env \
  ooplab-backend-api sh

# Inside container
npm run dev
```

## Performance Optimization

### Resource Limits

```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Scaling

```bash
# Scale API service
docker-compose up --scale api=3 -d

# Load balancing with nginx
# Already configured in nginx.conf
```

## Backup and Recovery

### Database Backup

```bash
# Backup MySQL data
docker exec ooplab-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} > backup.sql

# Restore from backup
docker exec -i ooplab-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${DB_NAME} < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v ooplab-backend-express_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz -C /data .
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t ooplab-backend-api .
      - name: Run tests
        run: docker run --rm ooplab-backend-api npm test
      - name: Deploy
        run: |
          docker tag ooplab-backend-api your-registry/ooplab-backend-api:latest
          docker push your-registry/ooplab-backend-api:latest
```

## Support

For issues and questions:
- Check the logs: `docker logs ooplab-backend-api`
- Review this documentation
- Check the main README.md
- Contact the development team
