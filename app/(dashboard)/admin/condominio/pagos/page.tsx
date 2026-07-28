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
  if (
    user.role !== "webmaster" &&
    user.role !== "admin_condominio" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }

  const resolvedParams = await searchParams

  const filters = {
    departamentoId: resolvedParams.departamentoId ? Number(resolvedParams.departamentoId) : undefined,
    fechaInicio: resolvedParams.fechaInicio || undefined,
    fechaFin: resolvedParams.fechaFin || undefined,
  }

  const isGuest = user.role === "invitado"
  let depts: any[] = []
  let report: any[] = []

  if (isGuest) {
    depts = [
      { id: 401, numero: "1203", bloque: "Torre A", copropietarioId: user.id },
      { id: 402, numero: "102", bloque: "Torre B", copropietarioId: 998 },
      { id: 403, numero: "1404", bloque: "Torre A", copropietarioId: 999 },
    ]
    report = [
      { id: 301, numero: "1203", bloque: "Torre A", cuotaNombre: "Gasto Común", fecha: "2026-07-04", transaccionId: "GC-092381283", metodoPago: "Transferencia", monto: 115000, copropietarioNombre: "Usuario Invitado" },
      { id: 302, numero: "102", bloque: "Torre B", cuotaNombre: "Gasto Común", fecha: "2026-07-10", transaccionId: "GC-092381284", metodoPago: "Webpay Plus", monto: 95000, copropietarioNombre: "Juan Pérez" },
    ]
  } else {
    const [dbDepts, dbReport] = await Promise.all([
      getDepartamentos(),
      getPagosReportCondominio(filters),
    ])
    depts = dbDepts
    report = dbReport
  }

  return (
    <CondoPagosReportContent
      depts={depts}
      report={report}
      initialFilters={filters}
    />
  )
}
