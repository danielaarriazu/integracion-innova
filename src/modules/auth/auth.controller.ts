import { Request, Response } from 'express';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, telefono } = req.body;
    if (!nombre || !email || !password) {
      res.status(400).json({ error: 'nombre, email y password son requeridos' });
      return;
    }
    const usuario = await authService.registrar({ nombre, email, password, telefono });
    res.status(201).json({ message: 'Usuario registrado', usuario });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    const status = msg === 'El email ya está registrado' ? 409 : 500;
    res.status(status).json({ error: msg });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'email y password son requeridos' });
      return;
    }
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const resultado = await authService.login({ email, password }, ip, userAgent);
    res.json(resultado);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    const status = msg === 'Credenciales inválidas' ? 401 : msg === 'Cuenta inactiva' ? 403 : 500;
    res.status(status).json({ error: msg });
  }
};
