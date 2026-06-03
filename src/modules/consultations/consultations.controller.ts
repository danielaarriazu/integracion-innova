import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as consultationsService from './consultations.service';

export const getConsultas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const consultas = await consultationsService.listarConsultas(req.usuarioId!);
    res.json(consultas);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};

export const postConsulta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuarioId ?? parseInt(req.query.usuarioId as string);
    if (!usuarioId || isNaN(usuarioId)) {
      res.status(400).json({ error: 'usuarioId es requerido — indica a qué emprendedor pertenece esta conversación' });
      return;
    }
    const { canal, asunto, descripcion, tipoConsulta, prioridad } = req.body;
    const consulta = await consultationsService.crearConsulta({ usuarioId, canal, asunto, descripcion, tipoConsulta, prioridad });
    res.status(201).json(consulta);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};

export const getConsulta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const consulta = await consultationsService.obtenerConsulta(id);
    if (!consulta) { res.status(404).json({ error: 'Consulta no encontrada' }); return; }
    res.json(consulta);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};

export const cerrarConsulta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const consulta = await consultationsService.cerrar(id);
    res.json(consulta);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};

export const derivarConsulta = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { agente } = req.body;
    if (!agente) { res.status(400).json({ error: 'agente es requerido' }); return; }
    const consulta = await consultationsService.derivar(id, agente);
    res.json(consulta);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};
