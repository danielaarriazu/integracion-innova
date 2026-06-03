import 'dotenv/config';
import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log('Conectado a PostgreSQL (Supabase) via Prisma');
  } catch {
    console.warn('No se pudo conectar a la base de datos. Asegúrate de configurar DATABASE_URL en .env');
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Swagger UI disponible en http://localhost:${PORT}/api-docs`);
  });
}

main();
