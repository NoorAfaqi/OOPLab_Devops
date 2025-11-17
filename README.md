# OOPLab DevOps Project

A full-stack web application with complete CI/CD pipeline implementation using GitLab CI/CD, Docker, and AWS EC2 deployment.

## 🚀 Project Overview

This project demonstrates a production-ready DevOps setup with:
- **Microservices Architecture**: Separate frontend and backend services
- **Containerization**: Docker and Docker Compose for orchestration
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Zero-Downtime Deployment**: Rolling updates with health checks
- **Load Balancing**: Nginx reverse proxy and load balancer
- **Log Persistence**: Persistent logging across container restarts

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Requirements Checklist](#requirements-checklist)

## 🛠 Technology Stack

### Backend
- Node.js 18 LTS
- Express.js
- MySQL 8.0
- Sequelize ORM
- JWT Authentication
- Redis (optional)

### Frontend
- Next.js 15
- TypeScript
- Material-UI (MUI)
- Tailwind CSS

### Infrastructure
- Docker & Docker Compose
- Nginx (Reverse Proxy & Load Balancer)
- GitLab CI/CD
- AWS EC2

## 📁 Project Structure

```
OOPLab_Devops/
├── backend/              # Backend API service
│   ├── src/             # Source code
│   ├── tests/           # Unit tests
│   ├── Dockerfile        # Production Dockerfile
│   └── Dockerfile.dev   # Development Dockerfile
├── frontend/            # Frontend Next.js app
│   ├── src/             # Source code
│   ├── tests/           # Unit tests
│   ├── Dockerfile.prod  # Production Dockerfile
│   └── Dockerfile.dev   # Development Dockerfile
├── nginx/               # Nginx configuration
├── scripts/             # Deployment scripts
├── docs/                # Documentation
├── docker-compose.yml   # Production compose
├── docker-compose.dev.yml # Development compose
└── .gitlab-ci.yml      # CI/CD pipeline
```

## 🚦 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- Git

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd OOPLab_Devops
   ```

2. **Set up environment variables**:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

3. **Start development environment**:
   ```bash
   ENV=dev docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

### Production Setup

1. **Build and start production containers**:
   ```bash
   ENV=prod docker-compose up -d --build
   ```

2. **Check container status**:
   ```bash
   docker-compose ps
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

## 🔄 CI/CD Pipeline

The project includes a complete GitLab CI/CD pipeline with the following stages:

1. **Validate**: Code quality and configuration validation
2. **Build**: Docker image building and registry push
3. **Test**: Unit test execution with JUnit XML reporting
4. **Deploy-Dev**: Deployment to development environment
5. **Deploy-Prod**: Deployment to production (AWS EC2)

### Pipeline Features

- ✅ Automated testing on every commit
- ✅ Docker image building and registry push
- ✅ Zero-downtime deployment
- ✅ Health checks before deployment completion
- ✅ Automatic rollback on failure
- ✅ Test result reporting (JUnit XML)

### Pipeline Diagram

See [docs/CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md) for detailed pipeline documentation and diagrams.

## 🚢 Deployment

### AWS EC2 Deployment

The project is configured for deployment to AWS EC2 servers via GitLab CI/CD.

#### Prerequisites

1. AWS EC2 instance running Ubuntu/Debian
2. Docker installed on EC2
3. GitLab CI/CD variables configured
4. SSH access to EC2

#### Configuration

1. **Set GitLab CI/CD Variables**:
   - `PROD_SERVER_HOST`: EC2 instance IP/hostname
   - `PROD_SERVER_USER`: SSH username (usually `ec2-user` or `ubuntu`)
   - `PROD_DEPLOY_PATH`: Deployment path (e.g., `/opt/ooplab`)
   - `SSH_PRIVATE_KEY`: SSH private key for EC2

2. **Deploy via Pipeline**:
   - Push to `main` branch
   - Go to GitLab CI/CD > Pipelines
   - Manually trigger `deploy:prod` job

See [docs/CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md) for detailed deployment instructions.

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System architecture and design
- **[CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md)**: CI/CD pipeline details
- **[GITLAB_RUNNER_SETUP.md](docs/GITLAB_RUNNER_SETUP.md)**: GitLab runner installation guide

## ✅ Requirements Checklist

### Mandatory Requirements

- ✅ **CI/CD Pipeline Design**: Complete pipeline with validate, build, test, deploy stages
- ✅ **Dockerization**: Separate Dockerfiles for dev and prod environments
- ✅ **Automated Deployment**: Zero-downtime deployment to AWS EC2
- ✅ **Unit Tests Integration**: Tests run in pipeline with JUnit XML output
- ✅ **GitLab Runners**: Configuration and setup documentation
- ✅ **Documentation**: Architecture, pipeline, and runner setup docs

### Deliverables

- ✅ **Dockerfiles**: 
  - `backend/Dockerfile.dev` - Development
  - `backend/Dockerfile.prod` - Production
  - `frontend/Dockerfile.dev` - Development
  - `frontend/Dockerfile.prod` - Production

- ✅ **Docker Compose**:
  - `docker-compose.yml` - Unified production compose
  - `docker-compose.dev.yml` - Development compose

- ✅ **GitLab CI/CD**:
  - `.gitlab-ci.yml` - Complete pipeline configuration

- ✅ **Documentation**:
  - Architecture documentation
  - Pipeline documentation with diagrams
  - GitLab runner setup guide
  - Technology rationale

### Optional Features

- ✅ **Log Persistence**: Docker volumes for log persistence
- ✅ **Load Balancer**: Nginx load balancer configuration
- ✅ **Monitoring**: Health checks and monitoring endpoints

## 🔐 Security

- Environment variables for sensitive data
- SSH key-based authentication
- Container security (non-root users)
- CSRF protection
- Rate limiting
- Security headers

## 🧪 Testing

### Run Tests Locally

```bash
# Backend tests
cd backend
npm run test:unit

# Frontend tests
cd frontend
npm run test:unit
```

### Tests in CI/CD

Tests automatically run in the GitLab CI/CD pipeline on every commit and merge request.

## 📊 Monitoring

### Health Checks

- **Backend**: `http://localhost:5000/api/health`
- **Frontend**: `http://localhost:3000/`
- **Nginx**: `http://localhost/health`

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Submit a merge request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👥 Authors

- Muhammad Noor Afaqi - noorafaqi363@gmail.com

## 🔗 Links

- **Homepage**: https://ooplab.org
- **Repository**: https://github.com/OOPLab-NEXT
- **Issues**: https://github.com/OOPLab-NEXT/issues

## 📞 Support

For support, email noorafaqi363@gmail.com or create an issue in the repository.
