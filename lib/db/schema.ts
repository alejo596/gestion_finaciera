import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

// --- Better Auth required tables for SQLite -------------------------------------------
export const familias = sqliteTable("familias", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  estado: text("estado").notNull().default("activo"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  // Roles: "webmaster" | "admin_colegio" | "admin_curso" | "apoderado" | "admin_condominio" | "copropietario" | "invitado"
  role: text("role").notNull().default("apoderado"),
  familyId: text("familyId").references(() => familias.id, { onDelete: "set null" }),
  status: text("status").notNull().default("activo"), // "activo" | "cambio_obligatorio"
  tempPasswordExpiresAt: integer("tempPasswordExpiresAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

// --- MÓDULO DE GESTIÓN DE CUOTAS ESCOLARES -------------------------------------------

export const colegios = sqliteTable("colegios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  rut: text("rut").notNull().unique(),
  direccion: text("direccion"),
  comuna: text("comuna"),
  region: text("region"),
  contacto: text("contacto"),
  estado: text("estado").notNull().default("activo"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const cursos = sqliteTable("cursos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  colegioId: integer("colegioId")
    .notNull()
    .references(() => colegios.id, { onDelete: "cascade" }),
  anio: integer("anio").notNull(),
  nivel: text("nivel").notNull(),
  nombre: text("nombre").notNull(),
  profesorJefe: text("profesorJefe"),
  directiva: text("directiva"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const alumnos = sqliteTable("alumnos", {
  id: text("id").primaryKey(),
  nombreCompleto: text("nombreCompleto").notNull(),
  run: text("run").notNull().unique(),
  fechaNacimiento: text("fechaNacimiento"),
  colegioId: integer("colegioId")
    .notNull()
    .references(() => colegios.id),
  cursoId: integer("cursoId")
    .notNull()
    .references(() => cursos.id),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const apoderadoAlumno = sqliteTable("apoderado_alumno", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  apoderadoId: text("apoderadoId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  alumnoId: text("alumnoId")
    .notNull()
    .references(() => alumnos.id, { onDelete: "cascade" }),
  relacion: text("relacion").notNull(),
  responsablePago: integer("responsablePago", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const cuotas = sqliteTable("cuotas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  cursoId: integer("cursoId")
    .notNull()
    .references(() => cursos.id, { onDelete: "cascade" }),
  anio: integer("anio").notNull(),
  monto: integer("monto").notNull(),
  fechaVencimiento: text("fechaVencimiento").notNull(),
  tipo: text("tipo").notNull(),
  activa: integer("activa", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const metasCurso = sqliteTable("metas_curso", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cursoId: integer("cursoId")
    .notNull()
    .references(() => cursos.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  objetivo: integer("objetivo").notNull(),
  recaudado: integer("recaudado").notNull().default(0),
  activa: integer("activa", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const pagosCuota = sqliteTable("pagos_cuota", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  apoderadoId: text("apoderadoId")
    .notNull()
    .references(() => user.id),
  alumnoId: text("alumnoId")
    .notNull()
    .references(() => alumnos.id),
  colegioId: integer("colegioId")
    .notNull()
    .references(() => colegios.id),
  cursoId: integer("cursoId")
    .notNull()
    .references(() => cursos.id),
  cuotaId: integer("cuotaId")
    .notNull()
    .references(() => cuotas.id),
  monto: integer("monto").notNull(),
  fecha: text("fecha").notNull(),
  transaccionId: text("transaccionId").notNull().unique(),
  estado: text("estado").notNull().default("aprobado"),
  metodoPago: text("metodoPago").notNull().default("Webpay"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

// Egresos / Gastos de Curso (¿En qué se gasta la recaudación de cuotas?)
export const egresosCurso = sqliteTable("egresos_curso", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cursoId: integer("cursoId")
    .notNull()
    .references(() => cursos.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  monto: integer("monto").notNull(),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  comprobanteUrl: text("comprobanteUrl"), // Factura/boleta digital
  observaciones: text("observaciones"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

// --- MÓDULO DE GESTIÓN FINANCIERA DEL HOGAR -------------------------------------------

export const categoriasGastos = sqliteTable("categorias_gastos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  nombre: text("nombre").notNull(),
  color: text("color").notNull().default("#64748b"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const ingresosHogar = sqliteTable("ingresos_hogar", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  descripcion: text("descripcion").notNull(),
  monto: integer("monto").notNull(),
  fuente: text("fuente"),
  fecha: text("fecha").notNull(),
  periodicidad: text("periodicidad").notNull().default("único"),
  responsable: text("responsable"),
  observaciones: text("observaciones"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const gastosHogar = sqliteTable("gastos_hogar", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  categoriaId: integer("categoriaId")
    .references(() => categoriasGastos.id, { onDelete: "set null" }),
  descripcion: text("descripcion").notNull(),
  monto: integer("monto").notNull(),
  fechaInicio: text("fechaInicio").notNull(),
  fechaVencimiento: text("fechaVencimiento"),
  periodicidad: text("periodicidad").notNull().default("único"),
  estado: text("estado").notNull().default("pendiente"),
  metodoPago: text("metodoPago").notNull().default("Efectivo"),
  observaciones: text("observaciones"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const presupuestosAlimentacion = sqliteTable("presupuestos_alimentacion", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  anio: integer("anio").notNull(),
  mes: integer("mes").notNull(),
  montoPresupuestado: integer("montoPresupuestado").notNull(),
  fechaInicio: text("fechaInicio").notNull(),
  fechaRenovacion: text("fechaRenovacion").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const gastosAlimentacion = sqliteTable("gastos_alimentacion", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId").notNull(),
  descripcion: text("descripcion").notNull(),
  monto: integer("monto").notNull(),
  categoria: text("categoria").notNull().default("Supermercado"),
  lugar: text("lugar"),
  fecha: text("fecha").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

// --- MÓDULO DE GESTIÓN DE CONDOMINIOS (GASTOS COMUNES) ---------------------------------

// Tabla de Departamentos
export const departamentos = sqliteTable("departamentos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  numero: text("numero").notNull(), // Ej: "101"
  bloque: text("bloque"), // Ej: "Torre A"
  copropietarioId: text("copropietarioId")
    .references(() => user.id, { onDelete: "set null" }), // Copropietario a cargo
  prorrateo: integer("prorrateo").notNull().default(100), // En centésimas, ej: 250 = 2.50% de copropiedad
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

// Tabla de Gastos Comunes emitidos por Departamento
export const gastosComunes = sqliteTable("gastos_comunes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  departamentoId: integer("departamentoId")
    .notNull()
    .references(() => departamentos.id, { onDelete: "cascade" }),
  mes: integer("mes").notNull(),
  anio: integer("anio").notNull(),
  monto: integer("monto").notNull(), // Monto calculado o fijo cobrado
  fechaVencimiento: text("fechaVencimiento").notNull(), // YYYY-MM-DD
  estado: text("estado").notNull().default("pendiente"), // "pendiente" | "pagado" | "vencido"
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

// Tabla de Egresos generales de Condominio (en qué se invierte el dinero del edificio)
export const gastosCondominio = sqliteTable("gastos_condominio", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  descripcion: text("descripcion").notNull(),
  monto: integer("monto").notNull(),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  categoria: text("categoria").notNull().default("Mantenimiento"), // "Mantenimiento" | "Conserjería" | "Áreas Verdes" | "Administración" | "Servicios"
  observaciones: text("observaciones"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

// Tabla de Pagos de Gastos Comunes
export const pagosGastoComun = sqliteTable("pagos_gasto_comun", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gastoComunId: integer("gastoComunId")
    .notNull()
    .references(() => gastosComunes.id),
  departamentoId: integer("departamentoId")
    .notNull()
    .references(() => departamentos.id),
  copropietarioId: text("copropietarioId")
    .notNull()
    .references(() => user.id),
  monto: integer("monto").notNull(),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  transaccionId: text("transaccionId").notNull().unique(),
  metodoPago: text("metodoPago").notNull().default("Webpay"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const cursoAdmins = sqliteTable("curso_admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  colegioId: integer("colegioId")
    .notNull()
    .references(() => colegios.id, { onDelete: "cascade" }),
  cursoId: integer("cursoId")
    .notNull()
    .references(() => cursos.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const invitaciones = sqliteTable("invitaciones", {
  id: text("id").primaryKey(), // Token unico
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tempPassword: text("tempPassword").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  usedAt: integer("usedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})

export const loginAttempts = sqliteTable("login_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  exitoso: integer("exitoso", { mode: "boolean" }).notNull().default(false),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`),
})
