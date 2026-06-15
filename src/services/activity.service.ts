import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export const registrarActividad = async (
  usuarioId: string, 
  accion: string, 
  detalle: string, 
  req: Request
): Promise<void> => {
  try {
    await prisma.registroActividad.create({
      data: {
        usuario_id: usuarioId,
        accion: accion,
        detalle: detalle,
        ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
        dispositivo: req.headers['user-agent'] || 'Desconocido'
      }
    });
  } catch (error) {
    // Si falla el log, solo lo mostramos en consola para debug.
    console.error(`Error al registrar actividad (${accion}) para el usuario ${usuarioId}:`, error);
  }
};