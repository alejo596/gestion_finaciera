import { requireUser } from "@/lib/session"
import { getPresupuestoAlimentacion, getGastosAlimentacion } from "@/lib/actions"
import { AlimentacionContent } from "@/app/(dashboard)/alimentacion/alimentacion-content"

import { redirect } from "next/navigation"

export default async function HogarAlimentacionPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>
}) {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin") {
    redirect("/dashboard")
  }

  const resolvedParams = await searchParams
  const now = new Date()
  const anio = resolvedParams.anio ? Number(resolvedParams.anio) : now.getFullYear()
  const mes = resolvedParams.mes ? Number(resolvedParams.mes) : now.getMonth() + 1

  const [presupuesto, gastos] = await Promise.all([
    getPresupuestoAlimentacion(anio, mes),
    getGastosAlimentacion(anio, mes),
  ])

  return (
    <AlimentacionContent
      anio={anio}
      mes={mes}
      initialPresupuesto={presupuesto}
      initialGastos={gastos}
    />
  )
}
