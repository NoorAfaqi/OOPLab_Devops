# Backend Deployment Guide

This guide covers deploying the OOP Lab Backend API to production environments.

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your production values
nano .env
```

### 2. Database Setup

```bash
# Run database migration
npm run migrate

# Seed initial data (optional)
npm run seed
```

### 3. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_NAME=ooplab
      - DB_USER=root
      - DB_PASSWORD=password
    depends_on:
      - mysql
    volumes:
      - ./logs:/app/logs

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=ooplab
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## ☁️ Cloud Deployment

### AWS EC2

1. **Launch EC2 Instance**:
   - Choose Ubuntu 20.04 LTS
   - Select t3.medium or larger
   - Configure security groups for ports 22, 80, 443, 3000

2. **Install Dependencies**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server -y
   
   # Install PM2
   sudo npm install -g pm2
   ```

3. **Deploy Application**:
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd ooplab-backend-express
   
   # Install dependencies
   npm install
   
   # Configure environment
   cp .env.example .env
   nano .env
   
   # Setup database
   npm run migrate
   
   # Start with PM2
   pm2 start src/server.js --name "ooplab-backend"
   pm2 save
   pm2 startup
   ```

### DigitalOcean App Platform

1. **Create App**:
   - Connect your GitHub repository
   - Select Node.js as runtime
   - Configure build command: `npm install`
   - Configure run command: `npm start`

2. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=8080
   DB_HOST=your-mysql-host
   DB_NAME=your-database
   DB_USER=your-username
   DB_PASSWORD=your-password
   JWT_SECRET=your-jwt-secret
   ```

3. **Database**:
   - Create managed MySQL database
   - Update environment variables
   - Run migration after deployment

### Heroku

1. **Prepare for Heroku**:
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   
   # Create app
   heroku create ooplab-backend-api
   ```

2. **Configure Environment**:
   ```bash
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set DB_HOST=your-mysql-host
   # ... other variables
   ```

3. **Deploy**:
   ```bash
   # Deploy to Heroku
   git push heroku main
   
   # Run migration
   heroku run npm run migrate
   ```

## 🔧 Production Configuration

### Environment Variables

```env
# Production Environment
NODE_ENV=production
PORT=3000

# Database (Production)
DB_HOST=your-production-mysql-host
DB_NAME=your-production-database
DB_USER=your-production-username
DB_PASSWORD=your-production-password
DB_PORT=3306

# Security
JWT_SECRET=your-super-secure-jwt-secret-key
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-api-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-api-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ooplab-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **PM2 Monitoring**:
   ```bash
   # Monitor processes
   pm2 monit
   
   # View logs
   pm2 logs ooplab-backend
   
   # Restart application
   pm2 restart ooplab-backend
   ```

2. **Health Checks**:
   ```bash
   # Check API health
   curl http://localhost:3000/api/v1/health
   
   # Check database connection
   curl http://localhost:3000/api/v1/health | jq '.database'
   ```

### Log Management

1. **Log Rotation**:
   ```bash
   # Install logrotate
   sudo apt install logrotate
   
   # Configure log rotation
   sudo nano /etc/logrotate.d/ooplab-backend
   ```

2. **Log Monitoring**:
   ```bash
   # Monitor error logs
   tail -f logs/error.log
   
   # Monitor all logs
   tail -f logs/combined.log
   ```

## 🔒 Security Considerations

### SSL/TLS
- Use Let's Encrypt for free SSL certificates
- Configure HTTPS redirects
- Use strong cipher suites

### Database Security
- Use strong passwords
- Enable SSL for database connections
- Restrict database access by IP
- Regular security updates

### Application Security
- Keep dependencies updated
- Use environment variables for secrets
- Implement proper input validation
- Regular security audits

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   ```bash
   # Check database status
   sudo systemctl status mysql
   
   # Test connection
   mysql -h your-host -u your-user -p
   ```

2. **Port Already in Use**:
   ```bash
   # Find process using port
   sudo lsof -i :3000
   
   # Kill process
   sudo kill -9 <PID>
   ```

3. **Memory Issues**:
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Restart if needed
   pm2 restart ooplab-backend
   ```

### Performance Optimization

1. **Database Optimization**:
   - Add proper indexes
   - Optimize queries
   - Use connection pooling

2. **Application Optimization**:
   - Enable compression
   - Use caching
   - Optimize images and assets

## 📈 Scaling

### Horizontal Scaling
- Use load balancers (Nginx, HAProxy)
- Deploy multiple instances
- Use PM2 cluster mode

### Vertical Scaling
- Increase server resources
- Optimize database performance
- Use CDN for static assets

## 🔄 Backup Strategy

### Database Backup
```bash
# Create backup
mysqldump -h your-host -u your-user -p your-database > backup.sql

# Restore backup
mysql -h your-host -u your-user -p your-database < backup.sql
```

### Application Backup
```bash
# Backup application files
tar -czf ooplab-backend-$(date +%Y%m%d).tar.gz /path/to/application

# Backup logs
tar -czf logs-$(date +%Y%m%d).tar.gz logs/
```

This deployment guide provides comprehensive instructions for deploying your scalable backend API to various environments. Choose the deployment method that best fits your infrastructure and requirements.
