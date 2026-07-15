import { Router } from 'express';
import { chat } from '../controllers/chatbot.controller';

const router = Router();

/**
* @swagger
 * /api/chatbot/chat:
 * post:
 * tags: [Chatbot]
 * summary: Procesa acciones de botones o ingreso de datos del cliente
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [accion, sessionId, botId]
 * properties:
 * accion:
 * type: string
 * description: ID de la acción del botón (ej. MOSTRAR_FAQS, DERIVAR_HUMANO, ENVIAR_DATOS)
 * sessionId:
 * type: string
 * botId:
 * type: string
 * datosCliente:
 * type: string
 * description: El texto libre que ingresa el usuario cuando se le habilitó el input
 * responses:
 * 200:
 * description: Siguiente paso del flujo
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * respuesta:
 * type: string
 * botones:
 * type: array
 * requiereInput:
 * type: boolean
 * description: Si es true, el frontend debe habilitar el teclado al usuario.
 * contexto:
 * type: string
 * description: Indica en qué estado quedó la conversación (ej. ESPERANDO_DATOS_CATALOGO)
 */
router.post('/chat', chat);

/**
 * @swagger
 * /api/chatbot/whatsapp-mock:
 *   post:
 *     tags: [Chatbot]
 *     summary: Simular mensaje entrante desde WhatsApp
 *     description: >
 *       Mock de integración con WhatsApp Web JS. Simula la llegada de un mensaje
 *       como si viniera de WhatsApp. La conexión real se implementa en sprints futuros.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from, body]
 *             properties:
 *               from:
 *                 type: string
 *                 example: "5491112345678@c.us"
 *                 description: Número de WhatsApp del remitente (formato WhatsApp Web JS)
 *               body:
 *                 type: string
 *                 example: Hola, ¿cuánto cuesta el producto X?
 *               timestamp:
 *                 type: string
 *                 example: "2026-06-01T10:00:00Z"
 *               usuarioId:
 *                 type: integer
 *                 example: 1
 *                 description: ID del emprendedor para usar sus FAQs personalizadas (opcional)
 *     responses:
 *       200:
 *         description: Respuesta simulada del bot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mock:
 *                   type: boolean
 *                 mensaje_entrante:
 *                   type: object
 *                 respuesta_bot:
 *                   type: string
 *                 intencion_detectada:
 *                   type: string
 *       400:
 *         description: from y body son requeridos
 */
// router.post('/whatsapp-mock', whatsappMock);

export default router;
