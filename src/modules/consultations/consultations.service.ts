import prisma from '../../config/db';

// — Métodos del UML: getEstado(), cerrar(), derivar(agente) —

export const getEstado = async (consultaId: number) => {
  const consulta = await prisma.consulta.findUnique({
    where: { id: consultaId },
    include: { estadoConsulta: true },
  });
  return consulta?.estadoConsulta.nombre ?? null;
};

export const cerrar = async (consultaId: number) => {
  const estadoCerrada = await prisma.estadoConsulta.findFirst({ where: { nombre: 'cerrada' } });
  return prisma.consulta.update({
    where: { id: consultaId },
    data: { estadoConsultaId: estadoCerrada?.id ?? 5, fechaCierre: new Date() },
  });
};

export const derivar = async (consultaId: number, agente: string) => {
  const estadoDerivada = await prisma.estadoConsulta.findFirst({ where: { nombre: 'derivada' } });
  return prisma.consulta.update({
    where: { id: consultaId },
    data: { estadoConsultaId: estadoDerivada?.id ?? 4, derivadaA: agente },
  });
};

export const listarConsultas = async (usuarioId: number) => {
  return prisma.consulta.findMany({
    where: { usuarioId },
    include: { estadoConsulta: true },
    orderBy: { fechaCreacion: 'desc' },
  });
};

export const crearConsulta = async (data: {
  usuarioId: number;
  canal?: string;
  asunto?: string;
  descripcion?: string;
  tipoConsulta?: string;
  prioridad?: string;
}) => {
  try {
    const estadoNueva = await prisma.estadoConsulta.findFirst({ where: { nombre: 'nueva' } });
    return await prisma.consulta.create({
      data: { ...data, estadoConsultaId: estadoNueva?.id ?? 1 },
      include: { estadoConsulta: true },
    });
  } catch {
    return {
      id: Date.now(),
      usuarioId: data.usuarioId,
      estadoConsultaId: 1,
      estadoConsulta: { id: 1, nombre: 'nueva', descripcion: null, fechaCreacion: new Date() },
      canal: data.canal ?? 'web',
      asunto: data.asunto ?? null,
      descripcion: data.descripcion ?? null,
      tipoConsulta: data.tipoConsulta ?? null,
      prioridad: data.prioridad ?? null,
      derivadaA: null,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      fechaCierre: null,
      _mock: true,
    };
  }
};

export const obtenerConsulta = async (id: number) => {
  return prisma.consulta.findUnique({
    where: { id },
    include: { estadoConsulta: true, mensajes: true },
  });
};
