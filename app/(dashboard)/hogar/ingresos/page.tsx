import { requireUser } from "@/lib/session"
import { getIngresos } from "@/lib/actions"
import { IngresosContent } from "@/app/(dashboard)/ingresos/ingresos-content"

import { redirect } from "next/navigation"

export default async function HogarIngresosPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin") {
    redirect("/dashboard")
  }
  const ingresos = await getIngresos()

  return (
    <IngresosContent
      initialIngresos={ingresos}
    />
  )
}
