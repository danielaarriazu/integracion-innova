import { z } from 'zod';

const nombreCategoria = z
  .string({ error: 'El nombre de la categoría es obligatorio' })
  .trim()
  .min(1, { error: 'El nombre de la categoría no puede estar vacío' })
  .max(100, { error: 'El nombre no puede superar los 100 caracteres' });

export const createCategorySchema = z.object({
  nombre: nombreCategoria,
});

export const updateCategorySchema = z.object({
  nombre: nombreCategoria,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;