# CI/CD Pipeline Architecture Diagram

## Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Git Push Event                           │
│                    (GitHub → GitLab Mirror)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  GitLab Webhook │
                    │   Triggered     │
                    └────────┬───────┘
                             │
                             ▼
        ┌─────────────────────────────────────────┐
        │         STAGE 1: VALIDATE               │
        ├─────────────────────────────────────────┤
        │                                         │
        │  ┌──────────────────┐                  │
        │  │ validate:yaml    │                  │
        │  │ - YAML linting   │                  │
        │  └────────┬──────────┘                  │
        │           │                             │
        │  ┌────────▼──────────┐                  │
        │  │validate:dockerfiles│                │
        │  │ - Dockerfile check │                │
        │  └────────┬──────────┘                  │
        └───────────┼─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────────────────┐
        │         STAGE 2: BUILD                  │
        ├─────────────────────────────────────────┤
        │                                         │
        │  ┌──────────────────┐                  │
        │  │ build:backend    │                  │
        │  │ - Build image    │                  │
        │  │ - Push to registry│                 │
        │  └────────┬──────────┘                  │
        │           │                             │
        │  ┌────────▼──────────┐                  │
        │  │ build:frontend   │                  │
        │  │ - Build image    │                  │
        │  │ - Push to registry│                 │
        │  └────────┬──────────┘                  │
        └───────────┼─────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────────────────┐
        │         STAGE 3: TEST                   │
        ├─────────────────────────────────────────┤
        │                                         │
        │  ┌──────────────────┐                  │
        │  │ test:backend    │                  │
        │  │ - Unit tests    │                  │
        │  │ - JUnit XML     │                  │
        │  └────────┬──────────┘                  │
        │           │                             │
        │  ┌────────▼──────────┐                  │
        │  │ test:frontend    │                  │
        │  │ - Unit tests    │                  │
        │  │ - JUnit XML     │                  │
        │  └────────┬──────────┘                  │
        └───────────┼─────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌──────────────────┐
│ Deploy Dev   │      │  Deploy Prod     │
│ (develop)    │      │  (main)          │
└──────┬───────┘      └────────┬─────────┘
       │                       │
       ▼                       ▼
┌──────────────────┐  ┌──────────────────────┐
│ Development      │  │  Production (EC2)    │
│ Server           │  │  - Zero-downtime    │
│                  │  │  - Health checks     │
│ 1. SSH Connect   │  │  - Rolling update   │
│ 2. Pull Code     │  │  - Auto rollback    │
│ 3. Pull Images   │  │                     │
│ 4. Deploy        │  │  1. SSH Connect      │
│ 5. Health Check  │  │  2. Backup          │
└──────────────────┘  │  3. Pull Code       │
                      │  4. Pull Images     │
                      │  5. Deploy          │
                      │  6. Health Check    │
                      │  7. Cleanup         │
                      └──────────────────────┘
```

## Detailed Stage Breakdown

### Stage 1: Validate

**Purpose**: Ensure code quality and configuration correctness

```
┌─────────────────────────────────────┐
│         Validate Stage              │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   validate:yaml              │  │
│  │   - Check YAML syntax        │  │
│  │   - Validate docker-compose   │  │
│  │   - Validate .gitlab-ci.yml   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ validate:dockerfiles         │  │
│  │ - Validate Dockerfile syntax │  │
│  │ - Test Docker build          │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Stage 2: Build

**Purpose**: Build and push Docker images to registry

```
┌─────────────────────────────────────┐
│          Build Stage                │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   build:backend              │  │
│  │   1. Login to registry       │  │
│  │   2. Build Docker image      │  │
│  │   3. Tag with commit SHA     │  │
│  │   4. Tag as latest           │  │
│  │   5. Push to registry        │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   build:frontend             │  │
│  │   1. Login to registry       │  │
│  │   2. Build Docker image      │  │
│  │   3. Tag with commit SHA     │  │
│  │   4. Tag as latest           │  │
│  │   5. Push to registry        │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  GitLab Container Registry  │
│  - backend:latest           │
│  - backend:commit-sha       │
│  - frontend:latest          │
│  - frontend:commit-sha      │
└─────────────────────────────┘
```

### Stage 3: Test

**Purpose**: Execute unit tests and generate reports

```
┌─────────────────────────────────────┐
│          Test Stage                 │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   test:backend               │  │
│  │   1. Install dependencies    │  │
│  │   2. Run unit tests          │  │
│  │   3. Generate JUnit XML      │  │
│  │   4. Calculate coverage      │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   test:frontend              │  │
│  │   1. Install dependencies    │  │
│  │   2. Run unit tests          │  │
│  │   3. Generate JUnit XML      │  │
│  │   4. Calculate coverage      │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Test Artifacts            │
│   - test-results.xml        │
│   - Coverage reports        │
└─────────────────────────────┘
```

### Stage 4: Deploy-Dev

**Purpose**: Deploy to development environment

```
┌─────────────────────────────────────┐
│      Deploy-Dev Stage               │
├─────────────────────────────────────┤
│                                     │
│  1. SSH to Dev Server              │
│  2. Pull latest code (develop)      │
│  3. Login to Container Registry    │
│  4. Pull latest images              │
│  5. Stop existing containers        │
│  6. Start new containers           │
│  7. Health check                    │
│  8. Cleanup old images              │
│                                     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Development Server          │
│  - Running containers        │
│  - Health: OK                │
└─────────────────────────────┘
```

### Stage 5: Deploy-Prod

**Purpose**: Zero-downtime deployment to production

```
┌─────────────────────────────────────┐
│      Deploy-Prod Stage               │
├─────────────────────────────────────┤
│                                     │
│  1. SSH to EC2 Server               │
│  2. Create backup                   │
│  3. Pull latest code (main)          │
│  4. Login to Container Registry    │
│  5. Pull latest images              │
│  6. Zero-downtime deployment:       │
│     a. Start new containers         │
│     b. Wait for health checks       │
│     c. Stop old containers          │
│  7. Final health check              │
│  8. Cleanup old images              │
│                                     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Production Server (EC2)     │
│  - Zero-downtime achieved    │
│  - Health: OK                │
│  - Backup created            │
└─────────────────────────────┘
```

## Zero-Downtime Deployment Flow

```
┌─────────────────────────────────────────────────────┐
│           Zero-Downtime Deployment                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Current State:                                     │
│  ┌──────────┐  ┌──────────┐                        │
│  │ Backend  │  │ Frontend │                        │
│  │ (v1.0)   │  │ (v1.0)   │                        │
│  └──────────┘  └──────────┘                        │
│       │              │                              │
│       └──────┬───────┘                              │
│              │                                      │
│         ┌────▼────┐                                 │
│         │ Nginx   │                                 │
│         │ Load    │                                 │
│         │ Balancer│                                 │
│         └─────────┘                                 │
│                                                     │
│  Step 1: Start New Containers                      │
│  ┌──────────┐  ┌──────────┐                        │
│  │ Backend  │  │ Frontend │                        │
│  │ (v1.1)   │  │ (v1.1)   │                        │
│  └──────────┘  └──────────┘                        │
│                                                     │
│  Step 2: Health Checks                             │
│  ✓ Backend health: OK                              │
│  ✓ Frontend health: OK                             │
│                                                     │
│  Step 3: Traffic Routing                           │
│  ┌──────────┐  ┌──────────┐                        │
│  │ Backend  │  │ Frontend │                        │
│  │ (v1.1)   │  │ (v1.1)   │                        │
│  └────┬─────┘  └────┬─────┘                        │
│       │              │                              │
│       └──────┬───────┘                              │
│              │                                      │
│         ┌────▼────┐                                 │
│         │ Nginx   │                                 │
│         │ (Routes │                                 │
│         │ to v1.1)│                                 │
│         └─────────┘                                 │
│                                                     │
│  Step 4: Stop Old Containers                       │
│  ┌──────────┐  ┌──────────┐                        │
│  │ Backend  │  │ Frontend │                        │
│  │ (v1.0)   │  │ (v1.0)   │                        │
│  │ STOPPED  │  │ STOPPED  │                        │
│  └──────────┘  └──────────┘                        │
│                                                     │
│  Final State:                                      │
│  ┌──────────┐  ┌──────────┐                        │
│  │ Backend  │  │ Frontend │                        │
│  │ (v1.1)   │  │ (v1.1)   │                        │
│  └──────────┘  └──────────┘                        │
│       │              │                              │
│       └──────┬───────┘                              │
│              │                                      │
│         ┌────▼────┐                                 │
│         │ Nginx   │                                 │
│         │ Load    │                                 │
│         │ Balancer│                                 │
│         └─────────┘                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Trigger Points

```
┌─────────────────────────────────────┐
│         Pipeline Triggers           │
├─────────────────────────────────────┤
│                                     │
│  • Push to main branch              │
│    → Full pipeline + Prod deploy    │
│                                     │
│  • Push to develop branch          │
│    → Full pipeline + Dev deploy    │
│                                     │
│  • Merge Request                    │
│    → Validate + Build + Test        │
│                                     │
│  • Manual Trigger                  │
│    → Can trigger any stage         │
│                                     │
└─────────────────────────────────────┘
```

## Artifacts Flow

```
┌─────────────────────────────────────┐
│         Artifacts Generated         │
├─────────────────────────────────────┤
│                                     │
│  Build Stage:                       │
│  • Docker images in registry        │
│                                     │
│  Test Stage:                        │
│  • JUnit XML reports                │
│  • Coverage reports                 │
│                                     │
│  Deploy Stage:                      │
│  • Deployment logs                  │
│  • Health check results             │
│                                     │
└─────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────┐
│         Error Scenarios             │
├─────────────────────────────────────┤
│                                     │
│  Test Failure:                      │
│  → Pipeline stops                   │
│  → No deployment                    │
│  → Notification sent                │
│                                     │
│  Build Failure:                     │
│  → Pipeline stops                   │
│  → Previous images remain           │
│                                     │
│  Deploy Failure:                    │
│  → Health check fails               │
│  → Automatic rollback               │
│  → Previous version restored        │
│                                     │
└─────────────────────────────────────┘
```

