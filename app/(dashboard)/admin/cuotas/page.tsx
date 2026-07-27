import { requireUser } from "@/lib/session"
import { getCuotas, getCursos, getMetas } from "@/lib/actions-school"
import { CuotasMetasContent } from "./cuotas-metas-content"
import { redirect } from "next/navigation"

export default async function AdminCuotasPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin" && user.role !== "admin_colegio" && user.role !== "admin_curso") {
    redirect("/dashboard")
  }

  const [cuotasList, cursosList, metasList] = await Promise.all([
    getCuotas(),
    getCursos(),
    getMetas(),
  ])

  return (
    <CuotasMetasContent
      initialCuotas={cuotasList}
      cursos={cursosList}
      initialMetas={metasList}
    />
  )
}
