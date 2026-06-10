import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

import authRoutes from './modules/auth/auth.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import catalogRoutes from './modules/catalog/catalog.routes';
import consultationsRoutes from './modules/consultations/consultations.routes';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/demo', express.static(path.join(__dirname, '../demo')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
