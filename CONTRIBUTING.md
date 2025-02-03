# Contributing to Invoicer 🤝

## 🌟 Welcome Contributors!

We're thrilled that you're interested in contributing to Invoicer! This document provides guidelines to help you get started.

## 📜 Code of Conduct

Our community is built on respect, inclusivity, and collaboration. We expect all contributors to:

- Be respectful and considerate
- Use inclusive language
- Be patient and supportive
- Focus on constructive dialogue
- Respect diverse perspectives

### 🚫 Unacceptable Behavior
- Harassment
- Discriminatory comments
- Trolling or personal attacks
- Public or private harassment
- Publishing others' private information

## 🚀 How to Contribute

### 1. Prepare Your Environment

#### Prerequisites
- Node.js 18+
- Docker
- Git
- npm or Yarn

#### Setup
```bash
# Clone the repository
git clone https://github.com/MoroccanTea/invoicer.git
cd invoicer

# Install dependencies
npm run setup  # Custom script to install backend and frontend deps
```

### 2. Development Workflow

#### Branch Strategy
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/issue-description
```

#### Running the Project
```bash
# Start development servers
npm run dev

# Backend runs on http://localhost:5000
# Frontend runs on http://localhost:3000
```

### 3. Making Changes

#### Code Style Guidelines
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write clear, concise comments
- Keep functions small and focused

#### Coding Conventions
- Backend (Node.js/Express):
  - Use async/await for asynchronous code
  - Implement proper error handling
  - Follow AirBnB JavaScript Style Guide

- Frontend (React):
  - Use functional components with hooks
  - Implement prop-types for type checking
  - Keep components modular and reusable

### 4. Testing

#### Running Tests
```bash
# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# Full test suite
npm test
```

#### Test Coverage Requirements
- Backend: Minimum 80% test coverage
- Frontend: Minimum 75% test coverage
- Write unit and integration tests for new features

### 5. Documentation

- Update README.md if you add new features
- Add comments to complex logic
- Update API documentation for new endpoints
- Write clear commit messages

### 6. Submitting a Pull Request

1. Ensure all tests pass
2. Run linters and fix any style issues
3. Squash commits for a clean history
4. Provide a detailed PR description:
   - What problem does this solve?
   - What changes were made?
   - Are there any side effects?

#### PR Template
```markdown
## Description
[Provide a brief description of your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Tested
[Describe the tests you performed]

## Checklist
- [ ] I have performed a self-review
- [ ] I have added tests
- [ ] Documentation is updated
```

### 7. Code Review Process

- PRs require review from at least one maintainer
- Expect constructive feedback
- Be open to suggestions
- Maintainers may request changes

## 🏆 Contribution Recognition

We appreciate all contributions! Contributors will be recognized in:
- Project README
- GitHub CONTRIBUTORS file
- Release notes

## 💬 Communication Channels

- GitHub Issues
- Discussion Forums
- Community Slack Channel

## 📋 Reporting Bugs

### Before Reporting
- Check existing issues
- Ensure you're using the latest version
- Provide a minimal reproducible example

### Bug Report Template
```markdown
**Describe the bug**
[A clear description of the bug]

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'

**Expected Behavior**
[What you expected to happen]

**Actual Behavior**
[What actually happened]

**Environment**
 - OS: [e.g. Windows 10]
 - Node.js Version: [e.g. 18.0.0]
 - Browser: [e.g. Chrome 89]
```

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make open-source communities amazing. We appreciate your help in making Invoicer better!
