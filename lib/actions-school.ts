"use server"

import { db } from "@/lib/db"
import {
  colegios,
  cursos,
  alumnos,
  apoderadoAlumno,
  cuotas,
  metasCurso,
  pagosCuota,
  user,
} from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { eq, and, desc, sql, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { signUp } from "@/lib/auth" // para crear cuentas de apoderados en el server

// --- COLEGIOS ---
export async function getColegios() {
  return db
    .select()
    .from(colegios)
    .orderBy(desc(colegios.createdAt))
}

export async function createColegio(data: {
  nombre: string
  rut: string
  direccion?: string
  comuna?: string
  region?: string
  contacto?: string
  estado?: string
}) {
  if (!data.nombre.trim() || !data.rut.trim()) {
    throw new Error("Nombre y RUT del colegio son obligatorios")
  }

  const [newC] = await db
    .insert(colegios)
    .values({
      nombre: data.nombre.trim(),
      rut: data.rut.trim(),
      direccion: data.direccion?.trim() || null,
      comuna: data.comuna?.trim() || null,
      region: data.region?.trim() || null,
      contacto: data.contacto?.trim() || null,
      estado: data.estado || "activo",
    })
    .returning()

  revalidatePath("/admin/colegios")
  return newC
}

export async function updateColegio(
  id: number,
  data: {
    nombre: string
    rut: string
    direccion?: string
    comuna?: string
    region?: string
    contacto?: string
    estado?: string
  }
) {
  const [updated] = await db
    .update(colegios)
    .set({
      nombre: data.nombre.trim(),
      rut: data.rut.trim(),
      direccion: data.direccion?.trim() || null,
      comuna: data.comuna?.trim() || null,
      region: data.region?.trim() || null,
      contacto: data.contacto?.trim() || null,
      estado: data.estado || "activo",
    })
    .where(eq(colegios.id, id))
    .returning()

  revalidatePath("/admin/colegios")
  return updated
}

// --- CURSOS ---
export async function getCursos() {
  // Retorna cursos con información del colegio
  return db
    .select({
      id: cursos.id,
      nivel: cursos.nivel,
      nombre: cursos.nombre,
      profesorJefe: cursos.profesorJefe,
      directiva: cursos.directiva,
      anio: cursos.anio,
      activo: cursos.activo,
      colegioId: cursos.colegioId,
      colegioNombre: colegios.nombre,
    })
    .from(cursos)
    .innerJoin(colegios, eq(cursos.colegioId, colegios.id))
    .orderBy(desc(cursos.anio), cursos.nivel)
}

export async function createCurso(data: {
  colegioId: number
  anio: number
  nivel: string
  nombre: string
  profesorJefe?: string
  directiva?: string
}) {
  if (!data.colegioId || !data.nivel || !data.nombre) {
    throw new Error("Colegio, nivel y nombre de curso son obligatorios")
  }

  const [newCurso] = await db
    .insert(cursos)
    .values({
      colegioId: data.colegioId,
      anio: data.anio || new Date().getFullYear(),
      nivel: data.nivel.trim(),
      nombre: data.nombre.trim(),
      profesorJefe: data.profesorJefe?.trim() || null,
      directiva: data.directiva?.trim() || null,
      activo: true,
    })
    .returning()

  revalidatePath("/admin/cursos")
  return newCurso
}

// --- ALUMNOS ---
export async function getAlumnos() {
  return db
    .select({
      id: alumnos.id,
      nombreCompleto: alumnos.nombreCompleto,
      run: alumnos.run,
      fechaNacimiento: alumnos.fechaNacimiento,
      activo: alumnos.activo,
      colegioId: alumnos.colegioId,
      colegioNombre: colegios.nombre,
      cursoId: alumnos.cursoId,
      cursoNivel: cursos.nivel,
      cursoNombre: cursos.nombre,
      cursoAnio: cursos.anio,
    })
    .from(alumnos)
    .innerJoin(colegios, eq(alumnos.colegioId, colegios.id))
    .innerJoin(cursos, eq(alumnos.cursoId, cursos.id))
    .orderBy(alumnos.nombreCompleto)
}

export async function createAlumno(data: {
  nombreCompleto: string
  run: string
  fechaNacimiento?: string
  colegioId: number
  cursoId: number
}) {
  if (!data.nombreCompleto.trim() || !data.run.trim() || !data.colegioId || !data.cursoId) {
    throw new Error("Todos los campos requeridos para el alumno deben ser completados")
  }

  const runClean = data.run.trim()

  const [newAlumno] = await db
    .insert(alumnos)
    .values({
      id: runClean, // RUN como ID primario
      nombreCompleto: data.nombreCompleto.trim(),
      run: runClean,
      fechaNacimiento: data.fechaNacimiento || null,
      colegioId: data.colegioId,
      cursoId: data.cursoId,
      activo: true,
    })
    .returning()

  revalidatePath("/admin/alumnos")
  return newAlumno
}

// --- APODERADOS ---
export async function getApoderados() {
  return db
    .select()
    .from(user)
    .where(eq(user.role, "apoderado"))
    .orderBy(user.name)
}

export async function createApoderado(data: {
  name: string
  email: string
  role?: string
}) {
  // Para registrar el apoderado, el administrador creará un registro de usuario básico.
  // Nota: En un sistema de auth real, se le envía invitación por email. 
  // Aquí podemos registrar el registro de usuario directamente en la base de datos con Drizzle.
  if (!data.name.trim() || !data.email.trim()) {
    throw new Error("Nombre y correo del apoderado son requeridos")
  }

  // Generamos un ID aleatorio para el usuario
  const randId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const nowMs = Date.now()

  const [newU] = await db
    .insert(user)
    .values({
      id: randId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      emailVerified: false,
      role: data.role || "apoderado",
    })
    .returning()

  revalidatePath("/admin/apoderados")
  return newU
}

export async function vincularApoderadoAlumno(data: {
  apoderadoId: string
  alumnoId: string
  relacion: string
  responsablePago: boolean
}) {
  if (!data.apoderadoId || !data.alumnoId || !data.relacion) {
    throw new Error("Todos los datos de vinculación son requeridos")
  }

  const [link] = await db
    .insert(apoderadoAlumno)
    .values({
      apoderadoId: data.apoderadoId,
      alumnoId: data.alumnoId,
      relacion: data.relacion,
      responsablePago: data.responsablePago,
    })
    .returning()

  revalidatePath("/admin/apoderados")
  revalidatePath("/admin/alumnos")
  return link
}

export async function getAlumnosDeApoderado(apoderadoId: string) {
  return db
    .select({
      id: alumnos.id,
      nombreCompleto: alumnos.nombreCompleto,
      run: alumnos.run,
      colegioNombre: colegios.nombre,
      cursoNivel: cursos.nivel,
      cursoNombre: cursos.nombre,
      cursoAnio: cursos.anio,
      relacion: apoderadoAlumno.relacion,
      cursoId: alumnos.cursoId,
      colegioId: alumnos.colegioId,
    })
    .from(apoderadoAlumno)
    .innerJoin(alumnos, eq(apoderadoAlumno.alumnoId, alumnos.id))
    .innerJoin(colegios, eq(alumnos.colegioId, colegios.id))
    .innerJoin(cursos, eq(alumnos.cursoId, cursos.id))
    .where(eq(apoderadoAlumno.apoderadoId, apoderadoId))
}

// --- CUOTAS ---
export async function getCuotas() {
  return db
    .select({
      id: cuotas.id,
      nombre: cuotas.nombre,
      descripcion: cuotas.descripcion,
      monto: cuotas.monto,
      fechaVencimiento: cuotas.fechaVencimiento,
      tipo: cuotas.tipo,
      activa: cuotas.activa,
      cursoId: cuotas.cursoId,
      cursoNivel: cursos.nivel,
      cursoNombre: cursos.nombre,
      colegioNombre: colegios.nombre,
    })
    .from(cuotas)
    .innerJoin(cursos, eq(cuotas.cursoId, cursos.id))
    .innerJoin(colegios, eq(cursos.colegioId, colegios.id))
    .orderBy(desc(cuotas.fechaVencimiento))
}

export async function createCuota(data: {
  nombre: string
  descripcion?: string
  cursoId: number
  anio: number
  monto: number
  fechaVencimiento: string
  tipo: string
}) {
  if (!data.nombre.trim() || !data.cursoId || !data.monto || !data.fechaVencimiento || !data.tipo) {
    throw new Error("Por favor completa los campos requeridos de la cuota")
  }

  const [newCuota] = await db
    .insert(cuotas)
    .values({
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      cursoId: data.cursoId,
      anio: data.anio || new Date().getFullYear(),
      monto: Math.round(data.monto),
      fechaVencimiento: data.fechaVencimiento,
      tipo: data.tipo,
      activa: true,
    })
    .returning()

  revalidatePath("/admin/cuotas")
  revalidatePath("/colegio/dashboard")
  return newCuota
}

// --- METAS ---
export async function getMetas() {
  return db
    .select({
      id: metasCurso.id,
      nombre: metasCurso.nombre,
      descripcion: metasCurso.descripcion,
      objetivo: metasCurso.objetivo,
      recaudado: metasCurso.recaudado,
      activa: metasCurso.activa,
      cursoId: metasCurso.cursoId,
      cursoNivel: cursos.nivel,
      cursoNombre: cursos.nombre,
      colegioNombre: colegios.nombre,
    })
    .from(metasCurso)
    .innerJoin(cursos, eq(metasCurso.cursoId, cursos.id))
    .innerJoin(colegios, eq(cursos.colegioId, colegios.id))
    .orderBy(desc(metasCurso.createdAt))
}

export async function createMetaCurso(data: {
  cursoId: number
  nombre: string
  descripcion?: string
  objetivo: number
}) {
  if (!data.cursoId || !data.nombre.trim() || !data.objetivo) {
    throw new Error("Por favor completa los campos obligatorios de la meta")
  }

  const [newMeta] = await db
    .insert(metasCurso)
    .values({
      cursoId: data.cursoId,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      objetivo: Math.round(data.objetivo),
      recaudado: 0,
      activa: true,
    })
    .returning()

  revalidatePath("/admin/cuotas")
  return newMeta
}

// --- PAGOS Y CARRO DE COMPRAS ---

// Consulta cuotas pendientes de un alumno específico (las que no están en pagos_cuota con estado 'aprobado')
export async function getCuotasPendientesAlumno(alumnoId: string) {
  // Buscamos el curso del alumno
  const studentRows = await db
    .select({ cursoId: alumnos.cursoId })
    .from(alumnos)
    .where(eq(alumnos.id, alumnoId))
    .limit(1)

  if (studentRows.length === 0) return []
  const { cursoId } = studentRows[0]

  // Buscamos todas las cuotas de ese curso
  const allCuotas = await db
    .select()
    .from(cuotas)
    .where(and(eq(cuotas.cursoId, cursoId), eq(cuotas.activa, true)))

  // Buscamos los pagos aprobados ya realizados para este alumno
  const userPaid = await db
    .select({ cuotaId: pagosCuota.cuotaId })
    .from(pagosCuota)
    .where(and(eq(pagosCuota.alumnoId, alumnoId), eq(pagosCuota.estado, "aprobado")))

  const paidIds = new Set(userPaid.map((p) => p.cuotaId))

  // Filtramos las cuotas que NO han sido pagadas
  return allCuotas.filter((c) => !paidIds.has(c.id))
}

// Procesa el pago de una lista de cuotas en el carro de compras
export async function procesarPagoCuotas(data: {
  alumnoId: string
  cuotaIds: number[]
  metodoPago: string
}) {
  const apoderadoId = await getUserId()
  if (!data.alumnoId || !data.cuotaIds || data.cuotaIds.length === 0) {
    throw new Error("No hay cuotas seleccionadas para pagar")
  }

  // Obtener datos del alumno
  const [alumnoData] = await db
    .select()
    .from(alumnos)
    .where(eq(alumnos.id, data.alumnoId))
    .limit(1)

  if (!alumnoData) throw new Error("Alumno no encontrado")

  // Obtener cuotas a pagar de la DB
  const selectedCuotas = await db
    .select()
    .from(cuotas)
    .where(inArray(cuotas.id, data.cuotaIds))

  if (selectedCuotas.length === 0) throw new Error("Las cuotas no existen o no son válidas")

  const transaccionId = "TX-" + Math.random().toString(36).substring(2, 9).toUpperCase() + "-" + Date.now().toString().slice(-4)
  const fechaHoy = new Date().toISOString().substring(0, 10)
  const nowMs = Date.now()

  // Realizamos transacciones en Drizzle para insertar los registros de pago y actualizar metas del curso
  await db.transaction(async (tx) => {
    for (const c of selectedCuotas) {
      // 1. Insertar el pago
      await tx.insert(pagosCuota).values({
        apoderadoId,
        alumnoId: data.alumnoId,
        colegioId: alumnoData.colegioId,
        cursoId: alumnoData.cursoId,
        cuotaId: c.id,
        monto: c.monto,
        fecha: fechaHoy,
        transaccionId: `${transaccionId}-${c.id}`, // transaccion por cuota
        estado: "aprobado",
        metodoPago: data.metodoPago || "Webpay",
        createdAt: new Date(nowMs),
      })

      // 2. Si hay metas activas para este curso, actualizar el monto recaudado
      const metasActivas = await tx
        .select()
        .from(metasCurso)
        .where(and(eq(metasCurso.cursoId, alumnoData.cursoId), eq(metasCurso.activa, true)))

      for (const meta of metasActivas) {
        await tx
          .update(metasCurso)
          .set({
            recaudado: sql`recaudado + ${c.monto}`,
          })
          .where(eq(metasCurso.id, meta.id))
      }
    }
  })

  revalidatePath("/colegio/dashboard")
  revalidatePath("/colegio/comprobantes")
  revalidatePath("/admin/pagos")

  return { transaccionId, fecha: fechaHoy }
}

// Historial de comprobantes de pago de un apoderado
export async function getComprobantesPagoApoderado(apoderadoId: string) {
  return db
    .select({
      id: pagosCuota.id,
      monto: pagosCuota.monto,
      fecha: pagosCuota.fecha,
      transaccionId: pagosCuota.transaccionId,
      metodoPago: pagosCuota.metodoPago,
      cuotaNombre: cuotas.nombre,
      alumnoNombre: alumnos.nombreCompleto,
      colegioNombre: colegios.nombre,
      cursoNivel: cursos.nivel,
      cursoNombre: cursos.nombre,
    })
    .from(pagosCuota)
    .innerJoin(cuotas, eq(pagosCuota.cuotaId, cuotas.id))
    .innerJoin(alumnos, eq(pagosCuota.alumnoId, alumnos.id))
    .innerJoin(colegios, eq(pagosCuota.colegioId, colegios.id))
    .innerJoin(cursos, eq(pagosCuota.cursoId, cursos.id))
    .where(eq(pagosCuota.apoderadoId, apoderadoId))
    .orderBy(desc(pagosCuota.fecha))
}

// --- REPORTES Y TRANSACCIONES DEL ADMINISTRADOR ---

export async function getPagosReport(filters?: {
  colegioId?: number
  cursoId?: number
  fechaInicio?: string
  fechaFin?: string
}) {
  let query = db
    .select({
      id: pagosCuota.id,
      apoderadoNombre: user.name,
      alumnoNombre: alumnos.nombreCompleto,
      colegioNombre: colegios.nombre,
      cursoNivel: cursos.nivel,
      cursoNombre: cursos.nombre,
      cuotaNombre: cuotas.nombre,
      monto: pagosCuota.monto,
      fecha: pagosCuota.fecha,
      transaccionId: pagosCuota.transaccionId,
      estado: pagosCuota.estado,
      metodoPago: pagosCuota.metodoPago,
    })
    .from(pagosCuota)
    .innerJoin(user, eq(pagosCuota.apoderadoId, user.id))
    .innerJoin(alumnos, eq(pagosCuota.alumnoId, alumnos.id))
    .innerJoin(colegios, eq(pagosCuota.colegioId, colegios.id))
    .innerJoin(cursos, eq(pagosCuota.cursoId, cursos.id))
    .innerJoin(cuotas, eq(pagosCuota.cuotaId, cuotas.id))
    .$dynamic()

  const conditions = []

  if (filters?.colegioId) {
    conditions.push(eq(pagosCuota.colegioId, filters.colegioId))
  }
  if (filters?.cursoId) {
    conditions.push(eq(pagosCuota.cursoId, filters.cursoId))
  }
  if (filters?.fechaInicio) {
    conditions.push(sql`${pagosCuota.fecha} >= ${filters.fechaInicio}`)
  }
  if (filters?.fechaFin) {
    conditions.push(sql`${pagosCuota.fecha} <= ${filters.fechaFin}`)
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  return query.orderBy(desc(pagosCuota.fecha))
}
