import prisma from '../lib/prisma';
import { enviarEventosQueue } from './telemetry.service'; // Usamos la telemetría intacta

export const procesarAccionBot = async (
  accion: string,
  sessionId: string,
  botId: string,
  datosCliente?: any,
  contextoActual?: string
) => {
  // 1. Telemetría Silenciosa: Registramos la interacción sin modificar el servicio original
  if (['MOSTRAR_CATALOGO', 'DERIVAR_HUMANO', 'SOLICITAR_PRESUPUESTO', 'MOSTRAR_FAQS', 'VER_HORARIOS'].includes(accion)) {
    await enviarEventosQueue({
      botId,
      sessionId,
      tipoUsuario: 'ANONIMO',
      eventos: [{ tipo: `ACCION_${accion}`, fecha: new Date().toISOString() }]
    });
  }

  const bot = await prisma.configuracionBot.findUnique({ where: { id: botId } });

  switch (accion) {
    // --- 1. HORARIOS ---
    case 'VER_HORARIOS':
      return {
        respuesta: bot?.horarioAtencion || "Lunes a Viernes de 9:00 a 18:00 hs.",
        botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
        requiereInput: false
      };

    // --- 2. FAQS ---
    case 'MOSTRAR_FAQS':
      const faqs = await prisma.faq.findMany({
        where: { botId, activa: true },
        include: { categoria: true }
      });
      const textoFaqs = faqs.map(f => `*${f.categoria.nombre}:* ${f.pregunta}\nR: ${f.respuesta}`).join('\n\n');
      
      return {
        respuesta: textoFaqs || "No hay preguntas frecuentes configuradas.",
        botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
        requiereInput: false
      };

    // --- 3. CATÁLOGO Y PRESUPUESTOS ---
    case 'MOSTRAR_CATALOGO':
      return {
        respuesta: "Acá tenés nuestro catálogo. Seleccioná lo que necesites.",
        botones: [], 
        requiereInput: false,
        contexto: 'VIENDO_CATALOGO'
      };

    case 'SOLICITAR_PRESUPUESTO':
      // Frontend envía los items elegidos en datosCliente.items
      const requiereCotizacion = datosCliente.items.some((item: any) => !item.precio || item.precio === 0);
      return {
        respuesta: "¡Excelente elección! Para poder armar tu presupuesto, por favor escribime tu *Nombre*.",
        botones: [],
        requiereInput: true,
        contexto: requiereCotizacion ? 'ESPERANDO_NOMBRE_COTIZACION' : 'ESPERANDO_NOMBRE_PRESUPUESTO',
        datosAcumulados: { carrito: datosCliente.items } // Retenemos el carrito
      };

    // --- 4. DERIVACIÓN A HUMANO ---
    case 'DERIVAR_HUMANO':
      return {
        respuesta: "Para derivar tu consulta a un representante, por favor decime tu *Nombre*.",
        botones: [],
        requiereInput: true,
        contexto: 'ESPERANDO_NOMBRE_HUMANO'
      };

    // --- 5. RECEPCIÓN DE DATOS (NOMBRE -> TELÉFONO -> PANEL) ---
    case 'ENVIAR_DATOS':
      if (!datosCliente || !datosCliente.texto) {
        return { respuesta: "Por favor, ingresá el dato.", requiereInput: true, contexto: contextoActual };
      }

      // FASE A: Recibimos Nombre y pedimos Teléfono
      if (contextoActual?.startsWith('ESPERANDO_NOMBRE_')) {
        const flujoDestino = contextoActual.split('ESPERANDO_NOMBRE_')[1];
        const nombreIngresado = datosCliente.texto;

        return {
          respuesta: `¡Un gusto, ${nombreIngresado}! Ahora por favor ingresá tu *Teléfono* para que podamos contactarte.`,
          botones: [],
          requiereInput: true,
          contexto: `ESPERANDO_TELEFONO_${flujoDestino}`,
          datosAcumulados: { ...datosCliente.datosAcumulados, nombre: nombreIngresado } // Acumulamos el nombre
        };
      }

      // FASE B: Recibimos Teléfono, creamos registros y finalizamos
      if (contextoActual?.startsWith('ESPERANDO_TELEFONO_')) {
        const telefonoIngresado = datosCliente.texto;
        const nombreGuardado = datosCliente.datosAcumulados?.nombre || 'Cliente';
        const flujoDestino = contextoActual.split('ESPERANDO_TELEFONO_')[1];

        // 1. Lógica de Persistencia (Panel del Emprendedor)
        // Aquí conectamos con la tabla Consultas. Ajusta según tu schema Prisma exacto.
        /*
        const nuevaConsulta = await prisma.consulta.create({
          data: {
            usuarioId: bot.usuarioId, // El ID del emprendedor
            nombreCliente: nombreGuardado,
            telefonoCliente: telefonoIngresado,
            tipoConsulta: flujoDestino, // 'HUMANO', 'PRESUPUESTO' o 'COTIZACION'
            estado: 'PENDIENTE',
            detalles: datosCliente.datosAcumulados?.carrito ? JSON.stringify(datosCliente.datosAcumulados.carrito) : 'Derivación a atención humana'
          }
        });
        */

        // 2. Mensajes finales al cliente según el flujo
        if (flujoDestino === 'HUMANO') {
          return {
            respuesta: bot?.respuestaDerivacion || `¡Listo ${nombreGuardado}! Tu consulta fue enviada a nuestro equipo. Nos contactaremos al ${telefonoIngresado}.`,
            botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
            requiereInput: false,
            contexto: 'FINALIZADO'
          };
        }

        if (flujoDestino === 'PRESUPUESTO' || flujoDestino === 'COTIZACION') {
          const msgExito = flujoDestino === 'COTIZACION'
            ? `¡Gracias ${nombreGuardado}! Recibimos tu pedido de cotización. Te enviaremos el valor final al ${telefonoIngresado}.`
            : `¡Presupuesto generado con éxito, ${nombreGuardado}! Ya podés descargarlo desde tu pantalla.`; 

          return {
            respuesta: msgExito,
            botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
            requiereInput: false,
            contexto: 'FINALIZADO'
          };
        }
      }
      break;

    // --- 6. VOLVER AL MENÚ ---
    case 'VOLVER_MENU':
      return {
        respuesta: "¿En qué más puedo ayudarte?",
        botones: [
          { id: 'btn_catalogo', texto: '🛍️ Ver Catálogo', accion: 'MOSTRAR_CATALOGO' },
          { id: 'btn_horarios', texto: '🕒 Horario de Atención', accion: 'VER_HORARIOS' },
          { id: 'btn_faqs', texto: '❓ Preguntas Frecuentes', accion: 'MOSTRAR_FAQS' },
          { id: 'btn_humano', texto: '👤 Hablar con una persona', accion: 'DERIVAR_HUMANO' }
        ],
        requiereInput: false,
        contexto: 'INICIO'
      };

    default:
      return {
        respuesta: "Acción no reconocida.",
        botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
        requiereInput: false
      };
  }
};