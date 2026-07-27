import { Client } from "pg"

async function init() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("Error: La variable de entorno DATABASE_URL no está configurada.")
    console.log("Por favor, crea un archivo .env.local o configúrala en tu sistema.")
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()

  console.log("Conectado a la base de datos Postgres. Creando tablas si no existen...")

  // Tabla User
  await client.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      "image" TEXT,
      "role" TEXT NOT NULL DEFAULT 'apoderado',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Tabla Session
  await client.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );
  `)

  // Tabla Account
  await client.query(`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP,
      "refreshTokenExpiresAt" TIMESTAMP,
      "scope" TEXT,
      "password" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Tabla Verification
  await client.query(`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Categorías de Gastos
  await client.query(`
    CREATE TABLE IF NOT EXISTS "categorias_gastos" (
      "id" SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "nombre" TEXT NOT NULL,
      "color" TEXT NOT NULL DEFAULT '#64748b',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Ingresos del Hogar
  await client.query(`
    CREATE TABLE IF NOT EXISTS "ingresos_hogar" (
      "id" SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "descripcion" TEXT NOT NULL,
      "monto" INTEGER NOT NULL,
      "fuente" TEXT,
      "fecha" DATE NOT NULL,
      "recurrente" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Gastos del Hogar
  await client.query(`
    CREATE TABLE IF NOT EXISTS "gastos_hogar" (
      "id" SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "categoriaId" INTEGER,
      "descripcion" TEXT NOT NULL,
      "monto" INTEGER NOT NULL,
      "fecha" DATE NOT NULL,
      "metodoPago" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Presupuestos de Alimentación
  await client.query(`
    CREATE TABLE IF NOT EXISTS "presupuestos_alimentacion" (
      "id" SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "anio" INTEGER NOT NULL,
      "mes" INTEGER NOT NULL,
      "montoPresupuestado" INTEGER NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  // Gastos de Alimentación
  await client.query(`
    CREATE TABLE IF NOT EXISTS "gastos_alimentacion" (
      "id" SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "descripcion" TEXT NOT NULL,
      "monto" INTEGER NOT NULL,
      "categoria" TEXT,
      "lugar" TEXT,
      "fecha" DATE NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  console.log("¡Base de datos inicializada correctamente!");
  await client.end()
}

init().catch((err) => {
  console.error("Error al inicializar la base de datos:", err)
  process.exit(1)
})
