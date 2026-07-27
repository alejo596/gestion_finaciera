import { requireUser } from "@/lib/session"
import { getPresupuestoAlimentacion, getGastosAlimentacion } from "@/lib/actions"
import { AlimentacionContent } from "./alimentacion-content"

export default async function AlimentacionPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>
}) {
  // Asegura que el usuario esté logueado
  await requireUser()

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
