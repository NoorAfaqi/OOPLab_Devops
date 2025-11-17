# CI/CD Pipeline Documentation

## Overview

This project implements a complete CI/CD pipeline using GitLab CI/CD for automated testing, building, and deployment to AWS EC2 servers. The pipeline ensures continuous integration and delivery with zero-downtime deployments.

## Pipeline Architecture

### Stages

The pipeline consists of the following stages:

1. **Validate** - Code quality and configuration validation
2. **Build** - Docker image building and registry push
3. **Test** - Unit test execution with JUnit XML reporting
4. **Deploy-Dev** - Deployment to development environment
5. **Deploy-Prod** - Deployment to production environment (AWS EC2)

### Pipeline Flow Diagram

```
┌─────────────┐
│   Commit    │
│   Push      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Validate Stage │
│  - YAML lint    │
│  - Dockerfile   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Build Stage   │
│  - Backend      │
│  - Frontend     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Test Stage    │
│  - Unit Tests   │
│  - JUnit XML    │
└──────┬──────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│ Deploy Dev  │  │ Deploy Prod │
│ (develop)   │  │ (main)      │
└─────────────┘  └─────────────┘
```

## Configuration

### GitLab CI/CD Variables

The following variables must be configured in GitLab CI/CD settings:

#### Container Registry
- `CI_REGISTRY` - GitLab Container Registry URL
- `CI_REGISTRY_USER` - Registry username
- `CI_REGISTRY_PASSWORD` - Registry password (masked)
- `CI_REGISTRY_IMAGE` - Base image path

#### Development Environment
- `DEV_SERVER_HOST` - Development server hostname/IP
- `DEV_SERVER_USER` - SSH username for dev server
- `DEV_DEPLOY_PATH` - Deployment path on dev server
- `SSH_PRIVATE_KEY` - SSH private key for dev server (file type, masked)

#### Production Environment (AWS EC2)
- `PROD_SERVER_HOST` - Production server hostname/IP (EC2)
- `PROD_SERVER_USER` - SSH username (usually `ec2-user` or `ubuntu`)
- `PROD_DEPLOY_PATH` - Deployment path on prod server (e.g., `/opt/ooplab`)
- `SSH_PRIVATE_KEY` - SSH private key for EC2 (file type, masked)

### Setting Up GitLab Variables

1. Go to your GitLab project
2. Navigate to **Settings > CI/CD > Variables**
3. Add each variable with appropriate values
4. Mark sensitive variables as **Protected** and **Masked**

## Pipeline Stages Details

### 1. Validate Stage

**Purpose**: Ensure code quality and configuration correctness

**Jobs**:
- `validate:yaml` - Validates YAML syntax
- `validate:dockerfiles` - Validates Dockerfile syntax

**Triggers**: All branches, merge requests

### 2. Build Stage

**Purpose**: Build Docker images for backend and frontend

**Jobs**:
- `build:backend` - Builds backend Docker image
- `build:frontend` - Builds frontend Docker image

**Artifacts**: Docker images pushed to GitLab Container Registry

**Triggers**: `main`, `develop` branches, merge requests

### 3. Test Stage

**Purpose**: Execute unit tests and generate test reports

**Jobs**:
- `test:backend` - Runs backend unit tests
- `test:frontend` - Runs frontend unit tests

**Artifacts**: 
- JUnit XML test reports
- Test coverage reports (if configured)

**Triggers**: All branches, merge requests

### 4. Deploy-Dev Stage

**Purpose**: Deploy to development environment

**Job**: `deploy:dev`

**Process**:
1. SSH to development server
2. Pull latest code from `develop` branch
3. Pull latest Docker images
4. Stop existing containers
5. Start new containers with `docker-compose`
6. Perform health checks
7. Clean up old images

**Triggers**: `develop` branch (manual)

### 5. Deploy-Prod Stage

**Purpose**: Deploy to production environment (AWS EC2)

**Job**: `deploy:prod`

**Process**:
1. SSH to AWS EC2 server
2. Create backup of current deployment
3. Pull latest code from `main` branch
4. Pull latest Docker images
5. Zero-downtime deployment:
   - Start new containers
   - Wait for health checks
   - Stop old containers
6. Clean up old images
7. Final health check

**Triggers**: `main` branch (manual)

## Zero-Downtime Deployment

The production deployment implements a zero-downtime strategy:

1. **Rolling Update**: New containers are started before old ones are stopped
2. **Health Checks**: New containers must pass health checks before old ones are removed
3. **Load Balancing**: Nginx load balancer distributes traffic during the update
4. **Rollback**: If health checks fail, the deployment is rolled back

## Monitoring

### Pipeline Monitoring

- View pipeline status in GitLab CI/CD > Pipelines
- Check job logs for detailed execution information
- Review test reports in the Test stage

### Application Monitoring

- Health check endpoint: `http://your-server/health`
- Container health: `docker ps` (shows health status)
- Logs: `docker-compose logs -f`

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify SSH key is correctly configured
   - Check server hostname and user
   - Ensure firewall allows SSH connections

2. **Docker Build Failed**
   - Check Dockerfile syntax
   - Verify dependencies in package.json
   - Review build logs for specific errors

3. **Tests Failed**
   - Review test output in job logs
   - Check test files for syntax errors
   - Verify test dependencies are installed

4. **Deployment Failed**
   - Check server disk space
   - Verify Docker is running on server
   - Review deployment logs
   - Check health endpoint accessibility

### Debugging Commands

```bash
# Check pipeline status
gitlab-ci status

# View job logs
gitlab-ci logs <job-id>

# Test SSH connection
ssh -i ~/.ssh/key.pem user@server

# Check Docker on server
ssh user@server "docker ps"

# View application logs
ssh user@server "cd /opt/ooplab && docker-compose logs -f"
```

## Security Measures

1. **Secrets Management**: All sensitive data stored in GitLab CI/CD variables
2. **SSH Keys**: Private keys stored as masked variables
3. **Container Registry**: Authentication required for image pulls
4. **Environment Isolation**: Separate dev and prod environments
5. **Health Checks**: Automated validation before deployment completion

## Best Practices

1. **Always test in dev before deploying to prod**
2. **Review pipeline logs before manual deployments**
3. **Keep Docker images updated and secure**
4. **Monitor application health after deployment**
5. **Maintain backup of production deployments**
6. **Use semantic versioning for releases**

## Next Steps

- [ ] Set up monitoring and alerting
- [ ] Implement automated rollback on failure
- [ ] Add performance testing to pipeline
- [ ] Configure notification webhooks
- [ ] Set up staging environment

