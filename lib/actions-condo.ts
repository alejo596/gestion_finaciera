"use server"

import { db } from "@/lib/db"
import {
  departamentos,
  gastosComunes,
  pagosGastoComun,
  gastosCondominio,
  user,
} from "@/lib/db/schema"
import { getUserId } from "@/lib/session"
import { eq, and, desc, sql, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// --- DEPARTAMENTOS ---
export async function getDepartamentos() {
  return db
    .select({
      id: departamentos.id,
      numero: departamentos.numero,
      bloque: departamentos.bloque,
      copropietarioId: departamentos.copropietarioId,
      copropietarioNombre: user.name,
      copropietarioEmail: user.email,
      prorrateo: departamentos.prorrateo,
      activo: departamentos.activo,
    })
    .from(departamentos)
    .leftJoin(user, eq(departamentos.copropietarioId, user.id))
    .orderBy(departamentos.bloque, departamentos.numero)
}

export async function createDepartamento(data: {
  numero: string
  bloque?: string
  copropietarioId?: string
  prorrateo: number // en centésimas, ej: 250 para 2.50%
}) {
  if (!data.numero.trim()) {
    throw new Error("Número de departamento es obligatorio")
  }

  const [newDept] = await db
    .insert(departamentos)
    .values({
      numero: data.numero.trim(),
      bloque: data.bloque?.trim() || null,
      copropietarioId: data.copropietarioId || null,
      prorrateo: data.prorrateo || 100,
      activo: true,
    })
    .returning()

  revalidatePath("/admin/condominio/departamentos")
  return newDept
}

export async function getCopropietarios() {
  return db
    .select()
    .from(user)
    .where(eq(user.role, "copropietario"))
    .orderBy(user.name)
}

// --- EMISIÓN DE GASTOS COMUNES ---
export async function getGastosComunes() {
  return db
    .select({
      id: gastosComunes.id,
      departamentoId: gastosComunes.departamentoId,
      numero: departamentos.numero,
      bloque: departamentos.bloque,
      copropietarioNombre: user.name,
      mes: gastosComunes.mes,
      anio: gastosComunes.anio,
      monto: gastosComunes.monto,
      fechaVencimiento: gastosComunes.fechaVencimiento,
      estado: gastosComunes.estado,
    })
    .from(gastosComunes)
    .innerJoin(departamentos, eq(gastosComunes.departamentoId, departamentos.id))
    .leftJoin(user, eq(departamentos.copropietarioId, user.id))
    .orderBy(desc(gastosComunes.anio), desc(gastosComunes.mes), departamentos.numero)
}

export async function emitirGastosComunes(data: {
  mes: number
  anio: number
  montoBase: number // Gasto total a prorratear
  fechaVencimiento: string
}) {
  if (!data.mes || !data.anio || !data.montoBase || !data.fechaVencimiento) {
    throw new Error("Por favor completa los parámetros para la emisión de gastos comunes")
  }

  // Obtener todos los departamentos activos
  const activeDepts = await db
    .select()
    .from(departamentos)
    .where(eq(departamentos.activo, true))

  if (activeDepts.length === 0) {
    throw new Error("No hay departamentos activos registrados")
  }

  const nowMs = Date.now()

  // Emitimos gastos comunes uno por uno calculando prorrateo
  await db.transaction(async (tx) => {
    for (const dept of activeDepts) {
      // Cálculo: montoBase * (prorrateo / 10000)
      const montoProrrateado = Math.round(data.montoBase * (dept.prorrateo / 10000))

      // Verificar si ya se emitió para este departamento en este mes
      const exists = await tx
        .select()
        .from(gastosComunes)
        .where(
          and(
            eq(gastosComunes.departamentoId, dept.id),
            eq(gastosComunes.mes, data.mes),
            eq(gastosComunes.anio, data.anio)
          )
        )
        .limit(1)

      if (exists.length === 0) {
        await tx.insert(gastosComunes).values({
          departamentoId: dept.id,
          mes: data.mes,
          anio: data.anio,
          monto: montoProrrateado,
          fechaVencimiento: data.fechaVencimiento,
          estado: "pendiente",
          createdAt: new Date(nowMs),
        })
      }
    }
  })

  revalidatePath("/admin/condominio/gastos-comunes")
  revalidatePath("/condominio/dashboard")
}

// --- EGRESOS DEL CONDOMINIO ---
export async function getGastosCondominio() {
  return db
    .select()
    .from(gastosCondominio)
    .orderBy(desc(gastosCondominio.fecha))
}

export async function createGastoCondominio(data: {
  descripcion: string
  monto: number
  fecha: string
  categoria: string
  observaciones?: string
}) {
  if (!data.descripcion.trim() || !data.monto || !data.fecha) {
    throw new Error("Descripción, monto y fecha de egreso son obligatorios")
  }

  const [newExp] = await db
    .insert(gastosCondominio)
    .values({
      descripcion: data.descripcion.trim(),
      monto: Math.round(data.monto),
      fecha: data.fecha,
      categoria: data.categoria,
      observaciones: data.observaciones?.trim() || null,
    })
    .returning()

  revalidatePath("/admin/condominio/gastos-comunes")
  revalidatePath("/condominio/dashboard")
  return newExp
}

// --- PAGOS DEL RESIDENTE ---
export async function getGastosComunesPendientesCopropietario(copropietarioId: string) {
  return db
    .select({
      id: gastosComunes.id,
      mes: gastosComunes.mes,
      anio: gastosComunes.anio,
      monto: gastosComunes.monto,
      fechaVencimiento: gastosComunes.fechaVencimiento,
      departamentoId: gastosComunes.departamentoId,
      numero: departamentos.numero,
      bloque: departamentos.bloque,
    })
    .from(gastosComunes)
    .innerJoin(departamentos, eq(gastosComunes.departamentoId, departamentos.id))
    .where(
      and(
        eq(departamentos.copropietarioId, copropietarioId),
        eq(gastosComunes.estado, "pendiente")
      )
    )
    .orderBy(gastosComunes.anio, gastosComunes.mes)
}

export async function getComprobantesPagoCondominio(copropietarioId: string) {
  return db
    .select({
      id: pagosGastoComun.id,
      monto: pagosGastoComun.monto,
      fecha: pagosGastoComun.fecha,
      transaccionId: pagosGastoComun.transaccionId,
      metodoPago: pagosGastoComun.metodoPago,
      mes: gastosComunes.mes,
      anio: gastosComunes.anio,
      numero: departamentos.numero,
      bloque: departamentos.bloque,
    })
    .from(pagosGastoComun)
    .innerJoin(gastosComunes, eq(pagosGastoComun.gastoComunId, gastosComunes.id))
    .innerJoin(departamentos, eq(pagosGastoComun.departamentoId, departamentos.id))
    .where(eq(pagosGastoComun.copropietarioId, copropietarioId))
    .orderBy(desc(pagosGastoComun.fecha))
}

export async function procesarPagoGastoComun(data: {
  gastoComunId: number
  departamentoId: number
  monto: number
  metodoPago: string
}) {
  const copropietarioId = await getUserId()
  const transaccionId = "TX-COND-" + Math.random().toString(36).substring(2, 9).toUpperCase() + "-" + Date.now().toString().slice(-4)
  const fechaHoy = new Date().toISOString().substring(0, 10)
  const nowMs = Date.now()

  await db.transaction(async (tx) => {
    // 1. Insertar pago
    await tx.insert(pagosGastoComun).values({
      gastoComunId: data.gastoComunId,
      departamentoId: data.departamentoId,
      copropietarioId,
      monto: data.monto,
      fecha: fechaHoy,
      transaccionId,
      metodoPago: data.metodoPago,
      createdAt: new Date(nowMs),
    })

    // 2. Cambiar estado del gasto común a 'pagado'
    await tx
      .update(gastosComunes)
      .set({ estado: "pagado" })
      .where(eq(gastosComunes.id, data.gastoComunId))
  })

  revalidatePath("/condominio/dashboard")
  revalidatePath("/condominio/comprobantes")
  revalidatePath("/admin/condominio/pagos")

  return { transaccionId, fecha: fechaHoy }
}

export async function getPagosReportCondominio(filters?: {
  departamentoId?: number
  fechaInicio?: string
  fechaFin?: string
}) {
  let query = db
    .select({
      id: pagosGastoComun.id,
      copropietarioNombre: user.name,
      numero: departamentos.numero,
      bloque: departamentos.bloque,
      monto: pagosGastoComun.monto,
      fecha: pagosGastoComun.fecha,
      transaccionId: pagosGastoComun.transaccionId,
      metodoPago: pagosGastoComun.metodoPago,
      mesGastoComun: gastosComunes.mes,
      anioGastoComun: gastosComunes.anio,
    })
    .from(pagosGastoComun)
    .innerJoin(user, eq(pagosGastoComun.copropietarioId, user.id))
    .innerJoin(departamentos, eq(pagosGastoComun.departamentoId, departamentos.id))
    .innerJoin(gastosComunes, eq(pagosGastoComun.gastoComunId, gastosComunes.id))
    .$dynamic()

  const conditions = []

  if (filters?.departamentoId) {
    conditions.push(eq(pagosGastoComun.departamentoId, filters.departamentoId))
  }
  if (filters?.fechaInicio) {
    conditions.push(sql`${pagosGastoComun.fecha} >= ${filters.fechaInicio}`)
  }
  if (filters?.fechaFin) {
    conditions.push(sql`${pagosGastoComun.fecha} <= ${filters.fechaFin}`)
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  return query.orderBy(desc(pagosGastoComun.fecha))
}
