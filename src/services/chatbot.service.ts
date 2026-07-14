import prisma from '../config/db';
import { procesarMensajeKeyword, normalizar, ResultadoChat } from './keywords.service';
import { getMockConfig, getMockFaqsTodas } from '../mocks/mock.data';

// — Métodos del UML: marcarLeido(), tieneAdjuntos(), esDelBot() —

export const marcarLeido = async (mensajeId: number) => {
  return prisma.mensaje.update({ where: { id: mensajeId }, data: { leido: true } });
};

export const tieneAdjuntos = async (mensajeId: number): Promise<boolean> => {
  const count = await prisma.adjunto.count({ where: { mensajeId } });
  return count > 0;
};

export const esDelBot = (emisor: string): boolean => emisor === 'bot';

// — Motor inteligente: DB-first con fallback a keywords hardcodeadas —
//
// Si se recibe un usuarioId:
//   1. Intenta cargar ConfiguracionBot + FAQs del emprendedor desde la DB
//   2. Si alguna FAQ coincide con las keywords del mensaje → responde con esa FAQ
//   3. Si la DB no está disponible o no hay coincidencia → fallback a keywords hardcodeadas
//
// Si NO se recibe usuarioId → directamente keywords hardcodeadas (modo demo)

export const procesarMensajeInteligente = async (
  mensaje: string,
  sessionId: string,
  usuarioId?: number
): Promise<ResultadoChat & { fuente: 'db' | 'fallback' }> => {

  if (usuarioId) {
    try {
      const config = await prisma.configuracionBot.findUnique({
        where: { usuarioId },
      });

      if (config?.activo) {
        const faqs = await prisma.faq.findMany({
          where: { categoria: { usuarioId }, activo: true },
          select: { id: true, pregunta: true, respuesta: true, keywords: true },
        });

        if (faqs.length > 0) {
          const textoNorm = normalizar(mensaje);
          const coincidente = faqs.find((f) => {
            if (!f.keywords) return false;
            return f.keywords
              .split(',')
              .map((k) => k.trim().toLowerCase())
              .some((k) => textoNorm.includes(k));
          });

          if (coincidente) {
            return {
              respuesta: coincidente.respuesta,
              sessionId,
              intencion: `faq:${coincidente.id}`,
              fuente: 'db',
            };
          }

          // FAQs cargadas pero ninguna coincidió → mensaje de "no entendí" personalizado
          const mensajeNoEntendido = config.mensajeBienvenida
            ? `No encontré una respuesta exacta. ¿Podés reformular tu pregunta? También podés escribirnos directamente.`
            : null;

          if (mensajeNoEntendido) {
            return {
              respuesta: mensajeNoEntendido,
              sessionId,
              intencion: 'no_entendido_db',
              fuente: 'db',
            };
          }
        }
      }
    } catch {
      // DB no disponible → intentar con mock data
      const mockConfig = getMockConfig(usuarioId);
      if (mockConfig?.activo) {
        const mockFaqs = getMockFaqsTodas(usuarioId);
        if (mockFaqs.length > 0) {
          const textoNorm = normalizar(mensaje);
          const coincidente = mockFaqs.find((f) => {
            if (!f.keywords) return false;
            return f.keywords.split(',').map((k) => k.trim().toLowerCase()).some((k) => textoNorm.includes(k));
          });
          if (coincidente) {
            return { respuesta: coincidente.respuesta, sessionId, intencion: `faq:${coincidente.id}`, fuente: 'db' };
          }
        }
      }
    }
  }

  // Fallback final: motor de keywords hardcodeadas (funciona siempre, sin DB)
  return { ...procesarMensajeKeyword(sessionId, mensaje), fuente: 'fallback' };
};

// — Helpers de persistencia en DB (opcionales, se usan cuando hay DB) —

export const crearConsulta = async (usuarioId: number, canal: string = 'web') => {
  const estadoNueva = await prisma.estadoConsulta.findFirst({ where: { nombre: 'nueva' } });
  return prisma.consulta.create({
    data: { usuarioId, estadoConsultaId: estadoNueva?.id ?? 1, canal },
  });
};

export const guardarMensaje = async (consultaId: number, emisor: string, contenido: string) => {
  return prisma.mensaje.create({ data: { consultaId, emisor, contenido } });
};

export const obtenerHistorial = async (consultaId: number) => {
  return prisma.mensaje.findMany({
    where: { consultaId },
    orderBy: { fechaCreacion: 'asc' },
    select: { id: true, emisor: true, contenido: true, leido: true, fechaCreacion: true },
  });
};
