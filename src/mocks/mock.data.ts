// Datos hardcodeados para pruebas sin base de datos
// Mismo patrón que keywords.service.ts — fallback cuando la DB no está disponible
//
// usuarioId 1 → Panadería García
// usuarioId 2 → Ferretería López
// usuarioId 3 → Ropa & Accesorios Mía (sin FAQs → activa el fallback de keywords)

export interface MockProducto {
  id: number;
  usuarioId: number;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  stock: number | null;
  imagenUrl: string | null;
  activo: boolean;
}

export interface MockFaq {
  id: number;
  categoriaId: number;
  pregunta: string;
  respuesta: string;
  keywords: string | null;
  activo: boolean;
  orden: number | null;
}

export interface MockCategoria {
  id: number;
  usuarioId: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  faqs: MockFaq[];
}

export interface MockConfig {
  id: number;
  usuarioId: number;
  mensajeBienvenida: string;
  mensajeFueraHorario: string;
  horarioAtencion: string;
  tono: string;
  menuInicial: string;
  derivacionAutomatica: boolean;
  activo: boolean;
}

interface MockEmprendedor {
  config: MockConfig;
  productos: MockProducto[];
  categorias: MockCategoria[];
}

const MOCK: Record<number, MockEmprendedor> = {
  // ─── Emprendedor 1 — Panadería García ───────────────────────────────────────
  1: {
    config: {
      id: 1,
      usuarioId: 1,
      mensajeBienvenida: '¡Hola! Bienvenido a Panadería García 🥐 ¿En qué te puedo ayudar?',
      mensajeFueraHorario: 'Gracias por escribirnos. Atendemos de lunes a sábado de 8 a 20hs. ¡Te respondemos en cuanto abramos!',
      horarioAtencion: '08:00-20:00',
      tono: 'amigable',
      menuInicial: '1. Ver catálogo\n2. Consultas frecuentes\n3. Hablar con nosotros',
      derivacionAutomatica: false,
      activo: true,
    },
    productos: [
      { id: 101, usuarioId: 1, nombre: 'Torta de chocolate', descripcion: 'Torta húmeda con ganache de chocolate, 1kg', precio: 4500, stock: 5, imagenUrl: null, activo: true },
      { id: 102, usuarioId: 1, nombre: 'Medialunas x12', descripcion: 'Medialunas de manteca artesanales, docena', precio: 1200, stock: 20, imagenUrl: null, activo: true },
      { id: 103, usuarioId: 1, nombre: 'Pan de campo', descripcion: 'Pan rústico de masa madre, 500g', precio: 800, stock: 10, imagenUrl: null, activo: true },
      { id: 104, usuarioId: 1, nombre: 'Facturas x6', descripcion: 'Surtido de facturas: cuernitos, vigilantes y bolas de fraile', precio: 900, stock: 15, imagenUrl: null, activo: true },
    ],
    categorias: [
      {
        id: 11, usuarioId: 1, nombre: 'Pedidos', descripcion: 'Información sobre cómo hacer pedidos', activo: true,
        faqs: [
          { id: 111, categoriaId: 11, pregunta: '¿Cómo hago un pedido?', respuesta: 'Podés hacer tu pedido por WhatsApp al +54 11 1234-5678 o directamente en el local. Para tortas necesitamos 48hs de anticipación.', keywords: 'pedido,encargar,pedir,torta,encargo', activo: true, orden: 1 },
          { id: 112, categoriaId: 11, pregunta: '¿Hacen tortas personalizadas?', respuesta: 'Sí, hacemos tortas con diseños personalizados. El precio varía según la complejidad. Consultanos por WhatsApp con la idea que tenés.', keywords: 'personalizada,diseño,decoracion,cumpleanos', activo: true, orden: 2 },
        ],
      },
      {
        id: 12, usuarioId: 1, nombre: 'Envíos', descripcion: 'Información de envíos y delivery', activo: true,
        faqs: [
          { id: 121, categoriaId: 12, pregunta: '¿Hacen envíos?', respuesta: 'Sí, hacemos envíos dentro de un radio de 5km del local. El costo es $500. Pedidos mayores a $3000 tienen envío gratis.', keywords: 'envio,delivery,mandan,llega,despacho,traen', activo: true, orden: 1 },
          { id: 122, categoriaId: 12, pregunta: '¿Cuánto tarda el envío?', respuesta: 'Los envíos se realizan el mismo día si el pedido se hace antes de las 16hs. Después de esa hora, al día siguiente.', keywords: 'tiempo,demora,tarda,cuando llega,horario envio', activo: true, orden: 2 },
        ],
      },
      {
        id: 13, usuarioId: 1, nombre: 'Pagos', descripcion: 'Métodos de pago aceptados', activo: true,
        faqs: [
          { id: 131, categoriaId: 13, pregunta: '¿Qué medios de pago aceptan?', respuesta: 'Aceptamos efectivo, transferencia bancaria y MercadoPago. No aceptamos tarjeta de crédito por el momento.', keywords: 'pago,efectivo,transferencia,mercadopago,tarjeta,como pago', activo: true, orden: 1 },
        ],
      },
    ],
  },

  // ─── Emprendedor 2 — Ferretería López ───────────────────────────────────────
  2: {
    config: {
      id: 2,
      usuarioId: 2,
      mensajeBienvenida: 'Bienvenido a Ferretería López. ¿En qué podemos asistirle?',
      mensajeFueraHorario: 'Nuestro horario de atención es lunes a viernes de 9 a 18hs y sábados de 9 a 13hs. Déjenos su consulta y le respondemos a la brevedad.',
      horarioAtencion: '09:00-18:00',
      tono: 'formal',
      menuInicial: '1. Ver productos\n2. Preguntas frecuentes\n3. Contactar asesor',
      derivacionAutomatica: true,
      activo: true,
    },
    productos: [
      { id: 201, usuarioId: 2, nombre: 'Pintura látex interior 4L', descripcion: 'Pintura látex lavable para interiores, blanco mate', precio: 8500, stock: 30, imagenUrl: null, activo: true },
      { id: 202, usuarioId: 2, nombre: 'Taladro percutor 500W', descripcion: 'Taladro percutor con cable, maletín incluido', precio: 22000, stock: 8, imagenUrl: null, activo: true },
      { id: 203, usuarioId: 2, nombre: 'Cinta métrica 5m', descripcion: 'Cinta métrica de acero con freno', precio: 1800, stock: 50, imagenUrl: null, activo: true },
      { id: 204, usuarioId: 2, nombre: 'Set tornillos madera x100', descripcion: 'Set de tornillos autorroscantes para madera, medidas surtidas', precio: 950, stock: 100, imagenUrl: null, activo: true },
      { id: 205, usuarioId: 2, nombre: 'Llave inglesa 10"', descripcion: 'Llave inglesa de acero cromado, apertura hasta 28mm', precio: 3200, stock: 15, imagenUrl: null, activo: true },
    ],
    categorias: [
      {
        id: 21, usuarioId: 2, nombre: 'Garantías', descripcion: null, activo: true,
        faqs: [
          { id: 211, categoriaId: 21, pregunta: '¿Qué garantía tienen las herramientas?', respuesta: 'Todas nuestras herramientas eléctricas tienen garantía de 12 meses contra defectos de fabricación. La garantía no cubre mal uso o golpes.', keywords: 'garantia,falla,roto,devolucion herramienta', activo: true, orden: 1 },
        ],
      },
      {
        id: 22, usuarioId: 2, nombre: 'Entregas', descripcion: null, activo: true,
        faqs: [
          { id: 221, categoriaId: 22, pregunta: '¿Realizan entregas a domicilio?', respuesta: 'Realizamos entregas en toda la ciudad. El costo varía según la distancia. Para pedidos superiores a $15.000 la entrega es sin cargo.', keywords: 'entrega,envio,domicilio,delivery,lleva,manda', activo: true, orden: 1 },
          { id: 222, categoriaId: 22, pregunta: '¿Cuál es el tiempo de entrega?', respuesta: 'Las entregas se realizan dentro de las 24-48 horas hábiles una vez confirmado el pago.', keywords: 'tiempo entrega,demora,cuando llega,plazo', activo: true, orden: 2 },
        ],
      },
      {
        id: 23, usuarioId: 2, nombre: 'Devoluciones', descripcion: null, activo: true,
        faqs: [
          { id: 231, categoriaId: 23, pregunta: '¿Puedo devolver un producto?', respuesta: 'Aceptamos devoluciones dentro de los 30 días con ticket de compra, siempre que el producto esté sin uso y en su embalaje original.', keywords: 'devolucion,cambio,devolver,cambiar,reembolso', activo: true, orden: 1 },
        ],
      },
    ],
  },

  // ─── Emprendedor 3 — Ropa & Accesorios Mía ──────────────────────────────────
  // Sin FAQs cargadas → el chatbot cae al motor de keywords hardcodeadas
  3: {
    config: {
      id: 3,
      usuarioId: 3,
      mensajeBienvenida: '¡Hola! Soy el asistente de Mía ✨ ¿Qué estás buscando hoy?',
      mensajeFueraHorario: 'Gracias por escribirnos, en este momento no estamos disponibles. Te respondemos pronto!',
      horarioAtencion: '10:00-21:00',
      tono: 'casual',
      menuInicial: '1. Ver ropa\n2. Ver accesorios\n3. Contacto',
      derivacionAutomatica: false,
      activo: true,
    },
    productos: [
      { id: 301, usuarioId: 3, nombre: 'Remera básica algodón', descripcion: 'Remera 100% algodón, talles S al XL, colores varios', precio: 3500, stock: 40, imagenUrl: null, activo: true },
      { id: 302, usuarioId: 3, nombre: 'Vestido floral verano', descripcion: 'Vestido midi con estampado floral, talles S al L', precio: 8900, stock: 12, imagenUrl: null, activo: true },
      { id: 303, usuarioId: 3, nombre: 'Zapatillas urbanas', descripcion: 'Zapatillas estilo urbano, talles 35 al 41', precio: 18500, stock: 7, imagenUrl: null, activo: true },
      { id: 304, usuarioId: 3, nombre: 'Cartera cuero eco', descripcion: 'Cartera de cuero ecológico con compartimentos', precio: 6200, stock: 20, imagenUrl: null, activo: true },
    ],
    categorias: [], // sin categorías → el chatbot usa keywords hardcodeadas como fallback
  },
};

export const getMockEmprendedor = (usuarioId: number): MockEmprendedor | null =>
  MOCK[usuarioId] ?? null;

export const getMockProductos = (usuarioId: number): MockProducto[] =>
  MOCK[usuarioId]?.productos ?? [];

export const getMockProducto = (id: number): MockProducto | null => {
  for (const emp of Object.values(MOCK)) {
    const p = emp.productos.find((p) => p.id === id);
    if (p) return p;
  }
  return null;
};

export const getMockCategorias = (usuarioId: number): MockCategoria[] =>
  MOCK[usuarioId]?.categorias ?? [];

export const getMockFaqsPorCategoria = (categoriaId: number): MockFaq[] => {
  for (const emp of Object.values(MOCK)) {
    const cat = emp.categorias.find((c) => c.id === categoriaId);
    if (cat) return cat.faqs.filter((f) => f.activo);
  }
  return [];
};

export const getMockFaqsTodas = (usuarioId: number): MockFaq[] =>
  MOCK[usuarioId]?.categorias.flatMap((c) => c.faqs.filter((f) => f.activo)) ?? [];

export const getMockConfig = (usuarioId: number): MockConfig | null =>
  MOCK[usuarioId]?.config ?? null;
