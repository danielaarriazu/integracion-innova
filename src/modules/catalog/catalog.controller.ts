import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as catalogService from './catalog.service';

export const getProductos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuarioId) { res.status(400).json({ error: 'usuarioId es requerido' }); return; }
    const productos = await catalogService.listarProductos(req.usuarioId);
    res.json(productos);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};

export const postProducto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuarioId!;
    const { nombre, descripcion, precio, stock, imagenUrl, activo } = req.body;
    if (!nombre) {
      res.status(400).json({ error: 'nombre es requerido' });
      return;
    }
    const producto = await catalogService.crearProducto({ usuarioId, nombre, descripcion, precio, stock, imagenUrl, activo });
    res.status(201).json(producto);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};

export const getProducto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const producto = await catalogService.obtenerProducto(id);
    if (!producto) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
    res.json(producto);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};
