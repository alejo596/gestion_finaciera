import { requireUser } from "@/lib/session"
import {
  getDepartamentos,
  getGastosComunesPendientesCopropietario,
  getComprobantesPagoCondominio,
  getGastosCondominio,
} from "@/lib/actions-condo"
import { CondoDashboardContent } from "./condo-dashboard-content"

import { redirect } from "next/navigation"

export default async function CondoDashboardPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "copropietario") {
    redirect("/dashboard")
  }

  const [allDepts, pending, paid, buildingEgresos] = await Promise.all([
    getDepartamentos(),
    getGastosComunesPendientesCopropietario(user.id),
    getComprobantesPagoCondominio(user.id),
    getGastosCondominio(),
  ])

  // Filtrar depts del usuario
  const userDepts = allDepts.filter((d) => d.copropietarioId === user.id)

  return (
    <CondoDashboardContent
      user={user}
      depts={userDepts}
      pending={pending}
      paid={paid}
      buildingEgresos={buildingEgresos}
    />
  )
}
