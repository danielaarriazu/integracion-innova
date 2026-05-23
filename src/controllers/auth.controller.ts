import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_por_defecto'; // OJO con esta clave!

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, businessName } = req.body;

    // 1. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // 2. Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Guardar en la base de datos
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        businessName,
        role: 'ADMIN',
      },
    });

    res.status(201).json({ message: 'PyME registrada con éxito', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al registrar' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Comparar la contraseña ingresada con el hash guardado
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Generar el Token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, businessName: user.businessName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al loguear' });
  }
};