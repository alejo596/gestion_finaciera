import { requireUser } from "@/lib/session"
import { getAlumnos, getCursos, getColegios, getApoderados } from "@/lib/actions-school"
import { AlumnosContent } from "./alumnos-content"
import { redirect } from "next/navigation"

export default async function AdminAlumnosPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin" && user.role !== "admin_colegio" && user.role !== "admin_curso") {
    redirect("/dashboard")
  }

  const [alumnosList, cursosList, colegiosList, apoderadosList] = await Promise.all([
    getAlumnos(),
    getCursos(),
    getColegios(),
    getApoderados(),
  ])

  return (
    <AlumnosContent
      initialAlumnos={alumnosList}
      cursos={cursosList}
      colegios={colegiosList}
      apoderados={apoderadosList}
    />
  )
}
