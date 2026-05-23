// Archivo: src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON en el body de las peticiones
app.use(express.json());

// Montamos las rutas de autenticación bajo el prefijo /api/auth
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor de InnovaLab corriendo perfectamente' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});