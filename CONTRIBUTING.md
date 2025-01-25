# Contributing to Invoicer

We welcome contributions! Please follow these guidelines:

## Code of Conduct
- Be respectful and inclusive
- Keep discussions focused on technical topics
- No harassment or discrimination tolerated

## Getting Started
1. Fork & clone the repository
2. Install dependencies:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```
3. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

## Development Setup
- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
```bash
# Start both services
npm run dev
```

## Branching Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes

## Pull Request Guidelines
1. Ensure tests pass:
```bash
cd backend && npm test
```
2. Update documentation if needed
3. Keep commits atomic and well-described
4. Reference related issues
5. Include screenshots for UI changes

## Code Style
- Backend: Follow AirBnB JavaScript Style Guide
- Frontend: React Best Practices
- Use ESLint/Prettier configured in project
- 2-space indentation
- PascalCase for React components
- camelCase for JavaScript functions

## Testing
- Backend: Jest + Supertest
- Frontend: React Testing Library
- Add tests for new features
- Maintain 80%+ test coverage
