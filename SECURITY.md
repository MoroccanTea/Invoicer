# Security Policy

## Reporting Vulnerabilities

Please report security issues by creating a ticket. I will:
- Respond within 5 working days
- Provide regular update emails
- Publicly acknowledge your contribution (with permission)

## Security Practices

### Authentication
- JWT tokens with 1h expiration
- Refresh token rotation
- Password hashing with bcrypt (10 rounds)

### Input Validation
- Express Validator middleware
- Sanitize all user inputs
- Content Security Policy (CSP) headers

### Dependency Management
- Regular `npm audit` checks
- Dependabot enabled
- Pinned dependency versions

### Data Protection
- MongoDB field-level encryption
- TLS for all database connections
- Regular backups to secure storage

## Encryption Standards
- AES-256 for sensitive data
- TLS 1.3+ for network traffic
- SSH-RSA 4096 for server access

## Supported Versions
Security updates provided for:
| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |
