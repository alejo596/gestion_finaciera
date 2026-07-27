import { requireUser } from "@/lib/session"
import {
  getIngresos,
  getGastos,
  getCategorias,
  getPresupuestoAlimentacion,
  getGastosAlimentacion,
} from "@/lib/actions"
import { DashboardContent } from "@/app/(dashboard)/dashboard/dashboard-content"

import { redirect } from "next/navigation"

export default async function HogarDashboardPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin") {
    redirect("/dashboard")
  }

  const [ingresos, gastos, categorias] = await Promise.all([
    getIngresos(),
    getGastos(),
    getCategorias(),
  ])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [presupuestoAlimentacion, gastosAlimentacion] = await Promise.all([
    getPresupuestoAlimentacion(currentYear, currentMonth),
    getGastosAlimentacion(currentYear, currentMonth),
  ])

  return (
    <DashboardContent
      user={user}
      initialIngresos={ingresos}
      initialGastos={gastos}
      initialCategorias={categorias}
      presupuestoAlimentacion={presupuestoAlimentacion}
      gastosAlimentacion={gastosAlimentacion}
    />
  )
}
