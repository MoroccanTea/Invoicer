# Invoicer - Professional Billing Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete invoice management solution with client tracking, project management, and financial reporting capabilities.

![Invoicer Interface](https://via.placeholder.com/800x400.png?text=Invoice+Management+Dashboard)

## Key Features

- 📝 Create/edit invoices with automatic tax calculations
- 👥 Manage clients and projects with custom rates
- 🔒 Role-based access control (Admin/Standard Users)
- 📊 Generate financial reports and export to PDF
- 📦 Dockerized development/production environments
- 🔐 JWT authentication with refresh tokens
- 📱 Mobile-responsive user interface

## Technology Stack

**Backend Services**
- Node.js 18 + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Dockerized MongoDB instance
- REST API with rate limiting

**Frontend Interface**
- React 18 with Functional Components
- React Router 6 for navigation
- Tailwind CSS + PostCSS styling
- Context API for state management
- Axios for API communication
- React Hot Toast notifications

## Project Structure

```
invoicer/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── models/        # Database schemas (Invoice, User, Client, Project)
│   │   ├── routes/        # API endpoints (auth, invoices, clients, users)
│   │   ├── middlewares/   # Authentication and error handling
│   │   └── db/           # MongoDB connection setup
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Authentication context
│   │   ├── utils/         # API client configuration
│   │   └── views/         # Main application screens
└── docker-compose.yml      # Multi-container orchestration
```

## Getting Started

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/your-repository/invoicer.git
cd invoicer
```

2. Set up environment variables:
```bash
# Backend .env
cp backend/.env.example backend/.env

# Frontend .env
cp frontend/.env.example frontend/.env
```

3. Start development services:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017/invoicer

### Production Deployment
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## Core Functionality

**Invoice Management**
- Create invoices with multiple line items
- Automatic tax calculations (percentage-based)
- Multiple currency support
- PDF export functionality
- Invoice status tracking (Draft/Sent/Paid)

**User Management**
- Role-based access control (Admin/User)
- Password reset functionality
- User activity logging
- Session management

**Reporting**
- Monthly revenue reports
- Client billing history
- Outstanding payments tracking
- Tax summary reports

## API Documentation

### Authentication Endpoints

| Method | Endpoint       | Description                |
|--------|----------------|----------------------------|
| POST   | /api/auth/login     | User authentication        |
| POST   | /api/auth/register  | New user registration      |
| POST   | /api/auth/refresh   | Refresh access token       |

### Invoice Endpoints

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | /api/invoices        | List all invoices            |
| POST   | /api/invoices        | Create new invoice           |
| GET    | /api/invoices/:id    | Get invoice details          |
| PATCH  | /api/invoices/:id    | Update existing invoice      |
| DELETE | /api/invoices/:id    | Delete invoice               |
| GET    | /api/invoices/export | Export invoices to PDF       |

## Configuration

**Backend Environment Variables**
```ini
MONGODB_URI=mongodb://mongo:27017/invoicer
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1h
PORT=5000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

**Frontend Environment Variables**
```ini
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_DEFAULT_CURRENCY=USD
REACT_APP_PAGE_SIZE=10
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support or feature requests, please [open an issue](https://github.com/your-repository/invoicer/issues).
