import { requireUser } from "@/lib/session"
import { getDepartamentos, getPagosReportCondominio } from "@/lib/actions-condo"
import { CondoPagosReportContent } from "./condo-pagos-content"
import { redirect } from "next/navigation"

export default async function AdminCondoPagosPage({
  searchParams,
}: {
  searchParams: Promise<{
    departamentoId?: string
    fechaInicio?: string
    fechaFin?: string
  }>
}) {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin_condominio") {
    redirect("/dashboard")
  }

  const resolvedParams = await searchParams

  const filters = {
    departamentoId: resolvedParams.departamentoId ? Number(resolvedParams.departamentoId) : undefined,
    fechaInicio: resolvedParams.fechaInicio || undefined,
    fechaFin: resolvedParams.fechaFin || undefined,
  }

  const [depts, report] = await Promise.all([
    getDepartamentos(),
    getPagosReportCondominio(filters),
  ])

  return (
    <CondoPagosReportContent
      depts={depts}
      report={report}
      initialFilters={filters}
    />
  )
}
