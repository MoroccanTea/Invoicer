import type { OpenAPIV3 } from 'openapi-types'

export function buildOpenAPISpec(): OpenAPIV3.Document {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Invoicer API',
      version: '2.0.0',
      description: 'REST API for the Invoicer billing management system.',
      contact: { email: 'hamza@essad.ma' },
      license: { name: 'MIT' },
    },
    servers: [{ url: '/api', description: 'Current server' }],
    tags: [
      { name: 'Auth', description: 'Authentication and session management' },
      { name: 'Auth - 2FA', description: 'Two-factor authentication (TOTP)' },
      { name: 'Profile', description: 'Current user profile' },
      { name: 'Clients', description: 'Client management' },
      { name: 'Projects', description: 'Project management' },
      { name: 'Invoices', description: 'Invoice management and PDF export' },
      { name: 'Users', description: 'User management (admin only)' },
      { name: 'Configuration', description: 'Business configuration' },
      { name: 'Stats', description: 'Dashboard statistics and reporting' },
      { name: 'Notifications', description: 'Email notifications and reminders' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'NextAuth session cookie (set automatically after login)',
        },
        cronSecret: {
          type: 'apiKey',
          in: 'header',
          name: 'x-cron-secret',
          description: 'Static secret for cron job authentication (CRON_SECRET env var)',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            ice: { type: 'string' },
            contactPerson: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            notes: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            client: { type: 'string', description: 'Client ObjectId' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['active', 'completed', 'on_hold', 'cancelled'] },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        InvoiceItem: {
          type: 'object',
          required: ['description', 'quantity', 'unitPrice', 'amount'],
          properties: {
            description: { type: 'string' },
            quantity: { type: 'number', minimum: 0.01 },
            unitPrice: { type: 'number', minimum: 0 },
            amount: { type: 'number' },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string', example: '01-2025-SD-001' },
            project: { type: 'string' },
            client: { type: 'string' },
            category: {
              type: 'string',
              enum: ['teaching', 'software_development', 'consulting', 'pentesting'],
            },
            billingType: { type: 'string', enum: ['daily', 'hourly', 'fixed'] },
            status: {
              type: 'string',
              enum: ['pending', 'cancelled', 'paid_pending_taxes', 'all_paid'],
            },
            items: { type: 'array', items: { $ref: '#/components/schemas/InvoiceItem' } },
            subtotal: { type: 'number' },
            taxRate: { type: 'number', minimum: 0, maximum: 100 },
            taxAmount: { type: 'number' },
            total: { type: 'number' },
            issueDate: { type: 'string', format: 'date' },
            dueDate: { type: 'string', format: 'date' },
            paidDate: { type: 'string', format: 'date', nullable: true },
            notes: { type: 'string' },
            termsAndConditions: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'manager', 'user'] },
            isActive: { type: 'boolean' },
            twoFactorEnabled: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Config: {
          type: 'object',
          properties: {
            systemType: { type: 'string', enum: ['morocco', 'generic'] },
            businessName: { type: 'string' },
            businessAddress: { type: 'string' },
            businessCity: { type: 'string' },
            businessCountry: { type: 'string' },
            currency: { type: 'string' },
            currencySymbol: { type: 'string' },
            taxRate: { type: 'number' },
            taxName: { type: 'string' },
            ice: { type: 'string' },
            bankName: { type: 'string' },
            rib: { type: 'string' },
            iban: { type: 'string' },
            isConfigured: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
    paths: {
      // ── Auth ────────────────────────────────────────────────────
      '/auth/change-password': {
        post: {
          tags: ['Auth'],
          summary: 'Change the current user\'s password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Password changed' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized' },
          },
        },
      },

      // ── 2FA ─────────────────────────────────────────────────────
      '/auth/2fa/setup': {
        get: {
          tags: ['Auth - 2FA'],
          summary: 'Generate a TOTP secret and QR code',
          responses: {
            '200': {
              description: 'QR code and manual entry key',
              content: { 'application/json': { schema: { type: 'object', properties: { qrCode: { type: 'string' }, secret: { type: 'string' } } } } },
            },
            '400': { description: '2FA already enabled' },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/auth/2fa/enable': {
        post: {
          tags: ['Auth - 2FA'],
          summary: 'Verify TOTP and enable 2FA',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['token'], properties: { token: { type: 'string' } } } } },
          },
          responses: {
            '200': {
              description: '2FA enabled, returns one-time backup codes',
              content: { 'application/json': { schema: { type: 'object', properties: { backupCodes: { type: 'array', items: { type: 'string' } } } } } },
            },
            '400': { description: 'Invalid token' },
          },
        },
      },
      '/auth/2fa/disable': {
        post: {
          tags: ['Auth - 2FA'],
          summary: 'Disable 2FA (requires password confirmation)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['password'], properties: { password: { type: 'string' } } } } },
          },
          responses: {
            '200': { description: '2FA disabled' },
            '400': { description: 'Wrong password or 2FA not enabled' },
          },
        },
      },
      '/auth/2fa/backup': {
        post: {
          tags: ['Auth - 2FA'],
          summary: 'Use a backup code to bypass 2FA during login',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'backupCode'],
                  properties: { email: { type: 'string' }, password: { type: 'string' }, backupCode: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Backup code valid' },
            '400': { description: 'Invalid code or credentials' },
          },
        },
      },

      // ── Profile ──────────────────────────────────────────────────
      '/profile': {
        get: {
          tags: ['Profile'],
          summary: 'Get current user profile',
          responses: {
            '200': { description: 'Profile data' },
            '401': { description: 'Unauthorized' },
          },
        },
        put: {
          tags: ['Profile'],
          summary: 'Update current user profile',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' }, lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' }, cnie: { type: 'string' },
                    language: { type: 'string', enum: ['en', 'fr', 'ar', 'es'] },
                    notificationsEnabled: { type: 'boolean' },
                    taxReminderEnabled: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Updated profile' }, '401': { description: 'Unauthorized' } },
        },
      },

      // ── Clients ─────────────────────────────────────────────────
      '/clients': {
        get: {
          tags: ['Clients'],
          summary: 'List clients',
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'active', schema: { type: 'string', enum: ['true', 'false'] } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            '200': {
              description: 'Client list with pagination',
              content: { 'application/json': { schema: { type: 'object', properties: { clients: { type: 'array', items: { $ref: '#/components/schemas/Client' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } },
            },
          },
        },
        post: {
          tags: ['Clients'],
          summary: 'Create a client',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Client' } } },
          },
          responses: { '201': { description: 'Created client' }, '400': { description: 'Validation error' } },
        },
      },
      '/clients/{id}': {
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        get: { tags: ['Clients'], summary: 'Get client by ID', responses: { '200': { description: 'Client' }, '404': { description: 'Not found' } } },
        put: { tags: ['Clients'], summary: 'Update client', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Client' } } } }, responses: { '200': { description: 'Updated client' } } },
        delete: { tags: ['Clients'], summary: 'Delete client', responses: { '200': { description: 'Deleted' } } },
      },

      // ── Projects ────────────────────────────────────────────────
      '/projects': {
        get: {
          tags: ['Projects'],
          summary: 'List projects',
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'client', schema: { type: 'string' } },
            { in: 'query', name: 'status', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Project list' } },
        },
        post: {
          tags: ['Projects'],
          summary: 'Create a project',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
          responses: { '201': { description: 'Created project' } },
        },
      },
      '/projects/{id}': {
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        get: { tags: ['Projects'], summary: 'Get project by ID', responses: { '200': { description: 'Project' }, '404': { description: 'Not found' } } },
        put: { tags: ['Projects'], summary: 'Update project', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } }, responses: { '200': { description: 'Updated project' } } },
        delete: { tags: ['Projects'], summary: 'Delete project', responses: { '200': { description: 'Deleted' } } },
      },

      // ── Invoices ────────────────────────────────────────────────
      '/invoices': {
        get: {
          tags: ['Invoices'],
          summary: 'List invoices',
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string' } },
            { in: 'query', name: 'category', schema: { type: 'string' } },
            { in: 'query', name: 'client', schema: { type: 'string' } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          ],
          responses: { '200': { description: 'Invoice list' } },
        },
        post: {
          tags: ['Invoices'],
          summary: 'Create an invoice',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Invoice' } } } },
          responses: { '201': { description: 'Created invoice' } },
        },
      },
      '/invoices/{id}': {
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        get: { tags: ['Invoices'], summary: 'Get invoice by ID', responses: { '200': { description: 'Invoice' }, '404': { description: 'Not found' } } },
        put: { tags: ['Invoices'], summary: 'Update invoice', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Invoice' } } } }, responses: { '200': { description: 'Updated invoice' } } },
        delete: { tags: ['Invoices'], summary: 'Delete invoice', responses: { '200': { description: 'Deleted' } } },
      },
      '/invoices/{id}/pdf': {
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        get: {
          tags: ['Invoices'],
          summary: 'Download invoice as PDF',
          responses: {
            '200': { description: 'PDF file', content: { 'application/pdf': {} } },
            '403': { description: 'Export permission required' },
          },
        },
      },
      '/invoices/{id}/remind': {
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        post: {
          tags: ['Invoices'],
          summary: 'Send a payment reminder email to the client',
          responses: {
            '200': { description: 'Reminder sent' },
            '400': { description: 'SMTP not configured or invoice already paid' },
          },
        },
      },

      // ── Users ───────────────────────────────────────────────────
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'List users (admin)',
          responses: { '200': { description: 'User list' } },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a user (admin)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          responses: { '201': { description: 'Created user' } },
        },
      },
      '/users/{id}': {
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        get: { tags: ['Users'], summary: 'Get user by ID (admin)', responses: { '200': { description: 'User' } } },
        put: { tags: ['Users'], summary: 'Update user (admin)', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, responses: { '200': { description: 'Updated user' } } },
        delete: { tags: ['Users'], summary: 'Delete user (admin)', responses: { '200': { description: 'Deleted' } } },
      },

      // ── Configuration ───────────────────────────────────────────
      '/configuration': {
        get: { tags: ['Configuration'], summary: 'Get business configuration', responses: { '200': { description: 'Config', content: { 'application/json': { schema: { $ref: '#/components/schemas/Config' } } } } } },
        put: {
          tags: ['Configuration'],
          summary: 'Update business configuration (admin)',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Config' } } } },
          responses: { '200': { description: 'Updated config' } },
        },
      },

      // ── Stats ───────────────────────────────────────────────────
      '/stats': {
        get: {
          tags: ['Stats'],
          summary: 'Dashboard statistics and revenue data',
          parameters: [
            { in: 'query', name: 'period', schema: { type: 'string', enum: ['month', 'quarter', 'year'], default: 'month' } },
          ],
          responses: { '200': { description: 'Stats object' } },
        },
      },

      // ── Notifications ────────────────────────────────────────────
      '/notifications/reminders': {
        post: {
          tags: ['Notifications'],
          summary: 'Process all pending reminders (admin or cron job)',
          description: 'Sends payment reminders for overdue invoices and quarterly tax reminders. Can be called by an external cron job using the x-cron-secret header.',
          security: [{ cookieAuth: [] }, { cronSecret: [] }],
          responses: {
            '200': {
              description: 'Summary of sent reminders',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      invoiceReminders: { type: 'integer' },
                      taxReminders: { type: 'integer' },
                      errors: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '400': { description: 'SMTP not configured' },
            '401': { description: 'Unauthorized' },
          },
        },
      },
    },
  }
}
