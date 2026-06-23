import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';


export const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errores = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        error: 'Los datos enviados no son válidos',
        detalles: errores,
      });
      return;
    }

    req.body = result.data;
    next();
  };


function formatZodErrors(error: ZodError): Array<{ campo: string; mensaje: string }> {
  return error.issues.map((e) => ({
    campo: e.path.join('.') || 'body',
    mensaje: e.message,
  }));
}