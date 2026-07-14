import { Redis } from '@upstash/redis';
import { z } from 'zod';
import dotenv from 'dotenv';
import prisma from './lib/prisma'; 

dotenv.config();

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('❌ ERROR: Variables de Redis no definidas en .env');
  process.exit(1);
}

const REDIS_KEY = 'telemetria-eventos';

const redisEventoSchema = z.object({
  botId:         z.string().optional(),
  tipoUsuario:   z.string().default('ANONIMO'),
  sessionId:     z.string().min(1).max(200),
  usuarioId:     z.string().optional(),
  ip:            z.string().optional(),
  dispositivo:   z.string().optional(),
  fechaServidor: z.string().min(1),
  eventos:       z.array(z.record(z.string(), z.unknown())).min(1).max(200),
});

type RedisEvento = z.infer<typeof redisEventoSchema>;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

let isRunning = false;       
let shutdownRequested = false;

async function procesarMensajes() {
  if (isRunning) return;
  isRunning = true;

  try {
    let raw = await redis.rpop(REDIS_KEY);

    while (raw && !shutdownRequested) {
      // 1. Validar el payload de Redis
      const parseResult = redisEventoSchema.safeParse(raw);

      if (!parseResult.success) {
        console.error('[WORKER] Evento malformado descartado:', JSON.stringify(raw));
        raw = await redis.rpop(REDIS_KEY);
        continue;
      }

      const evento: RedisEvento = parseResult.data;
      console.log(`[WORKER] Procesando sesión: ${evento.sessionId}`);

      // 2. Insertar en Neon usando Prisma
      try {
        await prisma.eventoTelemetry.create({
          data: {
            botId: evento.botId,
            tipoUsuario: evento.tipoUsuario,
            sessionId: evento.sessionId,
            usuarioId: evento.usuarioId, 
            ip: evento.ip ?? 'desconocida',
            dispositivo: evento.dispositivo ?? 'desconocido',
            fechaServidor: new Date(evento.fechaServidor),
            eventos: evento.eventos
          }
        });

        console.log('[WORKER] Evento insertado exitosamente en Neon.');
      } catch (dbError: any) {
        console.error('[WORKER] Error insertando en Neon:', dbError.message);
        // Si la base de datos falla (ej. caída de red), devolvemos el evento a Redis
        await redis.lpush(REDIS_KEY, evento);
        break;
      }

      // Siguiente mensaje
      raw = await redis.rpop(REDIS_KEY);
    }
  } catch (error) {
    console.error('[WORKER] Error crítico en el loop:', error);
  } finally {
    isRunning = false;
  }
}

function manejarApagado(señal: string) {
  console.log(`[WORKER] ${señal} recibido. Esperando mensaje en curso antes de cerrar...`);
  shutdownRequested = true;

  const timeout = setTimeout(() => {
    console.log('[WORKER] Timeout de apagado. Cerrando forzosamente.');
    process.exit(0);
  }, 15_000);

  const intervalo = setInterval(() => {
    if (!isRunning) {
      clearTimeout(timeout);
      clearInterval(intervalo);
      console.log('[WORKER] Apagado limpio. Hasta luego.');
      process.exit(0);
    }
  }, 200);
}

process.on('SIGTERM', () => manejarApagado('SIGTERM'));
process.on('SIGINT',  () => manejarApagado('SIGINT'));

console.log('Worker de telemetría iniciado (Conectado a Neon vía Prisma).');
procesarMensajes();

setInterval(() => {
  if (!isRunning && !shutdownRequested) procesarMensajes(); 
}, 10000);