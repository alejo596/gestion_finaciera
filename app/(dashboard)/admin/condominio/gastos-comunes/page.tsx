import { requireUser } from "@/lib/session"
import { getGastosComunes, getGastosCondominio } from "@/lib/actions-condo"
import { GastosComunesContent } from "./gc-content"
import { redirect } from "next/navigation"

export default async function AdminGastosComunesPage() {
  const user = await requireUser()
  if (
    user.role !== "webmaster" &&
    user.role !== "admin_condominio" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }

  const isGuest = user.role === "invitado"
  let gcList: any[] = []
  let expList: any[] = []

  if (isGuest) {
    gcList = [
      { id: 501, numero: "1203", bloque: "Torre A", mes: 7, anio: 2026, fechaVencimiento: "2026-08-05", monto: 120000, estado: "pendiente", departamentoId: 401 },
      { id: 502, numero: "102", bloque: "Torre B", mes: 7, anio: 2026, fechaVencimiento: "2026-08-05", monto: 95000, estado: "pagado", transaccionId: "GC-092381284", fechaPago: "2026-07-10", metodoPago: "Webpay Plus", departamentoId: 402 },
      { id: 503, numero: "1404", bloque: "Torre A", mes: 6, anio: 2026, fechaVencimiento: "2026-07-05", monto: 135000, estado: "pendiente", departamentoId: 403 },
    ]
    expList = [
      { id: 201, descripcion: "Mantención de Ascensores Otis", monto: 180000, categoria: "Mantenimiento Ascensores", fecha: "2026-07-15" },
      { id: 202, descripcion: "Pago de Remuneración Conserjes", monto: 1450000, categoria: "Conserjería y Personal", fecha: "2026-07-05" }
    ]
  } else {
    const [dbGcList, dbExpList] = await Promise.all([
      getGastosComunes(),
      getGastosCondominio(),
    ])
    gcList = dbGcList
    expList = dbExpList
  }

  return (
    <GastosComunesContent
      initialGastosComunes={gcList}
      initialEgresosCondo={expList}
    />
  )
}
