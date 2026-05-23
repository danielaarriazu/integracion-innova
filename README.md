# Chatbot InnovaLab - Backend

Este es el repositorio del backend para el MVP de la plataforma de chatbot y gestión de catálogos orientada a PyMEs. Desarrollado con una arquitectura robusta, escalable y con tipado estricto.

## Tecnologías utilizadas

- **Runtime:** Node.js (v24+)
- **Lenguaje:** TypeScript
- **Framework Web:** Express
- **ORM:** Prisma ORM (v5)
- **Base de Datos:** PostgreSQL (Alojada en la nube - Neon)
- **Autenticación:** JSON Web Tokens (JWT) & Bcrypt para encriptación de contraseñas
- **Herramientas de desarrollo:** TSX (TypeScript Execute)

##  Estructura del Proyecto

```text
├──  prisma/          # Esquemas de base de datos y modelos de Prisma
├──  src/
│   ├──  controllers/ # Lógica de negocio (Autenticación, etc.)
│   ├──  routes/      # Definición de endpoints y rutas de la API
│   └──  index.ts     # Punto de entrada del servidor Express
├──  .env             # Variables de entorno (Ignorado en Git)
└──  package.json     # Dependencias y scripts del proyecto

## Configuracion del entorno

Clona el repositorio.

Instala las dependencias del proyecto:
Bash
npm install

Configura tu archivo .env en la raíz con tus credenciales de PostgreSQL y tu clave secreta para JWT.
Envía las tablas a tu base de datos vacía y Genera el cliente local de Prisma:
Bash
npx prisma db push
npm install prisma@5 @prisma/client@5

Levanta el servidor en modo desarrollo:
Bash
npm run dev

Endpoints Disponibles (Funcionales :D)
Autenticación (/api/auth)
POST /register: Registra una nueva cuenta de PyME/Emprendedor.

POST /login: Autentica al usuario y retorna el Token JWT de sesión.