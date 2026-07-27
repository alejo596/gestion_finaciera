import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import * as schema from "./schema"

// Usar local.db como base de datos por defecto si DATABASE_URL no está configurada
const connectionString = process.env.DATABASE_URL || "file:local.db"

export const client = createClient({
  url: connectionString,
})

export const db = drizzle(client, { schema })
export const pool = client // para mantener compatibilidad si algún archivo lo importa como pool
export const connection = client
