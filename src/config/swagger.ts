import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chatbot InnovaLab — API',
      version: '2.0.0',
      description:
        'API REST modular del chatbot comercial para emprendedores. ' +
        'Sprint 1 — Semana 3. Stack: Node.js + Express + TypeScript + PostgreSQL (Supabase) + Prisma.',
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:3000',
        description: process.env.SERVER_URL ? 'Render (producción)' : 'Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registro e inicio de sesión de emprendedores' },
      { name: 'BotConfig', description: 'Configuración personalizada del chatbot por emprendedor' },
      { name: 'Chatbot', description: 'Motor conversacional por keywords + mock WhatsApp' },
      { name: 'Consultations', description: 'Consultas de clientes' },
      { name: 'Catalog', description: 'Catálogo de productos del emprendedor' },
      { name: 'FAQ', description: 'Preguntas frecuentes' },
      { name: 'Leads', description: 'Datos de contacto capturados en conversaciones' },
      { name: 'Clients', description: 'Mensajes dentro de cada consulta' },
    ],
  },
  apis: [
    process.env.NODE_ENV === 'production'
      ? './dist/modules/**/*.routes.js'
      : './src/modules/**/*.routes.ts',
  ],
};

export default swaggerJsdoc(options);
