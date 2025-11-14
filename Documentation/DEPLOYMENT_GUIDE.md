# Deployment and Configuration Guide

## Overview

This guide provides comprehensive instructions for deploying and configuring the Quizruption application in development and production environments.

## System Requirements

### Backend Requirements
- Python 3.8+
- 4GB RAM minimum (8GB recommended)
- 20GB disk space (for database, logs, and uploads)
- SQLite (development) or PostgreSQL (production)

### Frontend Requirements  
- Node.js 16+
- npm or yarn
- 2GB RAM minimum

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `quizruption/` directory:

```bash
# Database Configuration
DATABASE_URL=sqlite:///./quizruption.db  # Development
# DATABASE_URL=postgresql://user:password@localhost/quizruption  # Production

# Security
SECRET_KEY=your-super-secure-secret-key-here
ALGORITHM=HS256

# File Upload Settings
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=uploads/
ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.gif,.webp

# Logging
LOG_LEVEL=INFO
LOG_FILE=app.log
LOG_MAX_BYTES=10485760  # 10MB
LOG_BACKUP_COUNT=5

# CORS Settings (Production)
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Development Settings
DEBUG=true  # Set to false in production
```

### Frontend Environment Variables

Create a `.env` file in the `quizruption-frontend/` directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api

# Logging Configuration
REACT_APP_LOG_LEVEL=info
REACT_APP_REMOTE_LOGGING=false  # Set to true for production monitoring

# Feature Flags
REACT_APP_ENABLE_ADMIN=true
REACT_APP_ENABLE_LOGGING_DASHBOARD=true

# Production Settings
REACT_APP_ENVIRONMENT=development  # development, staging, production
```

## Development Deployment

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tclark2-rocketsoftware/Ctrl_Alt_Delinquents.git
   cd Ctrl_Alt_Delinquents
   ```

2. **Start the complete application:**
   ```bash
   # Windows
   .\run-quizruption.bat
   
   # Linux/Mac
   chmod +x run-quizruption.sh
   ./run-quizruption.sh
   ```

### Manual Development Setup

#### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd quizruption
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database:**
   ```bash
   python database/init_db.py
   ```

5. **Start development server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd quizruption-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Production Deployment

### Docker Deployment (Recommended)

#### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quizruption
      POSTGRES_USER: quizuser
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./quizruption
    environment:
      DATABASE_URL: postgresql://quizuser:secure_password@postgres/quizruption
      SECRET_KEY: ${SECRET_KEY}
      DEBUG: false
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build: ./quizruption-frontend
    environment:
      REACT_APP_API_URL: https://api.yourdomain.com
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Manual Production Setup

#### Backend Production Setup

1. **Server preparation:**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install python3 python3-pip python3-venv nginx postgresql
   
   # CentOS/RHEL
   sudo yum install python3 python3-pip nginx postgresql-server
   ```

2. **Create application user:**
   ```bash
   sudo useradd -r -s /bin/false quizapp
   sudo mkdir -p /opt/quizruption
   sudo chown quizapp:quizapp /opt/quizruption
   ```

3. **Deploy application:**
   ```bash
   cd /opt/quizruption
   git clone https://github.com/tclark2-rocketsoftware/Ctrl_Alt_Delinquents.git .
   python3 -m venv venv
   source venv/bin/activate
   pip install -r quizruption/requirements.txt
   ```

4. **Configure systemd service:**

   Create `/etc/systemd/system/quizruption.service`:

   ```ini
   [Unit]
   Description=Quizruption FastAPI application
   After=network.target

   [Service]
   User=quizapp
   Group=quizapp
   WorkingDirectory=/opt/quizruption/quizruption
   Environment=PATH=/opt/quizruption/venv/bin
   EnvironmentFile=/opt/quizruption/.env
   ExecStart=/opt/quizruption/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

5. **Start services:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable quizruption
   sudo systemctl start quizruption
   ```

#### Nginx Configuration

Create `/etc/nginx/sites-available/quizruption`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /opt/quizruption-frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /opt/quizruption/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Documentation
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/quizruption /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Database Migration

### SQLite to PostgreSQL Migration

1. **Export SQLite data:**
   ```bash
   sqlite3 quizruption.db .dump > backup.sql
   ```

2. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE quizruption;
   CREATE USER quizuser WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE quizruption TO quizuser;
   ```

3. **Update connection string:**
   ```bash
   DATABASE_URL=postgresql://quizuser:secure_password@localhost/quizruption
   ```

4. **Initialize PostgreSQL schema:**
   ```bash
   python database/init_db.py
   ```

## SSL/TLS Configuration

### Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 2 * * * certbot renew --quiet
```

### Updated Nginx with SSL

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # ... rest of configuration
}
```

## Monitoring and Maintenance

### Log Monitoring

#### Centralized Logging (Optional)

```bash
# Install rsyslog for centralized logging
sudo apt install rsyslog

# Configure log forwarding
echo "*.* @logserver:514" >> /etc/rsyslog.conf
sudo systemctl restart rsyslog
```

#### Log Rotation

Create `/etc/logrotate.d/quizruption`:

```
/opt/quizruption/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 quizapp quizapp
    postrotate
        systemctl reload quizruption
    endscript
}
```

### Health Monitoring

#### Backend Health Check

Create a health endpoint in your FastAPI app:

```python
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
```

#### Monitoring Script

```bash
#!/bin/bash
# /opt/scripts/health-check.sh

# Check backend health
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ $response -ne 200 ]; then
    echo "Backend unhealthy, restarting..."
    systemctl restart quizruption
fi

# Check disk space
usage=$(df /opt/quizruption | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $usage -gt 80 ]; then
    echo "Disk usage high: ${usage}%"
    # Send alert
fi
```

Add to crontab:
```bash
*/5 * * * * /opt/scripts/health-check.sh
```

## Backup and Recovery

### Database Backup

#### PostgreSQL Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup-db.sh

BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="quizruption_backup_${TIMESTAMP}.sql"

pg_dump -h localhost -U quizuser quizruption > "${BACKUP_DIR}/${FILENAME}"
gzip "${BACKUP_DIR}/${FILENAME}"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

#### File System Backup

```bash
#!/bin/bash
# /opt/scripts/backup-files.sh

BACKUP_DIR="/opt/backups/files"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup uploads
tar -czf "${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz" /opt/quizruption/uploads/

# Backup configuration
tar -czf "${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz" /opt/quizruption/.env /etc/nginx/sites-available/quizruption
```

### Automated Backups

Add to crontab:
```bash
0 2 * * * /opt/scripts/backup-db.sh
0 3 * * * /opt/scripts/backup-files.sh
```

## Security Hardening

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Block direct access to backend
sudo ufw deny 8000/tcp
```

### Application Security

1. **Change default secrets:**
   - Generate strong SECRET_KEY
   - Use environment variables for sensitive config

2. **File upload security:**
   - Validate file types and sizes
   - Store uploads outside web root
   - Scan uploads for malware (if possible)

3. **Rate limiting:**
   - Implement rate limiting for login endpoints
   - Use fail2ban for brute force protection

4. **Regular updates:**
   - Keep Python packages updated
   - Monitor security advisories
   - Regular security scans

## Performance Optimization

### Backend Optimization

1. **Database optimization:**
   - Add proper indexes
   - Use connection pooling
   - Optimize query patterns

2. **Caching:**
   - Implement Redis for session storage
   - Cache frequently accessed data

3. **Static file serving:**
   - Use CDN for static assets
   - Enable gzip compression

### Frontend Optimization

1. **Build optimization:**
   ```bash
   npm run build
   # Serves optimized, minified bundles
   ```

2. **CDN integration:**
   - Host static assets on CDN
   - Use cache headers appropriately

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check logs
sudo journalctl -u quizruption -f

# Check port conflicts
sudo netstat -tlnp | grep :8000

# Verify permissions
sudo -u quizapp ls -la /opt/quizruption/
```

#### Database Connection Issues
```bash
# Test database connectivity
psql -h localhost -U quizuser -d quizruption

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### High Memory Usage
```bash
# Monitor resource usage
htop

# Check application logs for memory leaks
grep -i "memory\|oom" /var/log/syslog
```

This deployment guide provides a comprehensive foundation for running Quizruption in production with proper security, monitoring, and maintenance practices.