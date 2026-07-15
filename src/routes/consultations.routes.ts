import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { getConsultas, postConsulta, getConsulta, cerrarConsulta, derivarConsulta, postConsultaProducto } from '../controllers/consultations.controller';

const router = Router();

/**
 * @swagger
 * /api/consultations:
 *   get:
 *     tags: [Consultations]
 *     summary: Listar consultas del emprendedor autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consultas
 */
router.get('/', verificarToken, getConsultas);

/**
 * @swagger
 * /api/consultations:
 *   post:
 *     tags: [Consultations]
 *     summary: Crear una nueva consulta
 *     description: |
 *       El cliente anónimo inicia una conversación con el bot. Se crea con estado **"nueva"** automáticamente.
 *       Guardar el `consultaId` que devuelve — se usa en todo el flujo (mensajes, leads, derivaciones).
 *
 *       **Ejemplos de prueba (sin DB no persiste, pero valida la estructura):**
 *       - Cliente de Panadería García → `POST https://chatbot-innova-backend.onrender.com/api/consultations?usuarioId=1`
 *       - Cliente de Ferretería López → `POST https://chatbot-innova-backend.onrender.com/api/consultations?usuarioId=2`
 *       - Cliente de Ropa & Accesorios Mía → `POST https://chatbot-innova-backend.onrender.com/api/consultations?usuarioId=3`
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         description: ID del emprendedor dueño del chatbot. Reemplaza al token para clientes anónimos.
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canal:
 *                 type: string
 *                 example: web
 *               asunto:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               tipoConsulta:
 *                 type: string
 *               prioridad:
 *                 type: string
 *                 example: normal
 *                 description: "Valores posibles: baja, normal, alta, urgente"
 *               derivadaA:
 *                 type: string
 *                 description: Agente o canal al que se deriva la consulta (opcional)
 *     responses:
 *       201:
 *         description: Consulta creada con estado "nueva"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 usuarioId:
 *                   type: integer
 *                 estadoConsultaId:
 *                   type: integer
 *                 tipoConsulta:
 *                   type: string
 *                 prioridad:
 *                   type: string
 *                 canal:
 *                   type: string
 *                 asunto:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 derivadaA:
 *                   type: string
 *                   nullable: true
 *                 fechaCreacion:
 *                   type: string
 *                   format: date-time
 *                 fechaActualizacion:
 *                   type: string
 *                   format: date-time
 *                 fechaCierre:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       400:
 *         description: usuarioId es requerido
 */
//router.post('/', optionalToken, postConsulta);

/**
 * @swagger
 * /api/consultations/{id}:
 *   get:
 *     tags: [Consultations]
 *     summary: Obtener una consulta por ID (incluye mensajes)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Consulta encontrada
 *       404:
 *         description: Consulta no encontrada
 */
router.get('/:id', verificarToken, getConsulta);

/**
 * @swagger
 * /api/consultations/{id}/cerrar:
 *   patch:
 *     tags: [Consultations]
 *     summary: Cerrar una consulta
 *     description: Lo ejecuta el bot automáticamente cuando el cliente termina la conversación (responde "No" al final del flujo).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Consulta cerrada
 */
router.patch('/:id/cerrar', cerrarConsulta);

/**
 * @swagger
 * /api/consultations/{id}/derivar:
 *   patch:
 *     tags: [Consultations]
 *     summary: Derivar una consulta a un agente
 *     description: >
 *       **🔘 Botón UI: "Necesito más ayuda"** — lo ejecuta el bot automáticamente cuando el cliente toca este botón.
 *       Cambia el estado de la consulta a "derivada" usando la configuración que el emprendedor definió en BotConfig.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [agente]
 *             properties:
 *               agente:
 *                 type: string
 *                 example: carlos@negocio.com
 *     responses:
 *       200:
 *         description: Consulta derivada
 */
router.patch('/:id/derivar', derivarConsulta);

/**
 * @swagger
 * /api/consultations/{id}/productos:
 *   post:
 *     tags: [Consultations]
 *     summary: Registrar producto consultado — tracking M4
 *     description: |
 *       Registra silenciosamente que en la consulta `{id}`, el cliente abrió el detalle de un producto.
 *       El frontend lo llama en segundo plano cada vez que el cliente hace clic en un producto del catálogo.
 *       Crea una fila en `CONSULTA_PRODUCTO` y alimenta la métrica **M4 Catálogo** del Plan de Tracking.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la consulta activa (devuelto por POST /api/consultations)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productoId]
 *             properties:
 *               productoId:
 *                 type: integer
 *                 example: 102
 *                 description: ID del producto que el cliente consultó
 *               cantidad:
 *                 type: integer
 *                 example: 1
 *                 description: Cantidad de veces que lo consultó (default 1)
 *     responses:
 *       201:
 *         description: Registro creado en CONSULTA_PRODUCTO
 *       400:
 *         description: productoId es requerido
 */
router.post('/:id/productos', postConsultaProducto);

export default router;
