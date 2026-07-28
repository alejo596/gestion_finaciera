import { requireUser } from "@/lib/session"
import { getAlumnos, getCursos, getColegios, getApoderados } from "@/lib/actions-school"
import { AlumnosContent } from "./alumnos-content"
import { redirect } from "next/navigation"

export default async function AdminAlumnosPage() {
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

  let alumnosList: any[] = []
  let cursosList: any[] = []
  let colegiosList: any[] = []
  let apoderadosList: any[] = []
  if (user.role === "invitado") {
    alumnosList = [
      { id: "12345678-9", nombreCompleto: "Sofía González", run: "12345678-9", cursoId: 50, colegioId: 10, apoderadoId: user.id, apoderadoNombre: "Usuario Invitado", colegioNombre: "Colegio Saint George", cursoNivel: "6° Básico", cursoLetra: "B" }
    ]
    cursosList = [
      { id: 50, nivel: "6° Básico", letra: "B", anio: 2026 }
    ]
    colegiosList = [
      { id: 10, nombre: "Colegio Saint George" }
    ]
    apoderadosList = [
      { id: user.id, name: "Usuario Invitado", email: user.email }
    ]
  } else {
    const [dbAlumnos, dbCursos, dbColegios, dbApoderados] = await Promise.all([
      getAlumnos(),
      getCursos(),
      getColegios(),
      getApoderados(),
    ])
    alumnosList = dbAlumnos
    cursosList = dbCursos
    colegiosList = dbColegios
    apoderadosList = dbApoderados
  }

  return (
    <AlumnosContent
      initialAlumnos={alumnosList}
      cursos={cursosList}
      colegios={colegiosList}
      apoderados={apoderadosList}
    />
  )
}
