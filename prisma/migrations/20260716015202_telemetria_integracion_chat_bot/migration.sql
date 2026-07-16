-- CreateTable
CREATE TABLE "eventos_telemetry" (
    "id" TEXT NOT NULL,
    "botId" TEXT,
    "sessionId" TEXT NOT NULL,
    "tipoUsuario" TEXT NOT NULL DEFAULT 'ANONIMO',
    "usuarioId" TEXT,
    "ip" TEXT NOT NULL DEFAULT 'desconocida',
    "dispositivo" TEXT NOT NULL DEFAULT 'desconocido',
    "fechaServidor" TIMESTAMP(3) NOT NULL,
    "eventos" JSONB NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_consulta" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulta" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estadoConsultaId" TEXT NOT NULL,
    "tipoConsulta" TEXT,
    "prioridad" TEXT,
    "canal" TEXT,
    "asunto" TEXT,
    "descripcion" TEXT,
    "derivadaA" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaCierre" TIMESTAMP(3),

    CONSTRAINT "consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensaje" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "mensajePadreId" TEXT,
    "emisor" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipoMensaje" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjunto" (
    "id" TEXT NOT NULL,
    "mensajeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT,
    "nombre" TEXT,
    "tamano" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "asignadoA" INTEGER,
    "nombre" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "empresa" TEXT,
    "motivoInteres" TEXT,
    "estado" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulta_producto" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER,
    "detalle" TEXT,

    CONSTRAINT "consulta_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulta_faq" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,
    "fechaConsulta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consulta_faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consulta_usuarioId_key" ON "consulta"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_consultaId_key" ON "lead"("consultaId");

-- AddForeignKey
ALTER TABLE "consulta" ADD CONSTRAINT "consulta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta" ADD CONSTRAINT "consulta_estadoConsultaId_fkey" FOREIGN KEY ("estadoConsultaId") REFERENCES "estado_consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_mensajePadreId_fkey" FOREIGN KEY ("mensajePadreId") REFERENCES "mensaje"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjunto" ADD CONSTRAINT "adjunto_mensajeId_fkey" FOREIGN KEY ("mensajeId") REFERENCES "mensaje"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_producto" ADD CONSTRAINT "consulta_producto_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_producto" ADD CONSTRAINT "consulta_producto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_faq" ADD CONSTRAINT "consulta_faq_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_faq" ADD CONSTRAINT "consulta_faq_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "Faq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
