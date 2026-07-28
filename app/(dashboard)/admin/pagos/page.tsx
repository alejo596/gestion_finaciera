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
  if (
    user.role !== "webmaster" &&
    user.role !== "admin" &&
    user.role !== "admin_colegio" &&
    user.role !== "admin_curso" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }

  const resolvedParams = await searchParams

  const filters = {
    colegioId: resolvedParams.colegioId ? Number(resolvedParams.colegioId) : undefined,
    cursoId: resolvedParams.cursoId ? Number(resolvedParams.cursoId) : undefined,
    fechaInicio: resolvedParams.fechaInicio || undefined,
    fechaFin: resolvedParams.fechaFin || undefined,
  }

  let colegios: any[] = []
  let cursos: any[] = []
  let report: any[] = []
  if (user.role === "invitado") {
    colegios = [
      { id: 10, nombre: "Colegio Saint George" }
    ]
    cursos = [
      { id: 50, nivel: "6° Básico", letra: "B", anio: 2026 }
    ]
    report = [
      { id: 801, cuotaNombre: "Matrícula Anual", fecha: "2026-03-01", transaccionId: "TX-12839281203", metodoPago: "Webpay Plus", monto: 45000, alumnoNombre: "Sofía González", cursoNivel: "6° Básico", cursoLetra: "B", apoderadoNombre: "Usuario Invitado" }
    ]
  } else {
    const [dbColegios, dbCursos, dbReport] = await Promise.all([
      getColegios(),
      getCursos(),
      getPagosReport(filters),
    ])
    colegios = dbColegios
    cursos = dbCursos
    report = dbReport
  }

  return (
    <PagosReportContent
      colegios={colegios}
      cursos={cursos}
      report={report}
      initialFilters={filters}
    />
  )
}
