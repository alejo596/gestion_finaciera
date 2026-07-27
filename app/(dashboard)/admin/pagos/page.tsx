import { requireUser } from "@/lib/session"
import { getColegios, getCursos, getPagosReport } from "@/lib/actions-school"
import { PagosReportContent } from "./pagos-report-content"
import { redirect } from "next/navigation"

export default async function AdminPagosPage({
  searchParams,
}: {
  searchParams: Promise<{
    colegioId?: string
    cursoId?: string
    fechaInicio?: string
    fechaFin?: string
  }>
}) {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin" && user.role !== "admin_colegio" && user.role !== "admin_curso") {
    redirect("/dashboard")
  }

  const resolvedParams = await searchParams

  const filters = {
    colegioId: resolvedParams.colegioId ? Number(resolvedParams.colegioId) : undefined,
    cursoId: resolvedParams.cursoId ? Number(resolvedParams.cursoId) : undefined,
    fechaInicio: resolvedParams.fechaInicio || undefined,
    fechaFin: resolvedParams.fechaFin || undefined,
  }

  const [colegios, cursos, report] = await Promise.all([
    getColegios(),
    getCursos(),
    getPagosReport(filters),
  ])

  return (
    <PagosReportContent
      colegios={colegios}
      cursos={cursos}
      report={report}
      initialFilters={filters}
    />
  )
}
