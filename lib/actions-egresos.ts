"use server"

import { db } from "@/lib/db"
import {
  egresosCurso,
  pagosCuota,
  alumnos,
  user,
} from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// --- EGRESOS DEL CURSO ---
export async function getEgresosCurso(cursoId: number) {
  return db
    .select()
    .from(egresosCurso)
    .where(eq(egresosCurso.cursoId, cursoId))
    .orderBy(desc(egresosCurso.fecha))
}

export async function createEgresoCurso(data: {
  cursoId: number
  descripcion: string
  monto: number
  fecha: string
  observaciones?: string
}) {
  if (!data.cursoId || !data.descripcion.trim() || !data.monto || !data.fecha) {
    throw new Error("Por favor completa los campos requeridos para el egreso del curso")
  }

  const [newEgreso] = await db
    .insert(egresosCurso)
    .values({
      cursoId: data.cursoId,
      descripcion: data.descripcion.trim(),
      monto: Math.round(data.monto),
      fecha: data.fecha,
      observaciones: data.observaciones?.trim() || null,
      comprobanteUrl: "simulado_factura_" + Date.now() + ".pdf", // Simulación de boleta/factura subida
    })
    .returning()

  revalidatePath("/admin/cuotas")
  revalidatePath("/colegio/dashboard")
  return newEgreso
}

// --- ALUMNOS QUE HAN PAGADO UNA CUOTA ---
export async function getAlumnosPagadosCuota(cuotaId: number) {
  return db
    .select({
      id: alumnos.id,
      nombreCompleto: alumnos.nombreCompleto,
      run: alumnos.run,
      fechaPago: pagosCuota.fecha,
      transaccionId: pagosCuota.transaccionId,
      metodoPago: pagosCuota.metodoPago,
      monto: pagosCuota.monto,
      apoderadoNombre: user.name,
    })
    .from(pagosCuota)
    .innerJoin(alumnos, eq(pagosCuota.alumnoId, alumnos.id))
    .innerJoin(user, eq(pagosCuota.apoderadoId, user.id))
    .where(and(eq(pagosCuota.cuotaId, cuotaId), eq(pagosCuota.estado, "aprobado")))
    .orderBy(desc(pagosCuota.fecha))
}
