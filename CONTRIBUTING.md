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
- [Docker](https://docs.docker.com/get-docker/) (version 28.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.40+)
- [Git](https://git-scm.com/downloads)
- [Node.js 25+](https://nodejs.org/) (for local development)

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
# Application: http://localhost:3000
# API Docs: http://localhost:3000/api-docs
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
npm run logs               # View logs
npm run health             # Check application health

# Testing
npm test                   # Run all tests
npm run test               # Run application tests

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

## 🎯 Contribution Guidelines

### Code Style

**General Guidelines:**
- Write clear, self-documenting code
- Use meaningful commit messages
- Keep functions small and focused
- Add comments for complex logic
- Follow existing code patterns

### Testing Requirements

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

### Application Debugging

```bash
# View  logs
npm run logs

# Debug with Node.js inspector (development)
# The backend exposes port 9229 for debugging
# Connect your IDE or use Chrome DevTools
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