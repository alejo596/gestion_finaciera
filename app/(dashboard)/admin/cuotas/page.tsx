import { requireUser } from "@/lib/session"
import { getCuotas, getCursos, getMetas } from "@/lib/actions-school"
import { CuotasMetasContent } from "./cuotas-metas-content"
import { redirect } from "next/navigation"

export default async function AdminCuotasPage() {
  const user = await requireUser()
  if (
    user.role !== "webmaster" &&
    user.role !== "admin" &&
    user.role !== "admin_colegio" &&
    user.role !== "admin_curso" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }

  let cuotasList: any[] = []
  let cursosList: any[] = []
  let metasList: any[] = []
  if (user.role === "invitado") {
    cuotasList = [
      { id: 901, nombre: "Cuota Incorporación Centro Padres", monto: 15000, fechaVencimiento: "2026-03-31", cursoId: 50, cursoNivel: "6° Básico", cursoLetra: "B" },
      { id: 902, nombre: "Cuota Mensual Paseo Fin de Año", monto: 20000, fechaVencimiento: "2026-08-31", cursoId: 50, cursoNivel: "6° Básico", cursoLetra: "B" },
    ]
    cursosList = [
      { id: 50, nivel: "6° Básico", letra: "B", anio: 2026 }
    ]
    metasList = [
      { id: 701, nombre: "Fondo Paseo de Curso Valparaíso", objetivo: 1500000, recaudado: 950000, descripcion: "Recaudación para costear el bus y almuerzo de los alumnos", cursoId: 50, cursoNivel: "6° Básico", cursoLetra: "B", activa: true }
    ]
  } else {
    const [dbCuotas, dbCursos, dbMetas] = await Promise.all([
      getCuotas(),
      getCursos(),
      getMetas(),
    ])
    
    if (user.role === "admin_curso") {
      const { db } = await import("@/lib/db")
      const { cursoAdmins } = await import("@/lib/db/schema")
      const { eq } = await import("drizzle-orm")
      
      const assignments = await db.select().from(cursoAdmins).where(eq(cursoAdmins.userId, user.id))
      const allowedCursoIds = assignments.map((a) => a.cursoId)
      
      cursosList = dbCursos.filter((c) => allowedCursoIds.includes(c.id))
      cuotasList = dbCuotas.filter((c) => allowedCursoIds.includes(c.cursoId))
      metasList = dbMetas.filter((m) => allowedCursoIds.includes(m.cursoId))
    } else {
      cuotasList = dbCuotas
      cursosList = dbCursos
      metasList = dbMetas
    }
  }

  return (
    <CuotasMetasContent
      initialCuotas={cuotasList}
      cursos={cursosList}
      initialMetas={metasList}
    />
  )
}
