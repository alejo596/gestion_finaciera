"use server"

import { db } from "@/lib/db"
import {
  categoriasGastos,
  ingresosHogar,
  gastosHogar,
  presupuestosAlimentacion,
  gastosAlimentacion,
  user,
} from "@/lib/db/schema"
import { getUserId, requireUser } from "@/lib/session"
import { eq, and, desc, sql, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function getAllowedUserIds() {
  const currentUser = await requireUser()
  if (currentUser.familyId) {
    const familyMembers = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.familyId, currentUser.familyId))
    return familyMembers.map((m) => m.id)
  }
  return [currentUser.id]
}

// --- CATEGORÍAS ---
export async function getCategorias() {
  const userIds = await getAllowedUserIds()
  return db
    .select()
    .from(categoriasGastos)
    .where(inArray(categoriasGastos.userId, userIds))
    .orderBy(desc(categoriasGastos.createdAt))
}

export async function createCategoria(nombre: string, color: string) {
  const userId = await getUserId()
  if (!nombre.trim()) throw new Error("El nombre no puede estar vacío")
  
  const [newCategory] = await db
    .insert(categoriasGastos)
    .values({
      userId,
      nombre: nombre.trim(),
      color: color || "#64748b",
    })
    .returning()

  revalidatePath("/gastos")
  revalidatePath("/dashboard")
  return newCategory
}

export async function deleteCategoria(id: number) {
  const userIds = await getAllowedUserIds()
  
  await db
    .update(gastosHogar)
    .set({ categoriaId: null })
    .where(and(inArray(gastosHogar.userId, userIds), eq(gastosHogar.categoriaId, id)))

  await db
    .delete(categoriasGastos)
    .where(and(inArray(categoriasGastos.userId, userIds), eq(categoriasGastos.id, id)))

  revalidatePath("/gastos")
  revalidatePath("/dashboard")
}

// --- GASTOS HOGAR ---
export async function getGastos() {
  const userIds = await getAllowedUserIds()
  return db
    .select()
    .from(gastosHogar)
    .where(inArray(gastosHogar.userId, userIds))
    .orderBy(desc(gastosHogar.fechaInicio))
}

export async function createGasto(data: {
  categoriaId: number | null
  descripcion: string
  monto: number
  fechaInicio?: string
  fecha?: string
  fechaVencimiento?: string
  periodicidad?: string
  estado?: string
  metodoPago?: string
  observaciones?: string
}) {
  const userId = await getUserId()
  const fInicio = data.fechaInicio || data.fecha
  if (!data.descripcion.trim()) throw new Error("La descripción es obligatoria")
  if (data.monto <= 0) throw new Error("El monto debe ser mayor que cero")
  if (!fInicio) throw new Error("La fecha de inicio es obligatoria")

  const [newGasto] = await db
    .insert(gastosHogar)
    .values({
      userId,
      categoriaId: data.categoriaId,
      descripcion: data.descripcion.trim(),
      monto: Math.round(data.monto),
      fechaInicio: fInicio,
      fechaVencimiento: data.fechaVencimiento || null,
      periodicidad: data.periodicidad || "único",
      estado: data.estado || "pendiente",
      metodoPago: data.metodoPago || "Efectivo",
      observaciones: data.observaciones?.trim() || null,
    })
    .returning()

  revalidatePath("/gastos")
  revalidatePath("/dashboard")
  return newGasto
}

export async function deleteGasto(id: number) {
  const userIds = await getAllowedUserIds()
  await db
    .delete(gastosHogar)
    .where(and(inArray(gastosHogar.userId, userIds), eq(gastosHogar.id, id)))

  revalidatePath("/gastos")
  revalidatePath("/dashboard")
}

export async function updateGasto(id: number, data: {
  categoriaId: number | null
  descripcion: string
  monto: number
  fechaInicio?: string
  fecha?: string
  fechaVencimiento?: string
  periodicidad?: string
  estado?: string
  metodoPago?: string
  observaciones?: string
}) {
  const userIds = await getAllowedUserIds()
  const fInicio = data.fechaInicio || data.fecha
  if (!data.descripcion.trim()) throw new Error("La descripción es obligatoria")
  if (data.monto <= 0) throw new Error("El monto debe ser mayor que cero")
  if (!fInicio) throw new Error("La fecha de inicio es obligatoria")

  const [updated] = await db
    .update(gastosHogar)
    .set({
      categoriaId: data.categoriaId,
      descripcion: data.descripcion.trim(),
      monto: Math.round(data.monto),
      fechaInicio: fInicio,
      fechaVencimiento: data.fechaVencimiento || null,
      periodicidad: data.periodicidad || "único",
      estado: data.estado || "pendiente",
      metodoPago: data.metodoPago || "Efectivo",
      observaciones: data.observaciones?.trim() || null,
    })
    .where(and(inArray(gastosHogar.userId, userIds), eq(gastosHogar.id, id)))
    .returning()

  revalidatePath("/gastos")
  revalidatePath("/dashboard")
  return updated
}

// --- INGRESOS HOGAR ---
export async function getIngresos() {
  const userIds = await getAllowedUserIds()
  return db
    .select()
    .from(ingresosHogar)
    .where(inArray(ingresosHogar.userId, userIds))
    .orderBy(desc(ingresosHogar.fecha))
}

export async function createIngreso(data: {
  descripcion: string
  monto: number
  fuente?: string
  fecha: string
  periodicidad?: string
  responsable?: string
  observaciones?: string
}) {
  const userId = await getUserId()
  if (!data.descripcion.trim()) throw new Error("La descripción es obligatoria")
  if (data.monto <= 0) throw new Error("El monto debe ser mayor que cero")
  if (!data.fecha) throw new Error("La fecha es obligatoria")

  const [newIngreso] = await db
    .insert(ingresosHogar)
    .values({
      userId,
      descripcion: data.descripcion.trim(),
      monto: Math.round(data.monto),
      fuente: data.fuente?.trim() || null,
      fecha: data.fecha,
      periodicidad: data.periodicidad || "único",
      responsable: data.responsable?.trim() || null,
      observaciones: data.observaciones?.trim() || null,
    })
    .returning()

  revalidatePath("/ingresos")
  revalidatePath("/dashboard")
  return newIngreso
}

export async function deleteIngreso(id: number) {
  const userIds = await getAllowedUserIds()
  await db
    .delete(ingresosHogar)
    .where(and(inArray(ingresosHogar.userId, userIds), eq(ingresosHogar.id, id)))

  revalidatePath("/ingresos")
  revalidatePath("/dashboard")
}

export async function updateIngreso(id: number, data: {
  descripcion: string
  monto: number
  fuente?: string
  fecha: string
  periodicidad?: string
  responsable?: string
  observaciones?: string
}) {
  const userIds = await getAllowedUserIds()
  if (!data.descripcion.trim()) throw new Error("La descripción es obligatoria")
  if (data.monto <= 0) throw new Error("El monto debe ser mayor que cero")
  if (!data.fecha) throw new Error("La fecha es obligatoria")

  const [updated] = await db
    .update(ingresosHogar)
    .set({
      descripcion: data.descripcion.trim(),
      monto: Math.round(data.monto),
      fuente: data.fuente?.trim() || null,
      fecha: data.fecha,
      periodicidad: data.periodicidad || "único",
      responsable: data.responsable?.trim() || null,
      observaciones: data.observaciones?.trim() || null,
    })
    .where(and(inArray(ingresosHogar.userId, userIds), eq(ingresosHogar.id, id)))
    .returning()

  revalidatePath("/ingresos")
  revalidatePath("/dashboard")
  return updated
}

// --- PRESUPUESTOS ALIMENTACIÓN ---
export async function getPresupuestoAlimentacion(anio: number, mes: number) {
  const userIds = await getAllowedUserIds()
  const results = await db
    .select()
    .from(presupuestosAlimentacion)
    .where(
      and(
        inArray(presupuestosAlimentacion.userId, userIds),
        eq(presupuestosAlimentacion.anio, anio),
        eq(presupuestosAlimentacion.mes, mes)
      )
    )
    .limit(1)

  return results[0] || null
}

export async function setPresupuestoAlimentacion(data: {
  anio: number
  mes: number
  montoPresupuestado: number
  fechaInicio: string
  fechaRenovacion: string
}) {
  const userId = await getUserId()
  if (data.montoPresupuestado < 0) throw new Error("El presupuesto no puede ser negativo")
  if (!data.fechaInicio || !data.fechaRenovacion) {
    throw new Error("Fechas de inicio y de renovación son obligatorias")
  }

  const existing = await getPresupuestoAlimentacion(data.anio, data.mes)

  if (existing) {
    const [updated] = await db
      .update(presupuestosAlimentacion)
      .set({
        montoPresupuestado: Math.round(data.montoPresupuestado),
        fechaInicio: data.fechaInicio,
        fechaRenovacion: data.fechaRenovacion,
      })
      .where(eq(presupuestosAlimentacion.id, existing.id))
      .returning()
    
    revalidatePath("/alimentacion")
    revalidatePath("/dashboard")
    return updated
  } else {
    const [inserted] = await db
      .insert(presupuestosAlimentacion)
      .values({
        userId,
        anio: data.anio,
        mes: data.mes,
        montoPresupuestado: Math.round(data.montoPresupuestado),
        fechaInicio: data.fechaInicio,
        fechaRenovacion: data.fechaRenovacion,
      })
      .returning()
    
    revalidatePath("/alimentacion")
    revalidatePath("/dashboard")
    return inserted
  }
}

// --- GASTOS ALIMENTACIÓN ---
export async function getGastosAlimentacion(anio: number, mes: number) {
  const userIds = await getAllowedUserIds()
  
  const mesString = String(mes).padStart(2, "0")
  const startDate = `${anio}-${mesString}-01`
  const nextMonth = mes === 12 ? 1 : mes + 1
  const nextYear = mes === 12 ? anio + 1 : anio
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`

  const results = await db
    .select()
    .from(gastosAlimentacion)
    .where(
      and(
        inArray(gastosAlimentacion.userId, userIds),
        sql`${gastosAlimentacion.fecha} >= ${startDate}`,
        sql`${gastosAlimentacion.fecha} < ${endDate}`
      )
    )
    .orderBy(desc(gastosAlimentacion.fecha))

  return results
}

export async function createGastoAlimentacion(data: {
  descripcion: string
  monto: number
  categoria: string
  lugar: string
  fecha: string
}) {
  const userId = await getUserId()
  if (!data.descripcion.trim()) throw new Error("La descripción es obligatoria")
  if (data.monto <= 0) throw new Error("El monto debe ser mayor que cero")
  if (!data.fecha) throw new Error("La fecha es obligatoria")

  const [newGastoAlimentacion] = await db
    .insert(gastosAlimentacion)
    .values({
      userId,
      descripcion: data.descripcion.trim(),
      monto: Math.round(data.monto),
      categoria: data.categoria || "Supermercado",
      lugar: data.lugar.trim() || null,
      fecha: data.fecha,
    })
    .returning()

  revalidatePath("/alimentacion")
  revalidatePath("/dashboard")
  return newGastoAlimentacion
}

export async function deleteGastoAlimentacion(id: number) {
  const userIds = await getAllowedUserIds()
  await db
    .delete(gastosAlimentacion)
    .where(and(inArray(gastosAlimentacion.userId, userIds), eq(gastosAlimentacion.id, id)))

  revalidatePath("/alimentacion")
  revalidatePath("/dashboard")
}
