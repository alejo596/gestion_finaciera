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
  if (user.role !== "webmaster" && user.role !== "admin" && user.role !== "invitado") {
    redirect("/dashboard")
  }

  const resolvedParams = await searchParams
  const now = new Date()
  const anio = resolvedParams.anio ? Number(resolvedParams.anio) : now.getFullYear()
  const mes = resolvedParams.mes ? Number(resolvedParams.mes) : now.getMonth() + 1

  let presupuesto = null
  let gastos: any[] = []

  if (user.role === "invitado") {
    const currentMonthPref = `${anio}-${String(mes).padStart(2, "0")}`
    presupuesto = {
      id: 999,
      anio,
      mes,
      montoPresupuestado: 250000,
      fechaInicio: `${currentMonthPref}-01`,
      fechaRenovacion: `${currentMonthPref}-28`,
    }

    gastos = [
      { id: 2002, descripcion: "Compras Supermercado Jumbo", monto: 165000, fecha: `${currentMonthPref}-10`, categoriaId: 103, local: "Jumbo", categoria: "Supermercado" },
      { id: 2020, descripcion: "Feria de Verduras", monto: 20000, fecha: `${currentMonthPref}-12`, categoriaId: 103, local: "Feria Local", categoria: "Feria" },
    ]
  } else {
    const [dbPresupuesto, dbGastos] = await Promise.all([
      getPresupuestoAlimentacion(anio, mes),
      getGastosAlimentacion(anio, mes),
    ])
    presupuesto = dbPresupuesto
    gastos = dbGastos
  }

  return (
    <AlimentacionContent
      anio={anio}
      mes={mes}
      initialPresupuesto={presupuesto}
      initialGastos={gastos}
    />
  )
}
