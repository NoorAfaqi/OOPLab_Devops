# Project Architecture Documentation

## Overview

OOPLab DevOps project is a full-stack web application with a microservices architecture, containerized using Docker, and deployed via GitLab CI/CD to AWS EC2.

## Technology Stack

### Backend
- **Runtime**: Node.js 18 LTS
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: Sequelize
- **Authentication**: JWT, Passport.js
- **Caching**: Redis (optional)
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Styling**: Tailwind CSS
- **State Management**: React Context API

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitLab CI/CD
- **Cloud Provider**: AWS EC2
- **Version Control**: Git (GitHub → GitLab)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet Users                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Load Balancer                      │
│              (Reverse Proxy & Load Balancing)               │
└────────┬───────────────────────────────┬────────────────────┘
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│   Frontend       │          │    Backend       │
│   (Next.js)      │◄─────────┤   (Express.js)   │
│   Port: 3000     │  API     │   Port: 5000     │
└──────────────────┘          └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │     MySQL 8.0    │
                              │   Port: 3306     │
                              └──────────────────┘
```

## Project Structure

```
OOPLab_Devops/
├── backend/                 # Backend API service
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   ├── tests/              # Unit tests
│   ├── migrations/         # Database migrations
│   ├── Dockerfile          # Production Dockerfile
│   ├── Dockerfile.dev     # Development Dockerfile
│   └── package.json
│
├── frontend/               # Frontend Next.js application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utility libraries
│   │   └── utils/         # Helper functions
│   ├── tests/             # Unit tests
│   ├── Dockerfile.prod    # Production Dockerfile
│   ├── Dockerfile.dev     # Development Dockerfile
│   └── package.json
│
├── nginx/                  # Nginx configuration
│   ├── nginx.conf         # Main config
│   └── conf.d/            # Server configs
│
├── scripts/                # Deployment scripts
│   └── deploy.sh          # EC2 deployment script
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── CI_CD_PIPELINE.md
│   └── GITLAB_RUNNER_SETUP.md
│
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml # Development compose
└── .gitlab-ci.yml         # CI/CD pipeline
```

## Environment Configuration

### Development Environment

**Purpose**: Local development with hot-reload

**Features**:
- Volume mounts for live code updates
- Development dependencies included
- Hot-reload enabled
- Debug logging enabled

**Configuration**:
- `NODE_ENV=development`
- Source code mounted as volumes
- Development Dockerfiles used

### Production Environment

**Purpose**: Optimized production deployment

**Features**:
- Multi-stage builds for smaller images
- Production dependencies only
- Optimized builds
- Health checks enabled
- Log persistence

**Configuration**:
- `NODE_ENV=production`
- Standalone Next.js output
- Production Dockerfiles used
- Persistent volumes for logs

## Docker Architecture

### Container Structure

```
┌─────────────────────────────────────────┐
│         docker-compose.yml              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐          │
│  │ Frontend │  │ Backend   │          │
│  │ :3000    │  │ :5000     │          │
│  └────┬─────┘  └─────┬─────┘          │
│       │              │                 │
│       └──────┬───────┘                 │
│              │                         │
│       ┌──────▼──────┐                 │
│       │   Nginx     │                 │
│       │   :80/:443  │                 │
│       └──────┬──────┘                 │
│              │                         │
│       ┌──────▼──────┐                 │
│       │   MySQL     │                 │
│       │   :3306     │                 │
│       └─────────────┘                 │
│                                         │
│  Volumes:                               │
│  - mysql_data                           │
│  - backend_logs                         │
│  - frontend_logs                        │
│  - nginx_logs                           │
└─────────────────────────────────────────┘
```

### Image Strategy

**Development Images**:
- Include dev dependencies
- Larger image size
- Faster rebuilds
- Hot-reload support

**Production Images**:
- Multi-stage builds
- Minimal dependencies
- Smaller image size
- Optimized for performance

## Network Architecture

### Docker Network

- **Network Name**: `ooplab-network`
- **Driver**: Bridge
- **Services**: All containers on same network
- **Communication**: Service names as hostnames

### Port Mapping

- **Nginx**: 80 (HTTP), 443 (HTTPS)
- **Frontend**: 3000 (internal)
- **Backend**: 5000 (internal)
- **MySQL**: 3306 (internal, optional external)

## Data Persistence

### Volumes

1. **mysql_data**: Database files
2. **backend_logs**: Application logs
3. **frontend_logs**: Application logs
4. **nginx_logs**: Access and error logs

### Log Persistence

- Logs stored in Docker volumes
- Survive container restarts
- Accessible via `docker-compose logs`
- Can be mounted to host for external log aggregation

## Security Architecture

### Application Security

1. **Authentication**: JWT tokens
2. **Authorization**: Role-based access control
3. **CSRF Protection**: Token-based validation
4. **Rate Limiting**: Express rate limiter
5. **Input Validation**: Middleware validation
6. **Security Headers**: Helmet.js

### Infrastructure Security

1. **Container Security**: Non-root users
2. **Network Security**: Isolated Docker network
3. **Secrets Management**: Environment variables
4. **SSH Access**: Key-based authentication
5. **Firewall**: EC2 security groups

## Deployment Architecture

### CI/CD Flow

```
GitHub Repository
    │
    ▼
GitLab Repository (mirror)
    │
    ▼
GitLab CI/CD Pipeline
    │
    ├──► Build Docker Images
    ├──► Run Tests
    └──► Deploy to EC2
            │
            ▼
        AWS EC2 Server
            │
            ├──► Docker Compose
            ├──► Nginx
            ├──► Frontend Container
            ├──► Backend Container
            └──► MySQL Container
```

### Deployment Strategy

- **Development**: Manual trigger on `develop` branch
- **Production**: Manual trigger on `main` branch
- **Zero-Downtime**: Rolling updates with health checks
- **Rollback**: Backup and restore mechanism

## Scalability Considerations

### Horizontal Scaling

- Frontend and backend can be scaled independently
- Nginx load balancer distributes traffic
- Stateless application design
- Database connection pooling

### Vertical Scaling

- EC2 instance size can be increased
- Container resource limits configurable
- Database can be upgraded

## Monitoring and Observability

### Health Checks

- Container health checks
- Application health endpoint
- Database connection checks

### Logging

- Structured logging with Winston
- Log aggregation via volumes
- Access logs in Nginx

### Metrics (Future)

- Application metrics
- Container metrics
- Database metrics

## Differences: Dev vs Prod

| Aspect | Development | Production |
|--------|------------|------------|
| **Dockerfile** | `Dockerfile.dev` | `Dockerfile.prod` |
| **Node Env** | `development` | `production` |
| **Dependencies** | All (dev + prod) | Production only |
| **Build** | No build step | Optimized build |
| **Hot Reload** | Enabled | Disabled |
| **Logging** | Verbose | Optimized |
| **Volumes** | Source code mounted | Data only |
| **Image Size** | Larger | Smaller |
| **Security** | Relaxed | Strict |

## Future Enhancements

1. **Kubernetes**: Migrate to K8s for better orchestration
2. **Monitoring**: Integrate Prometheus and Grafana
3. **Logging**: Centralized logging with ELK stack
4. **CDN**: Add CloudFront for static assets
5. **Database**: Consider managed RDS
6. **Caching**: Redis cluster for distributed caching
7. **SSL/TLS**: Automated certificate management

