const { createClient } = require("@libsql/client")

async function init() {
  const connectionString = process.env.DATABASE_URL || "file:local.db"
  const client = createClient({ url: connectionString })

  console.log(`Conectado a la base de datos SQLite (${connectionString}). Creando tablas si no existen...`)

  // 1a. Tabla Familias
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "familias" (
      "id" TEXT PRIMARY KEY,
      "nombre" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "estado" TEXT NOT NULL DEFAULT 'activo',
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL
    );
  `)

  // 1b. Tabla User (Better Auth)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" INTEGER NOT NULL DEFAULT 0,
      "image" TEXT,
      "role" TEXT NOT NULL DEFAULT 'apoderado',
      "familyId" TEXT REFERENCES "familias"("id") ON DELETE SET NULL,
      "status" TEXT NOT NULL DEFAULT 'activo',
      "tempPasswordExpiresAt" INTEGER,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL
    );
  `)

  // Alter tables for backward compatibility
  try {
    await client.execute('ALTER TABLE "user" ADD COLUMN "familyId" TEXT REFERENCES "familias"("id") ON DELETE SET NULL;');
  } catch (e) {}
  try {
    await client.execute('ALTER TABLE "user" ADD COLUMN "status" TEXT NOT NULL DEFAULT \'activo\';');
  } catch (e) {}
  try {
    await client.execute('ALTER TABLE "user" ADD COLUMN "tempPasswordExpiresAt" INTEGER;');
  } catch (e) {}

  // 2. Tabla Session (Better Auth)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expiresAt" INTEGER NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );
  `)

  // 3. Tabla Account (Better Auth)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" INTEGER,
      "refreshTokenExpiresAt" INTEGER,
      "scope" TEXT,
      "password" TEXT,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL
    );
  `)

  // 4. Tabla Verification (Better Auth)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expiresAt" INTEGER NOT NULL,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL
    );
  `)

  // 5. Tabla Colegios
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "colegios" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "nombre" TEXT NOT NULL,
      "rut" TEXT NOT NULL UNIQUE,
      "direccion" TEXT,
      "comuna" TEXT,
      "region" TEXT,
      "contacto" TEXT,
      "estado" TEXT NOT NULL DEFAULT 'activo',
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 6. Tabla Cursos
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "cursos" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "colegioId" INTEGER NOT NULL REFERENCES "colegios"("id") ON DELETE CASCADE,
      "anio" INTEGER NOT NULL,
      "nivel" TEXT NOT NULL,
      "nombre" TEXT NOT NULL,
      "profesorJefe" TEXT,
      "directiva" TEXT,
      "activo" INTEGER NOT NULL DEFAULT 1,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 7. Tabla Alumnos
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "alumnos" (
      "id" TEXT PRIMARY KEY,
      "nombreCompleto" TEXT NOT NULL,
      "run" TEXT NOT NULL UNIQUE,
      "fechaNacimiento" TEXT,
      "colegioId" INTEGER NOT NULL REFERENCES "colegios"("id"),
      "cursoId" INTEGER NOT NULL REFERENCES "cursos"("id"),
      "activo" INTEGER NOT NULL DEFAULT 1,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 8. Tabla intermedia Apoderado - Alumno
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "apoderado_alumno" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "apoderadoId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "alumnoId" TEXT NOT NULL REFERENCES "alumnos"("id") ON DELETE CASCADE,
      "relacion" TEXT NOT NULL,
      "responsablePago" INTEGER NOT NULL DEFAULT 1,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 9. Tabla Cuotas
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "cuotas" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "nombre" TEXT NOT NULL,
      "descripcion" TEXT,
      "cursoId" INTEGER NOT NULL REFERENCES "cursos"("id") ON DELETE CASCADE,
      "anio" INTEGER NOT NULL,
      "monto" INTEGER NOT NULL,
      "fechaVencimiento" TEXT NOT NULL,
      "tipo" TEXT NOT NULL,
      "activa" INTEGER NOT NULL DEFAULT 1,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 10. Tabla Metas del Curso
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "metas_curso" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "cursoId" INTEGER NOT NULL REFERENCES "cursos"("id") ON DELETE CASCADE,
      "nombre" TEXT NOT NULL,
      "descripcion" TEXT,
      "objetivo" INTEGER NOT NULL,
      "recaudado" INTEGER NOT NULL DEFAULT 0,
      "activa" INTEGER NOT NULL DEFAULT 1,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 11. Tabla Pagos de Cuotas
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "pagos_cuota" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "apoderadoId" TEXT NOT NULL REFERENCES "user"("id"),
      "alumnoId" TEXT NOT NULL REFERENCES "alumnos"("id"),
      "colegioId" INTEGER NOT NULL REFERENCES "colegios"("id"),
      "cursoId" INTEGER NOT NULL REFERENCES "cursos"("id"),
      "cuotaId" INTEGER NOT NULL REFERENCES "cuotas"("id"),
      "monto" INTEGER NOT NULL,
      "fecha" TEXT NOT NULL,
      "transaccionId" TEXT NOT NULL UNIQUE,
      "estado" TEXT NOT NULL DEFAULT 'aprobado',
      "metodoPago" TEXT NOT NULL DEFAULT 'Webpay',
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 12. Tabla Egresos de Curso
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "egresos_curso" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "cursoId" INTEGER NOT NULL REFERENCES "cursos"("id") ON DELETE CASCADE,
      "descripcion" TEXT NOT NULL,
      "monto" INTEGER NOT NULL,
      "fecha" TEXT NOT NULL,
      "comprobanteUrl" TEXT,
      "observaciones" TEXT,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 13. Categorías de Gastos
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "categorias_gastos" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" TEXT NOT NULL,
      "nombre" TEXT NOT NULL,
      "color" TEXT NOT NULL DEFAULT '#64748b',
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 14. Ingresos del Hogar
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "ingresos_hogar" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" TEXT NOT NULL,
      "descripcion" TEXT NOT NULL,
      "monto" INTEGER NOT NULL,
      "fuente" TEXT,
      "fecha" TEXT NOT NULL,
      "periodicidad" TEXT NOT NULL DEFAULT 'único',
      "responsable" TEXT,
      "observaciones" TEXT,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 15. Gastos del Hogar
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "gastos_hogar" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" TEXT NOT NULL,
      "categoriaId" INTEGER REFERENCES "categorias_gastos"("id") ON DELETE SET NULL,
      "descripcion" TEXT NOT NULL,
      "monto" INTEGER NOT NULL,
      "fechaInicio" TEXT NOT NULL,
      "fechaVencimiento" TEXT,
      "periodicidad" TEXT NOT NULL DEFAULT 'único',
      "estado" TEXT NOT NULL DEFAULT 'pendiente',
      "metodoPago" TEXT NOT NULL DEFAULT 'Efectivo',
      "observaciones" TEXT,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 16. Presupuestos de Alimentación
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "presupuestos_alimentacion" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" TEXT NOT NULL,
      "anio" INTEGER NOT NULL,
      "mes" INTEGER NOT NULL,
      "montoPresupuestado" INTEGER NOT NULL,
      "fechaInicio" TEXT NOT NULL,
      "fechaRenovacion" TEXT NOT NULL,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 17. Gastos de Alimentación
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "gastos_alimentacion" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" TEXT NOT NULL,
      "descripcion" TEXT NOT NULL,
      "monto" INTEGER NOT NULL,
      "categoria" TEXT NOT NULL DEFAULT 'Supermercado',
      "lugar" TEXT,
      "fecha" TEXT NOT NULL,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 18. Departamentos (Condominios)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "departamentos" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "numero" TEXT NOT NULL,
      "bloque" TEXT,
      "copropietarioId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
      "prorrateo" INTEGER NOT NULL DEFAULT 100,
      "activo" INTEGER NOT NULL DEFAULT 1,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 19. Gastos Comunes (Condominios)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "gastos_comunes" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "departamentoId" INTEGER NOT NULL REFERENCES "departamentos"("id") ON DELETE CASCADE,
      "mes" INTEGER NOT NULL,
      "anio" INTEGER NOT NULL,
      "monto" INTEGER NOT NULL,
      "fechaVencimiento" TEXT NOT NULL,
      "estado" TEXT NOT NULL DEFAULT 'pendiente',
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 20. Gastos de Condominio (Egresos Condominio)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "gastos_condominio" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "descripcion" TEXT NOT NULL,
      "monto" INTEGER NOT NULL,
      "fecha" TEXT NOT NULL,
      "categoria" TEXT NOT NULL DEFAULT 'Mantenimiento',
      "observaciones" TEXT,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 21. Pagos de Gastos Comunes (Ingresos Condominio)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "pagos_gasto_comun" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "gastoComunId" INTEGER NOT NULL REFERENCES "gastos_comunes"("id"),
      "departamentoId" INTEGER NOT NULL REFERENCES "departamentos"("id"),
      "copropietarioId" TEXT NOT NULL REFERENCES "user"("id"),
      "monto" INTEGER NOT NULL,
      "fecha" TEXT NOT NULL,
      "transaccionId" TEXT NOT NULL UNIQUE,
      "metodoPago" TEXT NOT NULL DEFAULT 'Webpay',
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 22. Curso Admins
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "curso_admins" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "colegioId" INTEGER NOT NULL REFERENCES "colegios"("id") ON DELETE CASCADE,
      "cursoId" INTEGER NOT NULL REFERENCES "cursos"("id") ON DELETE CASCADE,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 23. Invitaciones
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "invitaciones" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "email" TEXT NOT NULL,
      "tempPassword" TEXT NOT NULL,
      "expiresAt" INTEGER NOT NULL,
      "usedAt" INTEGER,
      "createdAt" INTEGER NOT NULL
    );
  `)

  // 24. Login Attempts
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "login_attempts" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "email" TEXT NOT NULL,
      "exitoso" INTEGER NOT NULL DEFAULT 0,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "createdAt" INTEGER NOT NULL
    );
  `)

  console.log("¡Tablas SQLite para Gestión Familiar, Colegios y Condominios inicializadas con éxito!");
}

init().catch((err) => {
  console.error("Error al inicializar la base de datos:", err)
  process.exit(1)
})
