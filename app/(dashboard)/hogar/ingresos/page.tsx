import { requireUser } from "@/lib/session"
import { getIngresos } from "@/lib/actions"
import { IngresosContent } from "@/app/(dashboard)/ingresos/ingresos-content"
import { redirect } from "next/navigation"

export default async function HogarIngresosPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin" && user.role !== "invitado") {
    redirect("/dashboard")
  }
  
  let ingresos: any[] = []

  if (user.role === "invitado") {
    const now = new Date()
    const currentMonthPref = now.toISOString().substring(0, 7) // "YYYY-MM"
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthPref = prevMonth.toISOString().substring(0, 7)

    ingresos = [
      { id: 1001, descripcion: "Sueldo Líquido Apoderado", monto: 1450000, fuente: "Global Corp SpA", fecha: `${currentMonthPref}-05`, periodicidad: "recurrente" },
      { id: 1002, descripcion: "Proyecto Freelance UI", monto: 350000, fuente: "Cliente Particular", fecha: `${currentMonthPref}-15`, periodicidad: "único" },
      { id: 1003, descripcion: "Sueldo Líquido Apoderado", monto: 1450000, fuente: "Global Corp SpA", fecha: `${prevMonthPref}-05`, periodicidad: "recurrente" },
    ]
  } else {
    ingresos = await getIngresos()
  }

  return (
    <IngresosContent
      initialIngresos={ingresos}
    />
  )
}
