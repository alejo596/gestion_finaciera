import { requireUser } from "@/lib/session"
import { getCursos, getColegios } from "@/lib/actions-school"
import { CursosContent } from "./cursos-content"
import { redirect } from "next/navigation"

export default async function AdminCursosPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin" && user.role !== "admin_colegio") {
    redirect("/dashboard")
  }

  const [cursosList, colegiosList] = await Promise.all([
    getCursos(),
    getColegios(),
  ])

  return (
    <CursosContent
      initialCursos={cursosList}
      colegios={colegiosList}
    />
  )
}
