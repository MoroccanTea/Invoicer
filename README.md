# Invoicer - Professional Billing Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/MoroccanTea/invoicer)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)

## 📝 Overview

![Invoicer Dashbaord](./dashboard.png)

Invoicer is a comprehensive invoice management solution designed to streamline billing processes for businesses and freelancers. With robust features for client tracking, project management, and financial reporting, Invoicer simplifies your financial workflow.

## ✨ Key Features

- 📝 **Intelligent Invoice Creation** - Automatic tax calculations, multiple line items, customizable templates
- 👥 **Client & Project Management** - Detailed profiles, project-based tracking, billing history
- 🔒 **Advanced Security** - Role-based access, JWT authentication, secure token management
- 📊 **Powerful Reporting** - Financial reports, PDF export, revenue summaries
- 🚀 **Modern Tech Stack** - Dockerized deployment, scalable architecture, mobile-responsive

## 🛠 Technology Stack

**Backend**: Node.js 18, Express.js, MongoDB, JWT Authentication, Redis
**Frontend**: React 18, React Router 6, Tailwind CSS, Context API
**Deployment**: Docker, Docker Compose, Nginx

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Git](https://git-scm.com/downloads)

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/MoroccanTea/invoicer.git
cd invoicer
```

### 2. Set Up Environment Variables

**⚠️ SECURITY IMPORTANT**: Never use default passwords in production!

Create the main environment file in the root directory:
```bash
# Copy and edit the main environment file
cp .env.example .env
```

Create backend environment file:
```bash
# Copy and edit backend environment
cp backend/.env.example backend/.env
```

Create frontend environment file (if needed):
```bash
# Copy frontend environment (optional)
cp frontend/.env.example frontend/.env
```

### 3. Configure Your Environment

Edit the `.env` file in the root directory with your settings:
```bash
# Generate secure passwords/secrets for production!
nano .env
```

**Required Configuration**:
- Change `MONGO_INITDB_ROOT_PASSWORD` to a strong password
- Generate secure `JWT_SECRET` and `JWT_REFRESH_SECRET` (use `openssl rand -hex 32`)
- Set appropriate `NODE_ENV` (development/production)

### 4. Start the Application

**For Development:**
```bash
# Start with development configuration
docker-compose -f docker-compose.dev.yml up --build

# Or use the convenience script
npm run dev
```

**For Production:**
```bash
# Start with production configuration
docker-compose up --build -d

# Or use the convenience script
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost (port 80) or http://localhost:3000 (development)
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

### 6. First-Time Login

When you first start the application, an admin user will be automatically created:

- **Email**: `admin@invoicer.com`
- **Password**: Check the backend logs for the generated password

```bash
# View the generated admin password
docker logs invoicer_backend
```

**🔐 CRITICAL**: Change the admin password immediately after first login!

## ⚙️ Environment Configuration

### Root Directory (.env)
```ini
# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=invoicer_admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_mongo_password_here

# JWT Secrets (generate with: openssl rand -hex 32)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Environment
NODE_ENV=development
```

### Backend Configuration (backend/.env)
```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (must match root .env)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Database (auto-constructed if not provided)
# MONGODB_URI=mongodb://invoicer_admin:your_password@mongodb:27017/invoicer?authSource=admin

# Redis Configuration
REDIS_URL=redis://redis:6379

# MongoDB Credentials (for auto-construction)
MONGO_ROOT_USER=invoicer_admin
MONGO_ROOT_PASSWORD=your_secure_mongo_password_here
```

## 🔧 Development Workflow

### Available Scripts

```bash
# Install dependencies and setup
npm install

# Start development environment
npm run dev

# Start production environment
npm start

# View logs
npm run logs

# Stop all services
npm stop

# Clean up (remove containers and volumes)
npm run clean

# Run tests
npm test
```

### Development vs Production

**Development Mode:**
- Uses `docker-compose.dev.yml`
- Frontend runs on port 3000 with hot reload
- Backend runs on port 5000 with nodemon
- MongoDB and Redis exposed for debugging

**Production Mode:**
- Uses `docker-compose.yml`
- Frontend served by Nginx on port 80
- Backend optimized build
- Services not exposed externally except web interface

## 🏗️ Project Structure

```
invoicer/
├── backend/                 # Node.js/Express API
│   ├── src/                # Source code
│   ├── tests/              # Backend tests
│   ├── Dockerfile          # Backend container config
│   └── package.json        # Backend dependencies
├── frontend/               # React application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── Dockerfile         # Frontend container config
│   └── package.json       # Frontend dependencies
├── docker-compose.yml     # Production configuration
├── docker-compose.dev.yml # Development configuration
├── .env.example          # Environment template
└── package.json          # Root scripts and dev tools
```

## 🔍 Troubleshooting

### Common Issues

**"Permission denied" errors:**
```bash
# Fix Docker permissions on Linux
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
```

**Port already in use:**
```bash
# Check what's using the ports
sudo lsof -i :80   # Frontend
sudo lsof -i :5000 # Backend
sudo lsof -i :27017 # MongoDB

# Stop conflicting services or change ports in .env
```

**Database connection issues:**
```bash
# Check MongoDB container
docker logs invoicer_mongodb

# Restart with fresh database
docker-compose down -v
docker-compose up --build
```

**"Admin password not found":**
```bash
# Check backend logs for generated password
docker logs invoicer_backend | grep "Password:"

# If needed, reset by removing database volume
docker-compose down -v
docker-compose up --build
```

### Health Checks

```bash
# Check all service status
docker-compose ps

# Check individual service logs
docker logs invoicer_frontend
docker logs invoicer_backend
docker logs invoicer_mongodb
docker logs invoicer_redis

# Test API health
curl http://localhost:5000/status
```

## 🔐 Security Best Practices

- **Never use default passwords in production**
- **Generate strong JWT secrets** using `openssl rand -hex 32`
- **Change admin password** immediately after setup
- **Use HTTPS** in production (configure reverse proxy)
- **Regular backups** of MongoDB data
- **Keep dependencies updated** with `npm audit`
- **Monitor logs** for suspicious activity

## 📊 API Documentation

Interactive API documentation is available at `/api-docs` when the backend is running:
- Development: http://localhost:5000/api-docs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Development Setup
```bash
git clone https://github.com/MoroccanTea/invoicer.git
cd invoicer
npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/MoroccanTea/invoicer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MoroccanTea/invoicer/discussions)
- **Email**: hamza@essad.ma

## 🚀 Roadmap

- [ ] Email notifications and reminders
- [ ] Multi-language support (i18n)
- [ ] Two-factor authentication (2FA)
- [ ] Payment gateway integration
- [ ] Mobile application
- [ ] Advanced reporting dashboard
- [ ] Client portal
- [ ] API rate limiting enhancements
- [ ] Automated testing pipeline

---

**Made with ❤️ for freelancers and small businesses**