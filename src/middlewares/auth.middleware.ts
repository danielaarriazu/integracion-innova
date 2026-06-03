import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuarioId?: number;
  usuarioRol?: string;
}

// Middleware para rutas públicas que también pueden recibir token
// Si hay token válido → usa req.usuarioId del token
// Si no hay token → acepta ?usuarioId= como query param (cliente anónimo)
export const optionalToken = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; rol: string };
      req.usuarioId = payload.id;
      req.usuarioRol = payload.rol;
    } catch {
      // token inválido → ignorar, continuar sin usuarioId
    }
  }
  if (!req.usuarioId && req.query.usuarioId) {
    req.usuarioId = parseInt(req.query.usuarioId as string);
  }
  next();
};

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: number;
      rol: string;
    };
    req.usuarioId = payload.id;
    req.usuarioRol = payload.rol;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
