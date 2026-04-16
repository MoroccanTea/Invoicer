# Invoicer - Professional Billing Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/MoroccanTea/invoicer)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)
![GitHub issues](https://img.shields.io/github/issues/MoroccanTea/invoicer)
## 📝 Overview

![Invoicer Dashbaord](./dashboard.png)

Invoicer is a comprehensive invoice management solution designed to streamline billing processes for businesses and freelancers mainly in Morocco. With robust features for client tracking, project management, and financial reporting, Invoicer simplifies your financial workflow.

## ✨ Key Features

- 📝 **Intelligent Invoice Creation** - Automatic tax calculations, multiple line items, customizable templates
- 👥 **Client & Project Management** - Detailed profiles, project-based tracking, billing history
- 🔒 **Advanced Security** - Role-based access, JWT authentication, secure token management
- 📊 **Powerful Reporting** - Financial reports, PDF export, revenue summaries
- 🚀 **Modern Tech Stack** - Dockerized deployment, scalable architecture, mobile-responsive

## 🛠 Technology Stack

**Application**: NextJs 16.1.4, MongoDB, Redis
**Deployment**: Docker, Docker Compose, Nginx

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/) (version 28+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.40+)
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

**For Development:** [From the root directory]
```bash
# Start with development configuration
docker compose -f docker-compose.dev.yml up --build

# Or use the convenience script
npm run dev
```

**For Production:**
```bash
# Start with production configuration
docker compose up --build -d

# Or use the convenience script
npm start
```

### 5. Access the Application

- **Application**: http://localhost (port 80) or http://localhost:3000 (development)
- **API Documentation**: http://localhost/api-docs

### 6. First-Time Login

When you first start the application, an admin user will be automatically created:

- **Email**: `admin@invoicer.com`
- **Password**: Check the backend logs for the generated password.

```bash
# View the generated admin password
docker logs invoicer
```

**🔐 CRITICAL**: Change the admin password immediately after first login - you will be prompted to do so.

## ⚙️ Environment Configuration

### Root Directory (.env)
```ini
# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=invoicer_admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_mongo_password_here
MONGODB_URI=mongodb://invoicer_admin:your_secure_mongo_password_here@mongodb:27017/invoicer?authSource=admin

# JWT Secrets (generate with: openssl rand -hex 32)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Environment
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://redis:6379
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
- Uses `docker-compose.yml`
- Application runs on port 3000 with hot reload
- MongoDB and Redis exposed for debugging

**Production Mode:**
- Uses `docker-compose.prod.yml`
- Frontend served by Nginx on port 80
- Optimized build
- Services not exposed externally except web interface

## 🏗️ Project Structure

```
Invoicer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts    # NextAuth handler
│   │   │   ├── auth/change-password/route.ts  # Password change
│   │   │   ├── clients/[id]/route.ts          # Client CRUD
│   │   │   ├── configuration/route.ts         # Config API
│   │   │   ├── invoices/[id]/route.ts         # Invoice CRUD
│   │   │   ├── profile/route.ts               # Profile API
│   │   │   ├── projects/[id]/route.ts         # Project CRUD
│   │   │   ├── users/[id]/route.ts            # User CRUD
│   │   │   └── init/route.ts                  # Admin initialization
│   │   ├── dashboard/
│   │   │   ├── clients/                       # Client management
│   │   │   ├── configuration/                 # Morocco/Generic config
│   │   │   ├── invoices/[id]/                 # Invoice preview
│   │   │   ├── profile/                       # User profile
│   │   │   ├── projects/                      # Project management
│   │   │   └── users/                         # User management
│   │   ├── login/page.tsx                     # Login page
│   │   ├── change-password/page.tsx           # Password change
│   │   └── globals.css                        # Tailwind styles
│   ├── components/
│   │   ├── layout/                            # Sidebar, Header, Layout
│   │   └── providers/                         # Session, Theme providers
│   └── lib/
│       ├── auth/                              # Auth utilities
│       ├── db/                                # MongoDB, Redis connections
│       └── models/                            # Mongoose models
├── Docker files                               # Dockerfile, docker-compose
├── nginx.conf                                 # Nginx config
└── Configuration files                        # package.json, tailwind, etc.

```

### Health Checks

```bash
# Check all service status
docker-compose ps

# Check individual service logs
docker logs invoicer
docker logs invoicer_mongodb
docker logs invoicer_redis

# Test app health
curl http://localhost/api/status
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
- Development: http://localhost:3000/api-docs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Development Setup
```bash
git clone https://github.com/MoroccanTea/invoicer.git
cd invoicer
npm install
# Make sure docker is started
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/MoroccanTea/invoicer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MoroccanTea/invoicer/discussions)
- **Email**: hamza@essad.ma

## 🚀 Roadmap

### Crucial Features
- [x] Authentication with JWT
- [ ] Invoice generation and management
- [ ] Custom template upload [XLSX, DOCX]
- [x] Client management
- [ ] Tax calculations [VAT]
- [ ] PDF export of invoices
- [x] Fine-grained Administrative Role-Based Access Control [FARBAC]
- [ ] Email notifications and reminders
- [x] Multi-language support [Arabic, English, French, Spanish]
- [ ] Two-factor authentication (2FA)
- [x] Advanced reporting dashboard
- [ ] Rate limiting
- [x] Dark mode
- [ ] Swagger API documentation

### Optional Features
- [ ] Client portal
- [ ] Payment gateway integration
- [ ] Mobile application

---

**Made with ❤️ for freelancers and small businesses**