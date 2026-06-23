import { z } from 'zod';

export const updateBotSchema = z.object({
  activo: z.boolean().optional(),

  nombreNegocio: z
    .string()
    .trim()
    .min(1, { error: 'El nombre del negocio no puede estar vacío' })
    .max(150, { error: 'El nombre del negocio no puede superar los 150 caracteres' })
    .optional(),

  logoUrl: z
    .url({ error: 'La URL del logo no es válida' })
    .optional()
    .or(z.literal('')), // permite string vacío para borrar el logo

  mensajeBienvenida: z
    .string()
    .trim()
    .max(500, { error: 'El mensaje de bienvenida no puede superar los 500 caracteres' })
    .optional(),

  mensajeFueraHorario: z
    .string()
    .trim()
    .max(500, { error: 'El mensaje fuera de horario no puede superar los 500 caracteres' })
    .optional(),

  derivacionAutomatica: z.boolean().optional(),
});

export type UpdateBotInput = z.infer<typeof updateBotSchema>;