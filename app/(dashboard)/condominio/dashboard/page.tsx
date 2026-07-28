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
  if (
    user.role !== "webmaster" &&
    user.role !== "copropietario" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }

  const isGuest = user.role === "invitado"

  let userDepts: any[] = []
  let pending: any[] = []
  let paid: any[] = []
  let buildingEgresos: any[] = []

  if (isGuest) {
    userDepts = [
      { id: 401, numero: "1203", bloque: "Torre A", copropietarioId: user.id }
    ]

    pending = [
      { id: 501, numero: "1203", bloque: "Torre A", mes: 7, anio: 2026, fechaVencimiento: "2026-08-05", monto: 120000 }
    ]

    paid = [
      { id: 301, numero: "1203", bloque: "Torre A", cuotaNombre: "Gasto Común", fecha: "2026-07-04", transaccionId: "GC-092381283", metodoPago: "Transferencia", monto: 115000 }
    ]

    buildingEgresos = [
      { id: 201, descripcion: "Mantención de Ascensores Otis", monto: 180000, categoria: "Mantenimiento Ascensores", fecha: "2026-07-15" },
      { id: 202, descripcion: "Pago de Remuneración Conserjes", monto: 1450000, categoria: "Conserjería y Personal", fecha: "2026-07-05" }
    ]
  } else {
    const [allDepts, dbPending, dbPaid, dbBuildingEgresos] = await Promise.all([
      getDepartamentos(),
      getGastosComunesPendientesCopropietario(user.id),
      getComprobantesPagoCondominio(user.id),
      getGastosCondominio(),
    ])
    
    userDepts = allDepts.filter((d) => d.copropietarioId === user.id)
    pending = dbPending
    paid = dbPaid
    buildingEgresos = dbBuildingEgresos
  }

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
