# Invoicer - Professional Billing Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/MoroccanTea/invoicer)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)


## 📝 Overview

Invoicer is a comprehensive invoice management solution designed to streamline billing processes for businesses and freelancers. With robust features for client tracking, project management, and financial reporting, Invoicer simplifies your financial workflow.

![Invoicer Interface](./dashboard.png)

## ✨ Key Features

- 📝 **Intelligent Invoice Creation**
  - Automatic tax calculations
  - Multiple line item support
  - Customizable invoice templates

- 👥 **Client & Project Management**
  - Detailed client profiles
  - Project-based rate tracking
  - Comprehensive billing history

- 🔒 **Advanced Security**
  - Role-based access control
  - JWT authentication
  - Secure token management

- 📊 **Powerful Reporting**
  - Detailed financial reports
  - PDF export functionality
  - Revenue and tax summaries

- 🚀 **Modern Tech Stack**
  - Dockerized deployment
  - Scalable microservices architecture
  - Mobile-responsive design

## 🛠 Technology Stack

### Backend
- **Language**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **API**: RESTful, with rate limiting

### Frontend
- **Library**: React 18 (Functional Components)
- **Routing**: React Router 6
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **HTTP Client**: Axios

## ✔ Quick Start

### Prerequisites
- Docker
- Docker Compose
- Git

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/MoroccanTea/invoicer.git
cd invoicer
```

2. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start development environment
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### First-Time Launch
- **Default Admin**
  - Email: admin@invoicer.com
  - Initial password: Generated securely
  - Location: `docker logs invoicer_backend`

**Note**: Change the default password immediately after first login.

## 🔐 Security Best Practices

- Automatic password hashing
- JWT token rotation
- Role-based access control
- Input validation middleware
- Regular security audits

## 📡 API Endpoints

A detailed list of API endpoints for Invoicer is available in `/api-docs`.

## 🔧 Configuration

Customize your application through environment variables in `.env` files.

**Backend Configuration** (backend directory)
```ini
# JWT Configuration
JWT_SECRET=secure_secret
JWT_REFRESH_SECRET=secure_refresh_secret

# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (Docker)
MONGODB_URI=mongodb://invoicer_admin:secure_password@mongodb:27017/invoicer?authSource=admin
MONGO_ROOT_USER=invoicer_admin
MONGO_ROOT_PASSWORD=secure_password

# Redis Configuration (Docker)
REDIS_URL=redis://redis:6379
```

**Project Configuration** (root directory)
```ini
# MongoDB
MONGO_INITDB_ROOT_USERNAME=invoicer_admin
MONGO_INITDB_ROOT_PASSWORD=secure_password

# JWT
JWT_SECRET=secure_secret
JWT_REFRESH_SECRET=secure_refresh_secret
```

## 🚀 Upcoming Features

- **Email verification**: Secure user registration
- **Email Notifications**: Automated invoice reminders
- **Multi-Language Support**: Internationalization (i18n)
- **Multi factor Authentication**: 2FA for enhanced security
- **Invoice Templates**: Customizable designs
- **Client Portal**: Secure client access
- **Payment Gateway Integration**: Stripe, PayPal
- **Mobile App**: iOS, Android
- **CI/CD Pipeline**: Automated testing & deployment

## 🤝 Contributing

We welcome contributions! Please see [Contribution rules](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

## 🆘 Support

- [Open an Issue](https://github.com/MoroccanTea/invoicer/issues)
- Email: essadhamza@outlook.fr
