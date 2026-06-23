import { Request, Response, NextFunction } from 'express';
import * as botService from '../services/bot.service';


export const getBotConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const configuracion = await botService.obtenerConfiguracionBot(req.usuario!.id);
    res.status(200).json({ success: true, configuracion });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'BOT_NOT_FOUND') {
      res.status(404).json({ success: false, error: 'Configuración de bot no encontrada para este usuario.' });
      return;
    }
    next(error);
  }
};

export const updateBotConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ip = req.ip ?? req.socket.remoteAddress;
    const dispositivo = req.headers['user-agent'];

    const configuracion = await botService.actualizarConfiguracionBot({
      usuarioId: req.usuario!.id,
      ...req.body,
      ip,
      dispositivo,
    });

    res.status(200).json({
      success: true,
      message: 'Configuración del bot actualizada con éxito.',
      configuracion,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'BOT_NOT_FOUND') {
      res.status(404).json({ success: false, error: 'Configuración de bot no encontrada.' });
      return;
    }
    next(error);
  }
};