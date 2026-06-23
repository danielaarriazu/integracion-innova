import { Router } from 'express';
import { changePassword, deleteUser } from '../controllers/user.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validator.middleware';
import { changePasswordSchema , deleteAccountSchema } from '../schema/user.schema';

const router = Router();

// Endpoint para cambiar la contraseña (POST /api/user/change-password)
router.post('/change-password', verificarToken, validate(changePasswordSchema), changePassword);

// Endpoint para el falso eliminar (DELETE /api/user/delete-account)
router.delete('/delete-account', verificarToken, validate(deleteAccountSchema), deleteUser);

export default router;