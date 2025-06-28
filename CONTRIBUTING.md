# Contributing to Invoicer 🤝

## 🌟 Welcome Contributors!

We're thrilled that you're interested in contributing to Invoicer! This document provides guidelines to help you get started and contribute effectively.

## 📜 Code of Conduct

Our community is built on respect, inclusivity, and collaboration. We expect all contributors to:

- Be respectful and considerate in all interactions
- Use inclusive language and be welcoming to newcomers
- Be patient and supportive when helping others
- Focus on constructive dialogue and feedback
- Respect diverse perspectives and experiences

## 🚀 Quick Start for Contributors

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Git](https://git-scm.com/downloads)
- [Node.js 18+](https://nodejs.org/) (for local development)

### Setup Development Environment

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/invoicer.git
cd invoicer

# 2. Set up environment files
npm run setup:env

# 3. Edit environment files with your settings
nano .env
nano backend/.env

# 4. Start development environment
npm run dev

# 5. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

## 🛠 Development Workflow

### Available Scripts

```bash
# Environment setup
npm run setup:env          # Create environment files from templates
npm install                # Install all dependencies

# Development
npm run dev                # Start development environment
npm run dev:detached       # Start in background
npm run dev:down           # Stop development environment

# Production testing
npm start                  # Start production environment
npm stop                   # Stop production environment

# Logs and monitoring
npm run logs               # View all logs
npm run logs:backend       # View backend logs only
npm run logs:frontend      # View frontend logs only
npm run health             # Check application health

# Testing
npm test                   # Run all tests
npm run test:backend       # Run backend tests
npm run test:frontend      # Run frontend tests

# Cleanup
npm run clean              # Clean up containers and volumes
npm run reset              # Clean and restart
```

### Branch Strategy

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or create a bugfix branch
git checkout -b fix/issue-description

# Keep your branch updated
git pull origin main
git rebase main
```

## 📁 Project Structure

```
invoicer/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middleware
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   └── Dockerfile          # Production container
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── docker-compose.yml      # Production config
├── docker-compose.dev.yml  # Development config
└── .env.example           # Environment template
```

## 🎯 Contribution Guidelines

### Code Style

**Backend (Node.js/Express):**
- Use async/await for asynchronous operations
- Implement proper error handling with try/catch
- Follow RESTful API conventions
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Validate input data using Joi schemas

**Frontend (React):**
- Use functional components with hooks
- Implement proper prop validation
- Keep components small and focused
- Use Tailwind CSS for styling
- Follow naming conventions (PascalCase for components)
- Handle loading and error states

**General Guidelines:**
- Write clear, self-documenting code
- Use meaningful commit messages
- Keep functions small and focused
- Add comments for complex logic
- Follow existing code patterns

### Testing Requirements

**Backend Testing:**
```bash
# Run backend tests
cd backend && npm test

# Run with coverage
cd backend && npm run test:coverage

# Minimum coverage: 80%
```

**Frontend Testing:**
```bash
# Run frontend tests
cd frontend && npm test

# Run with coverage
cd frontend && npm run test:coverage

# Minimum coverage: 75%
```

**Test Guidelines:**
- Write unit tests for new functions
- Add integration tests for API endpoints
- Test error handling scenarios
- Mock external dependencies
- Use descriptive test names

### API Development

When adding new API endpoints:

1. **Follow RESTful conventions**
```javascript
GET    /api/v1/resources      # List resources
POST   /api/v1/resources      # Create resource
GET    /api/v1/resources/:id  # Get specific resource
PUT    /api/v1/resources/:id  # Update resource
DELETE /api/v1/resources/:id  # Delete resource
```

2. **Add Swagger documentation**
```javascript
/**
 * @swagger
 * /api/v1/resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Success
 */
```

3. **Implement proper validation**
```javascript
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required()
});
```

4. **Add authentication middleware**
```javascript
router.get('/protected', auth, controller.getProtected);
router.get('/admin-only', auth, adminAuth, controller.getAdminOnly);
```

## 🐛 Bug Reports

### Before Reporting
- Check existing issues to avoid duplicates
- Ensure you're using the latest version
- Test with a clean environment

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment**
- OS: [e.g. Ubuntu 22.04]
- Docker version: [e.g. 24.0.0]
- Browser: [e.g. Chrome 120]

**Additional Context**
Any other relevant information

**Logs**
```
Paste relevant logs here
```
```

## 🔧 Debugging

### Backend Debugging

```bash
# View backend logs
npm run logs:backend

# Debug with Node.js inspector (development)
# The backend exposes port 9229 for debugging
# Connect your IDE or use Chrome DevTools
```

### Frontend Debugging

```bash
# View frontend logs
npm run logs:frontend

# React Developer Tools
# Install browser extension for debugging React components
```

### Database Debugging

```bash
# Connect to MongoDB
docker exec -it invoicer_mongodb_dev mongosh -u invoicer_admin -p your_password --authenticationDatabase admin

# View database collections
use invoicer
show collections
db.users.find()
```

## 📝 Documentation

### Update Documentation When:
- Adding new features
- Changing API endpoints
- Modifying environment variables
- Adding new dependencies
- Changing deployment procedures

### Documentation Standards:
- Keep README.md up to date
- Add inline comments for complex code
- Update API documentation in Swagger
- Include examples in documentation
- Write clear commit messages

## 🔄 Pull Request Process

### Before Submitting
1. **Test your changes thoroughly**
```bash
# Run all tests
npm test

# Test in clean environment
npm run clean && npm run dev
```

2. **Ensure code quality**
```bash
# Run linting (if available)
npm run lint

# Check for security issues
npm audit
```

3. **Update documentation**
- Update README if needed
- Add/update API documentation
- Update CHANGELOG if applicable

### Pull Request Template
```markdown
## 📋 Description
Brief description of changes

## 🔄 Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## 🧪 Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Tested in clean environment

## 📝 Checklist
- [ ] Self-review completed
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] No sensitive data exposed
- [ ] Environment variables documented

## 🖼️ Screenshots (if applicable)
Add screenshots to help explain your changes

## 🔗 Related Issues
Closes #(issue number)
```

## 🎉 Recognition

Contributors are recognized in:
- Project README.md
- GitHub contributors page
- Release notes
- Community acknowledgments

## 💬 Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Reviews**: Code-specific discussions

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to: essadhamza@outlook.fr
- Include detailed steps to reproduce
- We'll respond within 48 hours

### Security Guidelines
- Never commit secrets or passwords
- Use environment variables for configuration
- Follow secure coding practices
- Keep dependencies updated
- Review code for security implications

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, makes Invoicer better. We appreciate your time and effort in helping improve this project!

---

**Happy coding! 🚀**