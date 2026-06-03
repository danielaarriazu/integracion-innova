import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';

// — Métodos del UML: getId(), getNombre(), getEmail(), getRol(), isActivo() —

export const getId = (usuario: { id: number }) => usuario.id;
export const getNombre = (usuario: { nombre: string }) => usuario.nombre;
export const getEmail = (usuario: { email: string }) => usuario.email;
export const getRol = (usuario: { rol: string }) => usuario.rol;
export const isActivo = (usuario: { estado: string }) => usuario.estado === 'activo';

export const registrar = async (data: {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}) => {
  const existe = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (existe) throw new Error('El email ya está registrado');

  const hash = await bcrypt.hash(data.password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      password: hash,
      telefono: data.telefono,
      configuracionBot: {
        create: {
          mensajeBienvenida: `¡Hola! Bienvenido/a a ${data.nombre}. ¿En qué te puedo ayudar?`,
          activo: true,
        },
      },
    },
    select: { id: true, nombre: true, email: true, rol: true, estado: true, fechaRegistro: true },
  });

  return usuario;
};

export const login = async (data: { email: string; password: string }, ip?: string, userAgent?: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (!usuario) throw new Error('Credenciales inválidas');
  if (!isActivo(usuario)) throw new Error('Cuenta inactiva');

  const passwordOk = await bcrypt.compare(data.password, usuario.password);
  if (!passwordOk) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  await prisma.sesionUsuario.create({
    data: { usuarioId: usuario.id, token, ip, userAgent },
  });

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimaSesion: new Date() },
  });

  return {
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
  };
};
