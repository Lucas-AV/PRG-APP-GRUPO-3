require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const servicesRoutes = require('./routes/services');
const usersRoutes = require('./routes/users');
const metricsRoutes = require('./routes/metrics');
const reviewsRoutes = require('./routes/reviews');
const plansRoutes = require('./routes/plans');
const subscriptionsRoutes = require('./routes/subscriptions');
const availabilityRoutes = require('./routes/availability');
const appointmentsRoutes = require('./routes/appointments');
const uploadsRoutes = require('./routes/uploads');
const paymentsRoutes = require('./routes/payments');
const { UPLOADS_DIR } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ConectaApp API',
      version: '1.0.0',
      description: 'API REST do ConectaApp — conecta clientes a prestadores de serviços',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Arquivos enviados (avatars e imagens de serviços) servidos estaticamente
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/services', publicRoutes);   // público — sem auth
app.use('/users', publicRoutes);      // público — sem auth (provider reviews)
app.use('/auth', authRoutes);
app.use('/services', servicesRoutes);
app.use('/services', metricsRoutes);
app.use('/services/:id/reviews', reviewsRoutes);
app.use('/users', usersRoutes);
app.use('/plans', plansRoutes);
app.use('/users', subscriptionsRoutes);
app.use('/users', availabilityRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/uploads', uploadsRoutes);
app.use('/payments', paymentsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ConectaApp API está rodando', docs: `http://localhost:${PORT}/api-docs` });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});
