const swaggerJSDoc = require('swagger-jsdoc');
const packageJson = require('../../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Invoicer API',
      version: packageJson.version,
      description: 'API for managing invoices and related entities',
      contact: {
        name: "API Support",
        email: "support@invoicer.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: { type: 'string', example: '641f0b6d58c5d33e5b0e12a3' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { 
              type: 'string', 
              enum: ['user', 'admin'],
              default: 'user',
              example: 'user'
            },
            password: { 
              type: 'string', 
              format: 'password',
              minLength: 8,
              example: 'securePassword123' 
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Client: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            _id: { type: 'string', example: '64a1b5c3f8a9b6e7d4f3c2a1' },
            name: { type: 'string', example: 'Acme Corp' },
            email: { type: 'string', format: 'email', example: 'billing@acme.com' },
            address: { 
              type: 'string',
              example: '123 Business St, New York, NY 10001' 
            },
            taxId: { 
              type: 'string',
              example: 'TAX-123456',
              description: 'VAT or other tax identification number' 
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Invoice: {
          type: 'object',
          required: ['clientId', 'items', 'total'],
          properties: {
            _id: { type: 'string', example: '64c2b5c3f8a9b6e7d4f3c2b2' },
            invoiceNumber: { 
              type: 'string',
              example: 'INV-2023-001',
              description: 'Auto-generated invoice number' 
            },
            clientId: { 
              type: 'string',
              example: '64a1b5c3f8a9b6e7d4f3c2a1',
              description: 'Reference to Client document' 
            },
            projectId: { 
              type: 'string',
              example: '60a3e5a8e6b940001f6d4e1a',
              description: 'Optional reference to Project document' 
            },
            date: { 
              type: 'string', 
              format: 'date',
              example: '2024-03-01' 
            },
            dueDate: { 
              type: 'string', 
              format: 'date',
              example: '2024-03-15' 
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['description', 'quantity', 'rate'],
                properties: {
                  description: { type: 'string', example: 'Web Development' },
                  quantity: { type: 'number', example: 10 },
                  rate: { type: 'number', example: 75 },
                  amount: { type: 'number', example: 750, readOnly: true }
                }
              }
            },
            subtotal: { type: 'number', example: 1250.00 },
            taxRate: { type: 'number', example: 20 },
            taxAmount: { type: 'number', example: 250.00 },
            total: { type: 'number', example: 1500.00 },
            status: { 
              type: 'string', 
              enum: ['draft', 'sent', 'paid', 'overdue'],
              default: 'draft',
              example: 'draft' 
            },
            notes: { 
              type: 'string',
              example: 'Payment terms: Net 15 days' 
            },
            currency: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'USD' },
                symbol: { type: 'string', example: '$' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            error: { type: 'string', example: 'Bad Request' },
            message: { type: 'string', example: 'Invalid input data' },
            validation: {
              type: 'object',
              properties: {
                source: { type: 'string', example: 'body' },
                keys: { 
                  type: 'array',
                  items: { type: 'string', example: 'email' }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Invalid or missing authentication token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid authentication token'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                statusCode: 403,
                error: 'Forbidden',
                message: 'Admin privileges required'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                statusCode: 404,
                error: 'Not Found',
                message: 'Invoice not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                statusCode: 422,
                error: 'Validation Error',
                message: 'Invalid email format',
                validation: {
                  source: 'body',
                  keys: ['email']
                }
              }
            }
          }
        },
        ConflictError: {
          description: 'Resource conflict',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                statusCode: 409,
                error: 'Conflict',
                message: 'Email already registered'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'An unexpected error occurred'
              }
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJSDoc(options);

module.exports = specs;
