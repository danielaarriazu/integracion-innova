import prisma from '../lib/prisma';

export const obtenerFAQsPublicas = async (slug: string) => {
  const bot = await prisma.configuracionBot.findUnique({
    where: { slug },
  });

  if (!bot || !bot.activo) {
    throw new Error('BOT_NOT_FOUND');
  }

  const faqs = await prisma.faq.findMany({
    where: { 
      botId: bot.id, 
      activa: true 
    },
    include: { 
      categoria: { select: { id: true, nombre: true } } 
    },
    orderBy: { pregunta: 'asc' }, 
  });

  return faqs;
};