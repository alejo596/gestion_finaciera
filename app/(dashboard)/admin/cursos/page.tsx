import { requireUser } from "@/lib/session"
import { getCursos, getColegios } from "@/lib/actions-school"
import { CursosContent } from "./cursos-content"
import { redirect } from "next/navigation"

export default async function AdminCursosPage() {
  const user = await requireUser()
  if (
    user.role !== "webmaster" &&
    user.role !== "admin" &&
    user.role !== "admin_colegio" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }

  let cursosList: any[] = []
  let colegiosList: any[] = []
  if (user.role === "invitado") {
    colegiosList = [
      { id: 10, nombre: "Colegio Saint George" }
    ]
    cursosList = [
      { id: 50, nivel: "6° Básico", letra: "B", anio: 2026, colegioId: 10, colegioNombre: "Colegio Saint George" }
    ]
  } else {
    const [dbCursos, dbColegios] = await Promise.all([
      getCursos(),
      getColegios(),
    ])
    cursosList = dbCursos
    colegiosList = dbColegios
  }

  return (
    <CursosContent
      initialCursos={cursosList}
      colegios={colegiosList}
    />
  )
}
