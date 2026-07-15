import { procesarMensajeKeyword, normalizar, ResultadoChat } from './keywords.service';
import { getMockConfig, getMockFaqsTodas } from '../mocks/mock.data';
import prisma from '../lib/prisma';

export const procesarAccionBot = async (
  accion: string, 
  sessionId: string, 
  botId: string, 
  datosCliente?: any,
  contextoActual?: string
) => {
  const bot = await prisma.configuracionBot.findUnique({ where: { id: botId } });
 
  switch (accion) {
    case 'VER_HORARIOS':
      return {
        respuesta: bot?.horarioAtencion || "Lunes a Viernes de 9:00 a 18:00 hs.",
        botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
        requiereInput: false
      };

    case 'MOSTRAR_FAQS':
      // Buscamos las FAQs activas agrupadas por categoría
      const faqs = await prisma.faq.findMany({
        where: { 
          botId: botId, // 
          activa: true 
        },
        include: { categoria: true }
      });
      
      const textoFaqs = faqs.map(f => `*${f.categoria.nombre}:* ${f.pregunta}\nR: ${f.respuesta}`).join('\n\n');
      
      return {
        respuesta: textoFaqs || "No hay preguntas frecuentes configuradas en este momento.",
        botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
        requiereInput: false
      };

    case 'MOSTRAR_CATALOGO':
      return {
        respuesta: "Acá tenés nuestro catálogo. Seleccioná lo que necesites.",
        botones: [], 
        requiereInput: false,
        contexto: 'VIENDO_CATALOGO'
      };

    case 'SOLICITAR_PRESUPUESTO':
      const tieneProductosSinPrecio = datosCliente.items.some((item: any) => item.precio === null || item.precio === 0);
      
      const mensajePresupuesto = tieneProductosSinPrecio 
        ? "Veo que seleccionaste productos que requieren cotización a personalizada. Por favor, ingresá tu Nombre y Teléfono para que nos contactemos y te enviemos el presupuesto."
        : "¡Excelente elección! Para generar tu presupuesto, por favor ingresá tu Nombre y Teléfono.";

      return {
        respuesta: mensajePresupuesto,
        botones: [],
        requiereInput: true,
        contexto: tieneProductosSinPrecio ? 'ESPERANDO_DATOS_COTIZACION' : 'ESPERANDO_DATOS_PRESUPUESTO',
        carritoTemporal: datosCliente.items 
      };
    
    case 'DERIVAR_HUMANO':
      return {
        respuesta: "Para derivar tu consulta a un representante, por favor escribime tu Nombre y Teléfono.",
        botones: [],
        requiereInput: true,
        contexto: 'ESPERANDO_DATOS_HUMANO'
      };

      case 'ENVIAR_DATOS':
      if (!datosCliente || !datosCliente.texto) {
        return { respuesta: "Por favor, ingresá tus datos para continuar.", requiereInput: true, contexto: contextoActual };
      }

      // 1. Guardamos al cliente/Lead en la base de datos (Usuario/Lead)
      // 2. Creamos la "Consulta" asociada a ese Lead y a la ConfiguracionBot

      if (contextoActual === 'ESPERANDO_DATOS_HUMANO') {
        // Todo: prisma.consulta.create(...) con estado "Pendiente"
        return {
          respuesta: bot?.respuestaDerivacion || "¡Gracias! Tu consulta ya fue enviada a nuestro equipo. Te contactaremos pronto.",
          botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
          requiereInput: false,
          contexto: 'FINALIZADO'
        };
      }

      if (contextoActual === 'ESPERANDO_DATOS_PRESUPUESTO' || contextoActual === 'ESPERANDO_DATOS_COTIZACION') {
        // Todo: prisma.consulta.create(...) adjuntando los productos seleccionados (ConsultaProducto)
        const msgExito = contextoActual === 'ESPERANDO_DATOS_COTIZACION'
          ? "¡Gracias! Recibimos tu pedido de cotización. Nos pondremos en contacto a la brevedad."
          : "¡Presupuesto generado con éxito! Podés descargarlo desde el botón de abajo."; // El frontend habilita el PDF
        
        return {
          respuesta: msgExito,
          botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
          requiereInput: false,
          contexto: 'FINALIZADO'
        };
      }
      break;

    case 'VOLVER_MENU':
      return {
        respuesta: "¿En qué más puedo ayudarte hoy?",
        botones: [
          { id: 'btn_catalogo', texto: 'Ver Catálogo', accion: 'MOSTRAR_CATALOGO' },
          { id: 'btn_horarios', texto: 'Horario de Atención', accion: 'VER_HORARIOS' },
          { id: 'btn_faqs', texto: 'Preguntas Frecuentes', accion: 'MOSTRAR_FAQS' },
          { id: 'btn_humano', texto: 'Hablar con una persona', accion: 'DERIVAR_HUMANO' }
        ],
        requiereInput: false,
        contexto: 'INICIO'
      };

    default:
      return {
        respuesta: "No entendí esa acción.",
        botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
        requiereInput: false
      };
  }
};

// — Métodos del UML: marcarLeido(), tieneAdjuntos(), esDelBot() —

//export const marcarLeido = async (mensajeId: number) => {
 // return prisma.mensaje.update({ where: { id: mensajeId }, data: { leido: true } });
//};

//export const tieneAdjuntos = async (mensajeId: number): Promise<boolean> => {
  //const count = await prisma.adjunto.count({ where: { mensajeId } });
  //return count > 0;
//};

// export const esDelBot = (emisor: string): boolean => emisor === 'bot';

// — Motor inteligente: DB-first con fallback a keywords hardcodeadas —
//
// Si se recibe un usuarioId:
//   1. Intenta cargar ConfiguracionBot + FAQs del emprendedor desde la DB
//   2. Si alguna FAQ coincide con las keywords del mensaje → responde con esa FAQ
//   3. Si la DB no está disponible o no hay coincidencia → fallback a keywords hardcodeadas
//
// Si NO se recibe usuarioId → directamente keywords hardcodeadas (modo demo)

// export const procesarMensajeInteligente = async (
//   mensaje: string,
//   sessionId: string,
//   usuarioId?: number
// ): Promise<ResultadoChat & { fuente: 'db' | 'fallback' }> => {

//   if (usuarioId) {
//     try {
//       const config = await prisma.configuracionBot.findUnique({
//         where: { usuarioId },
//       });

//       if (config?.activo) {
//         const faqs = await prisma.faq.findMany({
//           where: { categoria: { usuarioId }, activo: true },
//           select: { id: true, pregunta: true, respuesta: true, keywords: true },
//         });

//         if (faqs.length > 0) {
//           const textoNorm = normalizar(mensaje);
//           const coincidente = faqs.find((f) => {
//             if (!f.keywords) return false;
//             return f.keywords
//               .split(',')
//               .map((k) => k.trim().toLowerCase())
//               .some((k) => textoNorm.includes(k));
//           });

//           if (coincidente) {
//             return {
//               respuesta: coincidente.respuesta,
//               sessionId,
//               intencion: `faq:${coincidente.id}`,
//               fuente: 'db',
//             };
//           }

//           // FAQs cargadas pero ninguna coincidió → mensaje de "no entendí" personalizado
//           const mensajeNoEntendido = config.mensajeBienvenida
//             ? `No encontré una respuesta exacta. ¿Podés reformular tu pregunta? También podés escribirnos directamente.`
//             : null;

//           if (mensajeNoEntendido) {
//             return {
//               respuesta: mensajeNoEntendido,
//               sessionId,
//               intencion: 'no_entendido_db',
//               fuente: 'db',
//             };
//           }
//         }
//       }
//     } catch {
//       // DB no disponible → intentar con mock data
//       const mockConfig = getMockConfig(usuarioId);
//       if (mockConfig?.activo) {
//         const mockFaqs = getMockFaqsTodas(usuarioId);
//         if (mockFaqs.length > 0) {
//           const textoNorm = normalizar(mensaje);
//           const coincidente = mockFaqs.find((f) => {
//             if (!f.keywords) return false;
//             return f.keywords.split(',').map((k) => k.trim().toLowerCase()).some((k) => textoNorm.includes(k));
//           });
//           if (coincidente) {
//             return { respuesta: coincidente.respuesta, sessionId, intencion: `faq:${coincidente.id}`, fuente: 'db' };
//           }
//         }
//       }
//     }
//   }

//   // Fallback final: motor de keywords hardcodeadas (funciona siempre, sin DB)
//   return { ...procesarMensajeKeyword(sessionId, mensaje), fuente: 'fallback' };
// };

// // — Helpers de persistencia en DB (opcionales, se usan cuando hay DB) —

// export const crearConsulta = async (usuarioId: number, canal: string = 'web') => {
//   const estadoNueva = await prisma.estadoConsulta.findFirst({ where: { nombre: 'nueva' } });
//   return prisma.consulta.create({
//     data: { usuarioId, estadoConsultaId: estadoNueva?.id ?? 1, canal },
//   });
// };

// export const guardarMensaje = async (consultaId: number, emisor: string, contenido: string) => {
//   return prisma.mensaje.create({ data: { consultaId, emisor, contenido } });
// };

// export const obtenerHistorial = async (consultaId: number) => {
//   return prisma.mensaje.findMany({
//     where: { consultaId },
//     orderBy: { fechaCreacion: 'asc' },
//     select: { id: true, emisor: true, contenido: true, leido: true, fechaCreacion: true },
//   });
// };
