import { requireUser } from "@/lib/session"
import { db } from "@/lib/db"
import { cuotas, alumnos, colegios, cursos } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"
import { PagarContent } from "./pagar-content"

import { redirect } from "next/navigation"

export default async function PagarCuotasPage({
  searchParams,
}: {
  searchParams: Promise<{ alumnoId?: string; ids?: string }>
}) {
  const user = await requireUser()
  if (
    user.role !== "webmaster" &&
    user.role !== "admin" &&
    user.role !== "admin_colegio" &&
    user.role !== "admin_curso" &&
    user.role !== "apoderado"
  ) {
    redirect("/dashboard")
  }
  const resolvedParams = await searchParams

  const alumnoId = resolvedParams.alumnoId || ""
  const idsString = resolvedParams.ids || ""

  if (!alumnoId || !idsString) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        Carro de compras vacío o parámetros inválidos. Vuelve al panel.
      </div>
    )
  }

  const cuotaIds = idsString.split(",").map(Number).filter(Boolean)

  // Load pupil details
  const [alumno] = await db
    .select({
      id: alumnos.id,
      nombreCompleto: alumnos.nombreCompleto,
      run: alumnos.run,
      colegioNombre: colegios.nombre,
      cursoNivel: cursos.nivel,
      cursoNombre: cursos.nombre,
    })
    .from(alumnos)
    .innerJoin(colegios, eq(alumnos.colegioId, colegios.id))
    .innerJoin(cursos, eq(alumnos.cursoId, cursos.id))
    .where(eq(alumnos.id, alumnoId))
    .limit(1)

  if (!alumno) {
    return (
      <div className="py-8 text-center text-xs text-rose-500">
        Alumno no encontrado en los registros.
      </div>
    )
  }

  // Load details of selected cuotas
  const selectedCuotas = await db
    .select()
    .from(cuotas)
    .where(inArray(cuotas.id, cuotaIds))

  return (
    <PagarContent
      alumno={alumno}
      initialCuotas={selectedCuotas}
    />
  )
}
