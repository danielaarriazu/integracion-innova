import { Request, Response } from 'express';
import { procesarAccionBot } from '../services/chatbot.service';

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accion, sessionId, botId, datosCliente, contexto } = req.body;
    
    if (!accion || !sessionId || !botId) {
      res.status(400).json({ error: 'Faltan parámetros: accion, sessionId, botId' });
      return;
    }

    const resultado = await procesarAccionBot(accion, sessionId, botId, datosCliente, contexto);
    res.status(200).json(resultado);
    
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
  }
};

// POST /api/chatbot/whatsapp-mock
// Simula la llegada de un mensaje desde WhatsApp Web JS.
// Acepta usuarioId para usar la configuración del emprendedor si la DB está disponible.
// export const whatsappMock = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { from, body, timestamp, usuarioId } = req.body;
//     if (!from || !body) {
//       res.status(400).json({ error: 'from y body son requeridos' });
//       return;
//     }

//     const uid: number | undefined = usuarioId ? parseInt(usuarioId) : undefined;
//     const resultado = await procesarMensajeInteligente(body, from, uid);

//     res.json({
//       mock: true,
//       mensaje_entrante: { from, body, timestamp: timestamp || new Date().toISOString() },
//       respuesta_bot: resultado.respuesta,
//       intencion_detectada: resultado.intencion,
//       fuente: resultado.fuente,
//       sessionId: resultado.sessionId,
//     });
//   } catch (err: unknown) {
//     res.status(500).json({ error: err instanceof Error ? err.message : 'Error interno' });
//   }
// };
