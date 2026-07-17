import prisma from '../lib/prisma';
import { enviarEventosQueue } from './telemetry.service'; // Usamos la telemetría intacta

export const procesarAccionBot = async (
  accion: string,
  sessionId: string,
  botId: string,
  datosCliente?: any,
  contextoActual?: string
) => {
  if (['MOSTRAR_CATALOGO', 'DERIVAR_HUMANO', 'SOLICITAR_PRESUPUESTO', 'MOSTRAR_FAQS', 'MOSTRAR_HORARIOS', 'ENVIAR_DATOS'].includes(accion)) {
    await enviarEventosQueue({
      botId,
      sessionId,
      tipoUsuario: 'ANONIMO',
      eventos: [{ tipo: `ACCION_${accion}`, fecha: new Date().toISOString() }]
    });
  }

  const bot = await prisma.configuracionBot.findUnique({ where: { id: botId } });

  switch (accion) {
    case 'MOSTRAR_HORARIOS':
      return {
        respuesta: bot?.horarioAtencion || "Lunes a Viernes de 9:00 a 18:00 hs.",
        botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
        requiereInput: false
      };

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

    case 'MOSTRAR_CATALOGO':
      const productosDelBot = await prisma.producto.findMany({
        where: { 
          botId: botId, 
          activo: true 
        },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          precio: true,
          urlImagen: true
        }
      });

      if (productosDelBot.length === 0) {
        return {
          respuesta: "En este momento no tenemos productos disponibles en el catálogo.",
          botones: [{ id: 'btn_volver', texto: 'Volver al menú', accion: 'VOLVER_MENU' }],
          requiereInput: false,
          contexto: 'INICIO'
        };
      }
      return {
        respuesta: "Acá tenés nuestro catálogo. Seleccioná lo que necesites.",
        botones: [], 
        requiereInput: false,
        contexto: 'VIENDO_CATALOGO',
        productos: productosDelBot
      };

    case 'SOLICITAR_PRESUPUESTO':
      const requiereCotizacion = datosCliente.items.some((item: any) => !item.precio || item.precio === 0);
      return {
        respuesta: "¡Excelente elección! Para poder armar tu presupuesto, por favor escribime tu *Nombre*.",
        botones: [],
        requiereInput: true,
        contexto: requiereCotizacion ? 'ESPERANDO_NOMBRE_COTIZACION' : 'ESPERANDO_NOMBRE_PRESUPUESTO',
        datosAcumulados: { carrito: datosCliente.items } 
      };

    case 'DERIVAR_HUMANO':
      return {
        respuesta: "Para derivar tu consulta a un representante, por favor decime tu *Nombre*.",
        botones: [],
        requiereInput: true,
        contexto: 'ESPERANDO_NOMBRE_HUMANO'
      };

    case 'ENVIAR_DATOS':
      if (!datosCliente || !datosCliente.texto) {
        return { respuesta: "Por favor, ingresá el dato.", requiereInput: true, contexto: contextoActual };
      }

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

      if (contextoActual?.startsWith('ESPERANDO_TELEFONO_')) {
        const telefonoIngresado = datosCliente.texto;
        const nombreGuardado = datosCliente.datosAcumulados?.nombre || 'Cliente';
        const flujoDestino = contextoActual.split('ESPERANDO_TELEFONO_')[1];
        const carrito = datosCliente.datosAcumulados?.carrito || [];

        let descripcionConsulta = '';
        if (flujoDestino === 'HUMANO') {
          descripcionConsulta = 'El cliente solicita atención personalizada y derivación a un representante.';
        } else {
          const listaProductos = carrito.map((item: any) => 
            `• ${item.cantidad}x ${item.nombre || 'Producto'} - ${item.precio ? `$${item.precio}` : '(Sin precio definido)'}`
          ).join('\n');
          
          descripcionConsulta = `Detalle de los productos solicitados:\n\n${listaProductos}`;
        }

        await prisma.consulta.create({
          data: {
            bot: {
              connect: { id: botId }
            },
            clienteNombre: nombreGuardado,
            clienteTelefono: telefonoIngresado,
            tipoConsulta: flujoDestino, // Guardará "HUMANO", "PRESUPUESTO" o "COTIZACION"
            canal: 'chatbot',
            asunto: flujoDestino === 'HUMANO' ? 'Derivación de Chatbot' : 'Solicitud de Presupuesto/Cotización',
            descripcion: descripcionConsulta,
          }
        });

        await enviarEventosQueue({
          botId, sessionId, tipoUsuario: 'CLIENTE',
          eventos: [{ tipo: `LEAD_CAPTURADO_${flujoDestino}`, fecha: new Date().toISOString() }]
        });

        if (flujoDestino === 'HUMANO') {
          return {
            respuesta: bot?.derivacionAutomatica || `¡Listo ${nombreGuardado}! Tu consulta fue enviada a nuestro equipo. Nos contactaremos al ${telefonoIngresado}.`,
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

    case 'VOLVER_MENU':
      return {
        respuesta: "¿En qué más puedo ayudarte?",
        botones: [
          {
      id: 'btn_catalogo',
      texto: 'Ver Catálogo',
      accion: 'MOSTRAR_CATALOGO'
      },
      {
      id: 'btn_horarios',
      texto: 'Horarios de Atención',
      accion: 'MOSTRAR_HORARIOS'
      },
      {
      id: 'btn_faqs',
      texto: 'Preguntas Frecuentes',
      accion: 'MOSTRAR_FAQS'
      },
      {
      id: 'btn_atencion',
      texto: 'Atención Personalizada',
      accion: 'DERIVAR_HUMANO'
      }
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