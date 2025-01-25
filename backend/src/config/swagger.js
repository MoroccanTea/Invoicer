const swaggerJSDoc = require('swagger-jsdoc');
const packageJson = require('../../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Invoicer API',
      version: packageJson.version,
      description: 'API for managing invoices and related entities',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'], // files containing Swagger annotations
};

const specs = swaggerJSDoc(options);

module.exports = specs;
