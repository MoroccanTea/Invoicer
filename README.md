# Invoicer 💼

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)

A full-stack invoicing application with client/project management capabilities, featuring:
- **Multi-role authentication** (Admin/User)
- **CRUD operations** for clients, projects, and invoices
- **PDF invoice generation**
- **Responsive dashboard** with analytics
- **Dockerized** development/production setup

## Features ✨
- 🛡️ JWT-based authentication & authorization
- 📊 Dashboard with financial overview
- 📁 Client/project management system
- 🧾 Customizable invoice templates
- 📤 PDF export functionality
- ⚙️ Admin configuration panel
- 📱 Mobile-responsive UI

## Technologies 🛠️
**Backend**
- Node.js & Express
- MongoDB/Mongoose
- JSON Web Tokens (JWT)
- Docker
- Jest (Testing)
- Swagger (API Docs)

**Frontend**
- React.js
- Tailwind CSS
- React Router
- Context API
- Axios
- React PDF Renderer
- Chart.js

## Installation 📦
1. Clone repository:
```bash
git clone https://github.com/yourusername/invoicer.git
cd invoicer
```

2. Install dependencies:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

3. Configure environment:
```bash
# Backend .env
MONGODB_URI=mongodb://localhost:27017/invoicer
JWT_SECRET=your_jwt_secret
ADMIN_KEY=admin_secure_key

# Frontend .env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

4. Initialize database:
```bash
cd ../backend
npm run seed
```

## Running with Docker 🐳
```bash
docker-compose up --build
```

## API Reference 📚
| Endpoint         | Method | Description              |
|------------------|--------|--------------------------|
| /api/auth/*      | POST   | User authentication      |
| /api/users/*     | GET    | User management          |
| /api/clients/*   | CRUD   | Client operations        |
| /api/invoices/*  | CRUD   | Invoice management       |
| /api/projects/*  | CRUD   | Project tracking         |

Full API documentation available via Postman: [![Run in Postman](https://run.pstmn.io/button.svg)](https://your-postman-docs-link)

## Contributing 🤝
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License 📄
MIT License - see [LICENSE](LICENSE) for details

## Acknowledgements 🙏
- Icon set by [Heroicons](https://heroicons.com/)
- UI inspiration from [Tailwind Components](https://tailwindcomponents.com)
