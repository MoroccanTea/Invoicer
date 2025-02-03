# Invoicer - Professional Billing Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/MoroccanTea/invoicer)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)


## 📝 Overview

Invoicer is a comprehensive invoice management solution designed to streamline billing processes for businesses and freelancers. With robust features for client tracking, project management, and financial reporting, Invoicer simplifies your financial workflow.

![Invoicer Interface](https://via.placeholder.com/800x400.png?text=Invoice+Management+Dashboard)

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

## 📂 Project Structure

```
invoicer/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── models/        # Database schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middlewares/   # Request processing
│   │   └── config/        # Configuration management
│   └── tests/             # Backend unit & integration tests
│
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Global state management
│   │   ├── utils/         # Utility functions
│   │   └── views/         # Application screens
│   └── tests/             # Frontend component tests
│
└── docker-compose.yml     # Multi-container orchestration
```

## 🚀 Quick Start

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
  - Location: `backend/initial_admin_password.txt`

**Note**: Change the default password immediately after first login.

## 🔐 Security Best Practices

- Automatic password hashing
- JWT token rotation
- Role-based access control
- Input validation middleware
- Regular security audits

## 📡 API Endpoints

A detailed list of API endpoints for Invoicer is available below in `/api-docs`

### Authentication
| Method | Endpoint           | Description               |
|--------|--------------------| --------------------------|
| POST   | `/api/auth/login`  | User authentication      |
| POST   | `/api/auth/logout` | User logout              |

### Invoices
| Method | Endpoint             | Description               |
|--------|----------------------| --------------------------|
| GET    | `/api/invoices`      | List invoices            |
| POST   | `/api/invoices`      | Create invoice           |
| GET    | `/api/invoices/:id`  | Get invoice details      |

## 🔧 Configuration

Customize your application through environment variables in `.env` files.

**Backend Configuration**
```ini
MONGODB_URI=mongodb://mongo:27017/invoicer
JWT_SECRET=your_secure_secret
PORT=5000
```

**Frontend Configuration**
```ini
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_CURRENCY=USD
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

## 🆘 Support

- [Open an Issue](https://github.com/MoroccanTea/invoicer/issues)
- Email: essadhamza@outlook.fr
